import express from "express";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from "firebase-admin/app";
import { getMessaging as getAdminMessaging } from "firebase-admin/messaging";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import {
  computePriceBook, computeWholesaleBook, DEFAULT_MARKUPS,
  type PricingMarkups, type PriceOverride,
} from "./server/pricingData";
import { SAMPLE_INVENTORY } from "./src/data/shopInventory";
import { sanitizeCompounds, sanitizeDoseLogs } from "./server/pipContext";

const app = express();
const PORT = 3000;

// Re-route Firebase auth flows through the custom domain proxy
app.use(
  "/__/auth",
  createProxyMiddleware({
    target: `https://${firebaseConfig.authDomain}`,
    changeOrigin: true,
  })
);

// Firebase Admin SDK — initialized lazily so missing credentials don't crash non-admin endpoints.
// Accepts the service account as base64 (FIREBASE_SERVICE_ACCOUNT_BASE64) or
// raw JSON (either var) so setup doesn't require an encoding step.
function getAdminApp() {
  if (getAdminApps().length > 0) return getAdminApps()[0];
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (!raw) return null;
  let jsonStr = raw;
  if (!jsonStr.startsWith('{')) {
    try {
      jsonStr = Buffer.from(jsonStr, 'base64').toString('utf-8');
    } catch { /* fall through — JSON.parse below reports the failure */ }
  }
  try {
    const serviceAccount = JSON.parse(jsonStr);
    return initAdminApp({ credential: cert(serviceAccount) });
  } catch (e) {
    console.error('[Admin] Failed to initialize Firebase Admin (set FIREBASE_SERVICE_ACCOUNT_BASE64 to the service account JSON, base64-encoded or raw):', e);
    return null;
  }
}

const ADMIN_EMAIL = 'kyleheiser@gmail.com';

// Verify the caller's Firebase ID token. Returns the decoded token, or null if
// invalid/missing. When the Admin SDK has no credentials (local dev), returns
// a stub so dev isn't blocked — production on Vercel always has credentials.
async function verifyFirebaseToken(req: express.Request): Promise<{ uid: string; email: string } | null> {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return null;
  const adminApp = getAdminApp();
  if (!adminApp) return { uid: 'dev', email: '' };
  try {
    const { getAuth: getAdminAuth } = await import('firebase-admin/auth');
    const decoded = await getAdminAuth(adminApp).verifyIdToken(token);
    return { uid: decoded.uid, email: (decoded.email || '').toLowerCase() };
  } catch {
    return null;
  }
}

// Simple in-memory sliding-window rate limiter (per key, e.g. IP or uid)
const rateBuckets = new Map<string, number[]>();
function rateLimited(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const hits = (rateBuckets.get(key) || []).filter(t => t > windowStart);
  if (hits.length >= maxPerMinute) { rateBuckets.set(key, hits); return true; }
  hits.push(now);
  rateBuckets.set(key, hits);
  // Opportunistic cleanup so the map doesn't grow unbounded
  if (rateBuckets.size > 5000) {
    for (const [k, v] of rateBuckets) {
      if (v.every(t => t <= windowStart)) rateBuckets.delete(k);
    }
  }
  return false;
}

