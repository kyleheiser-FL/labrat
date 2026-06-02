import * as functions from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Triggered when a friend request is created — send a push notification to the recipient
export const onFriendConnectionCreate = functions.onDocumentCreated(
  'friendConnections/{connectionId}',
  async event => {
    const data = event.data?.data();
    if (!data || data.status !== 'pending') return;

    const recipientId = data.userIds.find((id: string) => id !== data.initiatedBy);
    if (!recipientId) return;

    const profileSnap = await admin.firestore().doc(`pushProfiles/${recipientId}`).get();
    const tokens: string[] = profileSnap.data()?.tokens ?? [];
    if (!tokens.length) return;

    const senderSnap = await admin.firestore().doc(`users/${data.initiatedBy}`).get();
    const senderName = senderSnap.data()?.displayName ?? 'Someone';

    try {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: 'New Friend Request',
          body: `${senderName} wants to be your friend on CirclSquad`,
        },
        data: {
          type: 'friend_request',
          connectionId: event.params.connectionId,
        },
      });
    } catch (err) {
      console.error('[geofence] FCM send failed:', err);
    }
  },
);
