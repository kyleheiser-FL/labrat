import * as scheduleFunctions from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

const RETENTION_DAYS = 30;

// Prune location history older than 30 days — runs daily at 3am UTC
export const pruneLocationHistory = scheduleFunctions.onSchedule(
  { schedule: '0 3 * * *', timeZone: 'UTC' },
  async () => {
    const db = admin.firestore();
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

    const locationsSnap = await db.collection('locations').get();

    for (const locationDoc of locationsSnap.docs) {
      const userId = locationDoc.id;
      const historyRef = db.collection(`locations/${userId}/history`);
      const oldSnap = await historyRef
        .where('timestamp', '<', cutoff)
        .limit(500)
        .get();

      if (oldSnap.empty) continue;

      const batch = db.batch();
      oldSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      console.log(`[prune] Deleted ${oldSnap.size} history points for user ${userId}`);
    }
  },
);
