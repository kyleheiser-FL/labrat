import * as scheduleFunctions from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

// Weekly family digest — every Sunday at 9am UTC
export const weeklyDigest = scheduleFunctions.onSchedule(
  { schedule: '0 9 * * 0', timeZone: 'UTC' },
  async () => {
    const db = admin.firestore();
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const familiesSnap = await db.collection('families').get();

    for (const familyDoc of familiesSnap.docs) {
      const family = familyDoc.data();
      const familyId = familyDoc.id;

      // Completed tasks this week
      const tasksSnap = await db.collection('familyTasks')
        .where('familyId', '==', familyId)
        .where('completed', '==', true)
        .where('completedAt', '>=', weekAgo)
        .get();

      // Upcoming events next 7 days
      const eventsSnap = await db.collection('familyEvents')
        .where('familyId', '==', familyId)
        .where('startDate', '>=', now)
        .where('startDate', '<=', now + 7 * 24 * 60 * 60 * 1000)
        .get();

      const completedCount = tasksSnap.size;
      const upcomingCount = eventsSnap.size;

      if (completedCount === 0 && upcomingCount === 0) continue;

      // Get all member FCM tokens
      const membersSnap = await db.collection(`families/${familyId}/members`).get();
      const memberIds = membersSnap.docs.map(d => d.id);

      const tokenDocs = await Promise.all(
        memberIds.map(uid => db.doc(`pushProfiles/${uid}`).get()),
      );
      const allTokens = tokenDocs.flatMap(d => d.data()?.tokens ?? []);
      if (!allTokens.length) continue;

      const parts: string[] = [];
      if (completedCount > 0) parts.push(`${completedCount} task${completedCount > 1 ? 's' : ''} completed`);
      if (upcomingCount > 0) parts.push(`${upcomingCount} event${upcomingCount > 1 ? 's' : ''} coming up`);

      try {
        await admin.messaging().sendEachForMulticast({
          tokens: allTokens,
          notification: {
            title: `${family.name} Weekly Recap`,
            body: parts.join(' · '),
          },
          data: { type: 'weekly_digest', familyId },
        });
      } catch (err) {
        console.error(`[digest] FCM failed for family ${familyId}:`, err);
      }
    }
  },
);