// Middleware
app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    // adminCredsPresent = env var exists; adminReady = key parsed and SDK initialized.
    // Present-but-not-ready means the value is malformed (truncated paste, wrong content).
    const adminCredsPresent = !!(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const checks = {
      adminCredsPresent,
      adminReady: !!getAdminApp(),
      cronSecretSet: !!process.env.CRON_SECRET,
      vapidKeySet: !!process.env.VITE_FCM_VAPID_KEY,
    };

    // Browsers get a readable status page; API callers get JSON
    if ((req.headers.accept || '').includes('text/html')) {
      const row = (label: string, ok: boolean, okText: string, badText: string) => `
        <div class="row ${ok ? 'ok' : 'bad'}">
          <span class="icon">${ok ? '✅' : '❌'}</span>
          <div>
            <div class="label">${label}</div>
            <div class="detail">${ok ? okText : badText}</div>
          </div>
        </div>`;
      res.type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LabRat System Status</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background: #0b1120; color: #e2e8f0; margin: 0; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #64748b; font-size: 13px; margin-bottom: 24px; }
  .row { display: flex; gap: 14px; align-items: flex-start; background: #131c31; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
  .row.bad { border-color: #7f1d1d; background: #1c1017; }
  .icon { font-size: 22px; line-height: 1.2; }
  .label { font-weight: 700; font-size: 15px; }
  .detail { color: #94a3b8; font-size: 13px; margin-top: 3px; line-height: 1.5; }
  .bad .detail { color: #fca5a5; }
  .ts { color: #475569; font-size: 11px; margin-top: 20px; }
</style>
</head>
<body>
<h1>🔬 LabRat System Status</h1>
<div class="sub">www.labratapp.app server health</div>
${row('Orders &amp; Pricing (Firebase Admin)', checks.adminReady,
  'Service account key loaded — checkout, live pricing, and push notifications are operational.',
  checks.adminCredsPresent
    ? 'Key variable found but the value could not be parsed. Re-paste the full service account JSON (starts with {"type": "service_account").'
    : 'No service account key found. Add FIREBASE_SERVICE_ACCOUNT_JSON in Vercel → Settings → Environment Variables (Production), then redeploy.')}
${row('Dose Reminder Cron', checks.cronSecretSet,
  'CRON_SECRET configured — scheduled reminders can run.',
  'CRON_SECRET is not set. Scheduled dose reminders are disabled until it is added.')}
${row('Push Registration (VAPID)', checks.vapidKeySet,
  'VITE_FCM_VAPID_KEY configured — devices can register for background push.',
  'VITE_FCM_VAPID_KEY is not set. No device can register a push token, so background notifications never deliver. Get the key from Firebase Console → Project settings → Cloud Messaging → Web Push certificates, add it in Vercel env vars, and redeploy.')}
<div class="ts">Checked ${new Date().toISOString()}</div>
</body>
</html>`);
      return;
    }

    res.json({ status: "ok", ...checks, timestamp: new Date().toISOString() });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scheduled reminder sender — called by Vercel Cron every 5 minutes
  // Reads pushProfiles/{uid} from Firestore and sends FCM when time matches
  // ──────────────────────────────────────────────────────────────────────────
  app.get("/api/send-reminders", async (req, res) => {
    // Verify Vercel cron secret — fail closed if it isn't configured so this
    // endpoint is never publicly triggerable.
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return res.status(503).json({ error: 'CRON_SECRET not configured' });
    }
    // Accept the secret via the Authorization header (GitHub Actions) OR a ?key=
    // query param. The query param survives apex→www redirects (external cron
    // services drop the Authorization header on cross-host redirects), so a
    // plain GET URL from cron-job.org just works.
    const provided = (req.headers.authorization || '').replace('Bearer ', '')
      || (typeof req.query.key === 'string' ? req.query.key : '');
    if (provided !== cronSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const adminApp = getAdminApp();
    if (!adminApp) {
      return res.status(503).json({ error: 'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64.' });
    }

    const firestore = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
    const fcmMessaging = getAdminMessaging(adminApp);

    const nowUtc = new Date();
    // The app runs on New York (US Eastern) time with automatic DST, so reminder
    // times and the per-day guard are evaluated against NY wall-clock for everyone.
    const nyParts = (() => {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).formatToParts(nowUtc);
      const get = (t: string) => parts.find(p => p.type === t)?.value || '00';
      let hh = parseInt(get('hour'), 10); if (hh === 24) hh = 0; // ICU midnight quirk
      return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: hh * 60 + parseInt(get('minute'), 10) };
    })();
    const nowNyMinutes = nyParts.minutes;
    const todayStr = nyParts.date;

    // Catch-up semantics: send once the reminder time has PASSED (within a
    // grace period) rather than matching a narrow window around it. The cron
    // polls hourly (GitHub Actions, best-effort timing), so the poll rarely
    // lands near the exact minute — but the per-day pushGuard dedupes, so
    // "time passed && not sent today" delivers exactly once, at most ~an hour
    // late. Grace covers the poll interval plus scheduler jitter; beyond it
    // the reminder is considered stale and skipped for the day.
    const REMINDER_GRACE_MIN = 90;

    let sent = 0;
    let errors = 0;
    // Diagnostics returned to the (authenticated) cron caller so delivery
    // problems are visible in the workflow logs instead of a silent sent:0.
    const diag: any[] = [];

    try {
      // Fetch ALL profiles: per-compound reminders should fire even when the
      // master daily-reminder toggle is off — that toggle only gates the
      // generic daily nudge below.
      const profilesSnap = await firestore.collection('pushProfiles').get();

      for (const profileDoc of profilesSnap.docs) {
        const uid = profileDoc.id;
        const profile = profileDoc.data();
        const tokens: string[] = profile.fcmTokens || [];

        // The app operates on New York time — evaluate every reminder against
        // NY wall-clock regardless of the user's device timezone.
        const userLocalMinutes = nowNyMinutes;

        diag.push({
          uid: uid.slice(0, 6),
          tokens: tokens.length,
          reminderEnabled: !!profile.reminderEnabled,
          reminderTime: profile.reminderTime || null,
          nyTime: `${String(Math.floor(userLocalMinutes / 60)).padStart(2, '0')}:${String(userLocalMinutes % 60).padStart(2, '0')}`,
          compounds: (profile.compounds || []).map((c: any) => ({ name: c.name, time: c.reminderTime })),
        });

        if (tokens.length === 0) continue;

        // Check daily reminder time (only when the master toggle is on)
        const reminderTime: string = profile.reminderTime || '';
        if (profile.reminderEnabled && reminderTime && /^\d{1,2}:\d{2}$/.test(reminderTime)) {
          const [rh, rm] = reminderTime.split(':').map(Number);
          const targetMinutes = rh * 60 + rm;
          const diff = userLocalMinutes - targetMinutes;
          if (diff >= 0 && diff < REMINDER_GRACE_MIN) {
            const normalizedTime = `${String(rh).padStart(2, '0')}${String(rm).padStart(2, '0')}`;
            const guardId = `${uid}_daily_${todayStr}_${normalizedTime}`;
            const guardRef = firestore.collection('pushGuards').doc(guardId);
            const guardSnap = await guardRef.get();
            if (!guardSnap.exists) {
              for (const token of tokens) {
                try {
                  const title = '🔬 LabRat Dose Reminder';
                  const body = "Time to record today's scheduled administrations.";
                  await fcmMessaging.send({
                    token,
                    notification: { title, body },
                    // Include both notification + data: Android/Chrome can use
                    // Firebase's native background display path, while the app
                    // still receives data in foreground.
                    data: {
                      title,
                      body,
                      tag: 'labrat-reminder-daily',
                      icon: '/icon_192.png',
                    },
                    android: { priority: 'high' },
                    webpush: {
                      headers: { Urgency: 'high', TTL: '86400' },
                      notification: {
                        title,
                        body,
                        icon: '/icon_192.png',
                        badge: '/icon_96.png',
                        tag: 'labrat-reminder-daily',
                        renotify: true,
                      },
                    },
                  });
                  sent++;
                } catch { errors++; }
              }
              await guardRef.set({ sentAt: nowUtc.toISOString() });
            }
          }
        }

        // Check per-compound reminder times
        const compounds: { id: string; name: string; reminderTime: string }[] = profile.compounds || [];
        for (const comp of compounds) {
          if (!comp.reminderTime || !/^\d{1,2}:\d{2}$/.test(comp.reminderTime)) continue;
          const [ch, cm] = comp.reminderTime.split(':').map(Number);
          const compTarget = ch * 60 + cm;
          const compDiff = userLocalMinutes - compTarget;
          if (compDiff >= 0 && compDiff < REMINDER_GRACE_MIN) {
            const normalizedTime = `${String(ch).padStart(2, '0')}${String(cm).padStart(2, '0')}`;
            const guardId = `${uid}_comp_${comp.id}_${todayStr}_${normalizedTime}`;
            const guardRef = firestore.collection('pushGuards').doc(guardId);
            const guardSnap = await guardRef.get();
            if (!guardSnap.exists) {
              for (const token of tokens) {
                try {
                  const title = `💉 Time for ${comp.name}`;
                  const body = 'Open LabRat to log your dose.';
                  await fcmMessaging.send({
                    token,
                    notification: { title, body },
                    data: {
                      title,
                      body,
                      tag: `comp-${comp.id}`,
                      icon: '/icon_192.png',
                    },
                    android: { priority: 'high' },
                    webpush: {
                      headers: { Urgency: 'high', TTL: '86400' },
                      notification: {
                        title,
                        body,
                        icon: '/icon_192.png',
                        badge: '/icon_96.png',
                        tag: `comp-${comp.id}`,
                        renotify: true,
                      },
                    },
                  });
                  sent++;
                } catch { errors++; }
              }
              await guardRef.set({ sentAt: nowUtc.toISOString() });
            }
          }
        }
      }

      console.log('[send-reminders] result', JSON.stringify({ sent, errors, profiles: diag.length, checkedAt: nowUtc.toISOString() }));
      res.json({ ok: true, sent, errors, checkedAt: nowUtc.toISOString(), profiles: diag });
    } catch (err: any) {
      console.error('[send-reminders] Error:', err);
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Real background-push test: the signed-in user triggers an immediate FCM
  // push to their own device tokens. Lets us confirm whether background push
  // actually reaches + displays on the device (separate from the daily cron).
  // ──────────────────────────────────────────────────────────────────────────
  app.post('/api/test-push', async (req, res) => {
    const who = await verifyFirebaseToken(req);
    if (!who) return res.status(401).json({ error: 'Unauthorized' });
    const adminApp = getAdminApp();
    if (!adminApp) return res.status(503).json({ error: 'Firebase Admin not configured' });
    const firestore = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
    const fcm = getAdminMessaging(adminApp);
    try {
      const snap = await firestore.collection('pushProfiles').doc(who.uid).get();
      const tokens: string[] = snap.data()?.fcmTokens || [];
      let sent = 0, errors = 0;
      const errMsgs: string[] = [];
      for (const token of tokens) {
        try {
          const title = '✅ LabRat test push';
          const body = 'Background push works — you can close the app.';
          await fcm.send({
            token,
            notification: { title, body },
            data: {
              title,
              body,
              tag: 'labrat-test',
              icon: '/icon_192.png',
            },
            android: { priority: 'high' },
            webpush: {
              headers: { Urgency: 'high', TTL: '600' },
              notification: {
                title,
                body,
                icon: '/icon_192.png',
                badge: '/icon_96.png',
                tag: 'labrat-test',
                renotify: true,
              },
            },
          });
          sent++;
        } catch (e: any) { errors++; if (errMsgs.length < 3) errMsgs.push(String(e?.errorInfo?.code || e?.message || e)); }
      }
      console.log('[test-push] result', JSON.stringify({ uid: who.uid.slice(0, 6), tokens: tokens.length, sent, errors, errMsgs }));
      res.json({ ok: true, tokens: tokens.length, sent, errors, errMsgs });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Order notification sender — called by the client after order events
  // type 'order_placed'  → notifies admin
  // type 'status_change' → notifies the customer whose order changed
  // ──────────────────────────────────────────────────────────────────────────
  app.post("/api/notify-order", async (req, res) => {
    const { type, orderId, customerEmail, customerUserId, status } = req.body || {};
    if (!type || !orderId) return res.status(400).json({ error: 'Missing type or orderId' });

    const caller = await verifyFirebaseToken(req);
    if (!caller) return res.status(401).json({ error: 'Unauthorized' });
    // Only the admin may push status-change notifications to customers
    if (type === 'status_change' && caller.email !== ADMIN_EMAIL && caller.uid !== 'dev') {
      return res.status(403).json({ error: 'Admin only' });
    }
    if (rateLimited(`notify_${caller.uid}`, 10)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const adminApp = getAdminApp();
    if (!adminApp) return res.status(503).json({ error: 'Push service not configured' });

    const db = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
    const fcmMessaging = getAdminMessaging(adminApp);

    const ADMIN_UID = 'kyleheiser@gmail.com';

    try {
      if (type === 'order_placed') {
        // Look up admin UID via Firebase Auth by email, then fetch their push tokens
        const adminAuth = await adminApp && (await import('firebase-admin/auth')).getAuth(adminApp);
        let adminUid: string | null = null;
        try {
          const adminUser = await adminAuth!.getUserByEmail('kyleheiser@gmail.com');
          adminUid = adminUser.uid;
        } catch { /* admin not found */ }

        if (!adminUid) return res.json({ ok: true, sent: 0 });

        const profileDoc = await db.collection('pushProfiles').doc(adminUid).get();
        const tokens: string[] = profileDoc.data()?.fcmTokens || [];
        let sent = 0;
        for (const token of tokens) {
          try {
            await fcmMessaging.send({
              token,
              data: {
                title: '🛒 New Order Placed',
                body: `${customerEmail || 'A customer'} placed order ${orderId}`,
                tag: 'labrat-new-order',
                icon: '/icon_192.png',
                orderId,
              },
              android: { priority: 'high' },
              webpush: { headers: { Urgency: 'high', TTL: '86400' } },
            });
            sent++;
          } catch { /* stale token */ }
        }
        return res.json({ ok: true, sent });
      }

      if (type === 'status_change') {
        if (!customerUserId || !status) return res.status(400).json({ error: 'Missing customerUserId or status' });
        const profileDoc = await db.collection('pushProfiles').doc(customerUserId).get();
        if (!profileDoc.exists) return res.json({ ok: true, sent: 0 });
        const tokens: string[] = profileDoc.data()?.fcmTokens || [];
        const statusLabel: Record<string, string> = {
          processing: '⚙️ Your order is being processed',
          shipped: '📦 Your order has shipped!',
          completed: '✅ Your order has been delivered',
          cancelled: '❌ Your order was cancelled',
        };
        const body = statusLabel[status] || `Order status updated to: ${status}`;
        let sent = 0;
        for (const token of tokens) {
          try {
            await fcmMessaging.send({
              token,
              data: { title: '📬 LabRat Order Update', body, tag: `labrat-order-${orderId}`, icon: '/icon_192.png', orderId, status },
              android: { priority: 'high' },
              webpush: { headers: { Urgency: 'high', TTL: '86400' } },
            });
            sent++;
          } catch { /* stale token */ }
        }
        return res.json({ ok: true, sent });
      }

      return res.status(400).json({ error: 'Unknown notification type' });
    } catch (err: any) {
      console.error('[notify-order] Error:', err);
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Pricing — wholesale costs live server-side only (server/pricingData.ts).
  // Members get final sell prices; raw costs are admin-only.
  // ──────────────────────────────────────────────────────────────────────────

  // Read the trusted pricing config (markups + overrides) via the Admin SDK.
  // Falls back to defaults when Admin credentials are absent (local dev).
  async function fetchTrustedPricingConfig(): Promise<{ markups: PricingMarkups; overrides: Record<string, PriceOverride> }> {
    const adminApp = getAdminApp();
    if (adminApp) {
      try {
        const fsdb = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
        const snap = await fsdb.collection('systemConfig').doc('pricingConfig').get();
        if (snap.exists) {
          const data = snap.data() || {};
          return {
            markups: { ...DEFAULT_MARKUPS, ...(data.markups || {}) },
            overrides: data.overrides || {},
          };
        }
      } catch (e) {
        console.error('[prices] Failed to read pricingConfig via Admin SDK:', e);
      }
    } else {
      console.warn('[prices] Admin SDK unavailable — serving default markups');
    }
    return { markups: DEFAULT_MARKUPS, overrides: {} };
  }

  // Final sell prices for the shop — any signed-in user
  app.post('/api/prices', async (req, res) => {
    const caller = await verifyFirebaseToken(req);
    if (!caller) return res.status(401).json({ error: 'Sign in required' });
    if (rateLimited(`prices_${caller.uid}`, 30)) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    const names: string[] = Array.isArray(req.body?.names) ? req.body.names.slice(0, 500) : [];
    const { markups, overrides } = await fetchTrustedPricingConfig();
    res.json({ priceBook: computePriceBook(names, markups, overrides) });
  });

  // Raw wholesale costs — admin only (feeds pricing panel & profit displays)
  app.post('/api/wholesale', async (req, res) => {
    const caller = await verifyFirebaseToken(req);
    if (!caller) return res.status(401).json({ error: 'Sign in required' });
    if (caller.email !== ADMIN_EMAIL && caller.uid !== 'dev') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const names: string[] = Array.isArray(req.body?.names) ? req.body.names.slice(0, 500) : [];
    res.json({ wholesaleBook: computeWholesaleBook(names) });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Order creation — prices, shipping, tax, and total are recomputed
  // server-side from the trusted pricing config. Client-supplied prices are
  // ignored, so a tampered request can't buy below the configured price.
  // ──────────────────────────────────────────────────────────────────────────
  app.post('/api/create-order', async (req, res) => {
    const caller = await verifyFirebaseToken(req);
    if (!caller) return res.status(401).json({ error: 'Sign in required' });
    if (rateLimited(`order_${caller.uid}`, 5)) {
      return res.status(429).json({ error: 'Too many order attempts — wait a minute' });
    }

    const adminApp = getAdminApp();
    if (!adminApp) {
      console.error('[create-order] Rejected: Firebase Admin credentials missing (set FIREBASE_SERVICE_ACCOUNT_BASE64)');
      return res.status(503).json({ error: 'Ordering is temporarily unavailable — please try again shortly.' });
    }
    const fsdb = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);

    // ── Validate input shape ──
    const body = req.body || {};
    const rawItems: any[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > 100) {
      return res.status(400).json({ error: 'Order must contain 1–100 items' });
    }
    for (const it of rawItems) {
      if (typeof it?.id !== 'string' || !Number.isInteger(it?.quantity) || it.quantity < 1 || it.quantity > 999) {
        return res.status(400).json({ error: 'Invalid item entry' });
      }
    }
    const bacWaterQty = Number.isInteger(body.bacWaterQty) && body.bacWaterQty >= 0 && body.bacWaterQty <= 999 ? body.bacWaterQty : 0;
    const sf = typeof body.shippingForm === 'object' && body.shippingForm ? body.shippingForm : {};
    const str = (v: any, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');

    // Every approved account uses the same customer storefront and price list.
    if (caller.email !== ADMIN_EMAIL) {
      const memberSnap = await fsdb.collection('members').doc(caller.uid).get();
      const status = memberSnap.exists ? memberSnap.data()?.status : null;
      if (!['approved', 'kit', 'chinakit', 'chinavial'].includes(status)) {
        return res.status(403).json({ error: 'Membership not approved for ordering' });
      }
    }

    try {
      // ── Resolve products: built-in catalog first, then Firestore shopItems ──
      const resolved: { id: string; name: string; listPrice: number; quantity: number }[] = [];
      for (const it of rawItems) {
        const builtIn = SAMPLE_INVENTORY.find(p => p.id === it.id);
        if (builtIn) {
          resolved.push({ id: builtIn.id, name: builtIn.name, listPrice: builtIn.price, quantity: it.quantity });
          continue;
        }
        const snap = await fsdb.collection('shopItems').doc(it.id).get();
        if (!snap.exists) return res.status(400).json({ error: `Unknown product: ${it.id}` });
        const d = snap.data()!;
        resolved.push({ id: it.id, name: String(d.name || ''), listPrice: Number(d.price) || 0, quantity: it.quantity });
      }

      // ── Recompute prices server-side ──
      const { markups, overrides } = await fetchTrustedPricingConfig();
      const book = computePriceBook(resolved.map(r => r.name), markups, overrides);
      const priceFor = (name: string, listPrice: number): number => {
        const e = book[name] || {};
        return e.chnVial || e.norVial || listPrice;
      };

      const items = [
        ...resolved.map(r => ({ id: r.id, name: r.name, price: priceFor(r.name, r.listPrice), quantity: r.quantity })),
        ...(bacWaterQty > 0 ? [{ id: 'prod_bac_water_30ml', name: 'BAC Water (30ml)', price: 7, quantity: bacWaterQty }] : []),
      ];
      const subtotal = resolved.reduce((sum, r) => sum + priceFor(r.name, r.listPrice) * r.quantity, 0);
      const bacWaterCost = bacWaterQty * 7;

      // ── Shipping ──
      // The active customer storefront includes free shipping on every order.
      const shippingCost = 0;

      // ── Florida sales tax (6%) ──
      const stateNorm = str(sf.state, 30).trim().toLowerCase();
      const isFlorida = stateNorm === 'fl' || stateNorm === 'florida';
      const salesTax = isFlorida ? Math.round((subtotal + bacWaterCost) * 0.06 * 100) / 100 : 0;

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
      const orderId = `LR-${dateStr}-${randomHex}`;

      const orderPayload = {
        id: orderId,
        userId: caller.uid,
        email: caller.email,
        displayName: str(body.displayName, 100) || 'Anonymous LabRat',
        items,
        total: subtotal + bacWaterCost + shippingCost + salesTax,
        tax: salesTax,
        shippingInfo: {
          fullName: str(sf.fullName, 120),
          addressLine1: str(sf.addressLine1),
          addressLine2: str(sf.addressLine2),
          city: str(sf.city, 80),
          state: str(sf.state, 30),
          zipCode: str(sf.zipCode, 12),
          phone: str(sf.phone, 30),
          notes: str(sf.notes, 1000),
          method: 'Free Shipping',
          cost: shippingCost,
        },
        status: 'placed',
        createdAt: new Date().toISOString(),
      };

      // Strip undefined values (Firestore rejects them)
      const cleaned = JSON.parse(JSON.stringify(orderPayload));
      await fsdb.collection('orders').doc(orderId).set(cleaned);
      res.json({ order: cleaned });
    } catch (err: any) {
      console.error('[create-order] Error:', err);
      res.status(500).json({ error: err?.message || 'Order creation failed' });
    }
  });

  async function pipOwner() {
    const adminApp = getAdminApp();
    if (!adminApp) throw new Error('Firebase Admin unavailable');
    const { getAuth: getAdminAuth } = await import('firebase-admin/auth');
    return getAdminAuth(adminApp).getUserByEmail(
      process.env.PIP_OWNER_EMAIL || ADMIN_EMAIL,
    );
  }

  function pipAuthorized(req: express.Request): boolean {
    const supplied = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const expected = process.env.PIP_CONTEXT_TOKEN || '';
    return !!expected && supplied === expected;
  }

  app.get('/api/pip/context', async (req, res) => {
    if (!pipAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
    try {
      const adminApp = getAdminApp();
      if (!adminApp) return res.status(503).json({ error: 'admin_unavailable' });
      const owner = await pipOwner();
      const db = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
      const [compoundsSnap, logsSnap, pushProfile] = await Promise.all([
        db.collection('users').doc(owner.uid).collection('compounds').get(),
        db.collection('users').doc(owner.uid).collection('doseLogs')
          .orderBy('date', 'desc').limit(30).get(),
        db.collection('pushProfiles').doc(owner.uid).get(),
      ]);
      const compounds = compoundsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const logs = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json({
        generatedAt: new Date().toISOString(),
        compounds: sanitizeCompounds(compounds),
        recentDoseLogs: sanitizeDoseLogs(logs),
        reminders: {
          enabled: !!pushProfile.data()?.reminderEnabled,
          time: pushProfile.data()?.reminderTime || null,
        },
      });
    } catch (err) {
      console.error('[pip-context] read failed', err);
      res.status(500).json({ error: 'context_failed' });
    }
  });

  app.post('/api/pip/dose', async (req, res) => {
    if (!pipAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
    if (req.body?.confirmed !== true) {
      return res.status(409).json({ error: 'explicit_confirmation_required' });
    }
    try {
      const adminApp = getAdminApp();
      if (!adminApp) return res.status(503).json({ error: 'admin_unavailable' });
      const owner = await pipOwner();
      const db = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
      const compoundId = String(req.body?.compoundId || '');
      const compoundDoc = await db.collection('users').doc(owner.uid)
        .collection('compounds').doc(compoundId).get();
      if (!compoundDoc.exists) return res.status(404).json({ error: 'compound_not_found' });
      const compound = compoundDoc.data() || {};
      const now = new Date();
      const date = String(req.body?.date || now.toISOString().slice(0, 10));
      const time = String(req.body?.time || now.toTimeString().slice(0, 5));
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({ error: 'invalid_date_or_time' });
      }
      const ref = db.collection('users').doc(owner.uid).collection('doseLogs').doc();
      const log = {
        id: ref.id,
        compoundId,
        compoundName: String(compound.name || 'Compound'),
        date,
        time,
        doseAmount: Number(compound.doseAmount || 0),
        doseUnit: String(compound.doseUnit || ''),
        isSkipped: false,
        source: 'pip_confirmed',
      };
      await ref.set(log);
      res.status(201).json({ ok: true, log });
    } catch (err) {
      console.error('[pip-context] dose write failed', err);
      res.status(500).json({ error: 'dose_write_failed' });
    }
  });

  async function setupServer() {
    // Vite middleware for development, static serve for production
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      // On Vercel, static files are served automatically by Vercel's edge network,
      // so we don't need Express to serve static files or handle fallback.
      if (!process.env.VERCEL) {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }

    // Only start the local port listener if we're not running as a Vercel serverless function
    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Express server listening on port ${PORT}`);
      });
    }
  }

  setupServer();

  export default app;
