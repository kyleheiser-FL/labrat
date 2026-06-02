import * as functions from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { Client } from '@googlemaps/google-maps-services-js';
import { haversineDistance } from '@cozy-lantern/shared';

const mapsClient = new Client();
const GEOCODE_MIN_MOVE_METERS = 50;
const GEOCODE_MIN_INTERVAL_MS = 60_000;

export const onLocationWrite = functions.onDocumentWritten(
  'locations/{userId}',
  async event => {
    const after = event.data?.after?.data();
    const before = event.data?.before?.data();
    if (!after) return;

    // Skip if this write was triggered by this same function (address already set this cycle)
    const now = Date.now();
    if (before?.address && before?.updatedAt) {
      const timeSinceLast = now - before.updatedAt;
      const distanceMoved = haversineDistance(
        before.lat, before.lng,
        after.lat, after.lng,
      );
      if (timeSinceLast < GEOCODE_MIN_INTERVAL_MS && distanceMoved < GEOCODE_MIN_MOVE_METERS) {
        return;
      }
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    try {
      const response = await mapsClient.reverseGeocode({
        params: {
          latlng: { lat: after.lat, lng: after.lng },
          key: apiKey,
        },
      });

      const address = response.data.results[0]?.formatted_address;
      if (!address) return;

      const userId = event.params.userId;
      await admin.firestore().doc(`locations/${userId}`).update({
        address,
        updatedAt: now,
      });
    } catch (err) {
      console.error('[geocode] Failed:', err);
    }
  },
);
