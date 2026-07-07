import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
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
import { getShippingOptions, getChinaFlatShipping, NORWAY_KIT_FLAT_SHIPPING } from "./src/lib/shopHelpers";

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

// Safely get a fresh Gemini client using the latest environment variables
function getGeminiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured inside the server environment. Please define it in your Secrets settings.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Helper to parse and enrich Gemini API error messages for the user
function handleGeminiError(err: any, endpointName: string): { status: number; message: string } {
  const errMsg = err?.message || String(err || "");
  console.error(`${endpointName} error:`, err);

  const isExpired = errMsg.toLowerCase().includes("expired") || 
                    errMsg.toLowerCase().includes("api_key_invalid") || 
                    errMsg.toLowerCase().includes("api key expired") ||
                    errMsg.includes("API key expired") ||
                    errMsg.includes("INVALID_ARGUMENT");

  if (isExpired) {
    return {
      status: 401,
      message: "Your GEMINI_API_KEY has expired or is invalid. Please go to the Secrets / Settings panel in the top-right corner of Google AI Studio (the gear icon or Secrets menu), update your key with a fresh one from AI Studio, and try again."
    };
  }

  return {
    status: 500,
    message: errMsg || `An unexpected error occurred while communicating with the Gemini API.`
  };
}

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
      apiReady: !!process.env.GEMINI_API_KEY,
      adminCredsPresent,
      adminReady: !!getAdminApp(),
      cronSecretSet: !!process.env.CRON_SECRET,
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
${row('AI Features (Gemini)', checks.apiReady,
  'API key configured — blood analyzer is operational.',
  'GEMINI_API_KEY is not set. AI blood analysis will fail until it is added.')}
${row('Dose Reminder Cron', checks.cronSecretSet,
  'CRON_SECRET configured — scheduled reminders can run.',
  'CRON_SECRET is not set. Scheduled dose reminders are disabled until it is added.')}
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
    if ((req.headers.authorization || '') !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const adminApp = getAdminApp();
    if (!adminApp) {
      return res.status(503).json({ error: 'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64.' });
    }

    const firestore = getAdminFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
    const fcmMessaging = getAdminMessaging(adminApp);

    const nowUtc = new Date();
    const nowUtcMinutes = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();
    const todayStr = nowUtc.toISOString().split('T')[0];

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

        // Compute user's local minute-of-day from UTC + their stored offset
        // timezoneOffset = getTimezoneOffset() — positive means WEST of UTC
        const offset: number = typeof profile.timezoneOffset === 'number' ? profile.timezoneOffset : 0;
        const userLocalMinutes = ((nowUtcMinutes - offset) % 1440 + 1440) % 1440;

        diag.push({
          uid: uid.slice(0, 6),
          tokens: tokens.length,
          reminderEnabled: !!profile.reminderEnabled,
          reminderTime: profile.reminderTime || null,
          tzOffset: offset,
          userLocalTime: `${String(Math.floor(userLocalMinutes / 60)).padStart(2, '0')}:${String(userLocalMinutes % 60).padStart(2, '0')}`,
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
            const guardId = `${uid}_daily_${todayStr}`;
            const guardRef = firestore.collection('pushGuards').doc(guardId);
            const guardSnap = await guardRef.get();
            if (!guardSnap.exists) {
              for (const token of tokens) {
                try {
                  await fcmMessaging.send({
                    notification: {
                      title: '🔬 LabRat Dose Reminder',
                      body: "Time to record today's scheduled administrations.",
                    },
                    data: { tag: 'labrat-reminder-daily' },
                    token,
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
            const guardId = `${uid}_comp_${comp.id}_${todayStr}`;
            const guardRef = firestore.collection('pushGuards').doc(guardId);
            const guardSnap = await guardRef.get();
            if (!guardSnap.exists) {
              for (const token of tokens) {
                try {
                  await fcmMessaging.send({
                    notification: {
                      title: `💉 Time for ${comp.name}`,
                      body: 'Open LabRat to log your dose.',
                    },
                    data: { tag: `comp-${comp.id}` },
                    token,
                  });
                  sent++;
                } catch { errors++; }
              }
              await guardRef.set({ sentAt: nowUtc.toISOString() });
            }
          }
        }
      }

      res.json({ ok: true, sent, errors, checkedAt: nowUtc.toISOString(), profiles: diag });
    } catch (err: any) {
      console.error('[send-reminders] Error:', err);
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
              notification: {
                title: '🛒 New Order Placed',
                body: `${customerEmail || 'A customer'} placed order ${orderId}`,
              },
              data: { tag: 'labrat-new-order', orderId },
              token,
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
              notification: { title: '📬 LabRat Order Update', body },
              data: { tag: `labrat-order-${orderId}`, orderId, status },
              token,
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

    // ── Determine pricing tier from the member's Firestore status ──
    const isAdminCaller = caller.email === ADMIN_EMAIL;
    let tier: 'retail' | 'kit' | 'chinakit' | 'chinavial' = 'retail';
    if (isAdminCaller) {
      const requested = body.tier;
      if (requested === 'kit' || requested === 'chinakit' || requested === 'chinavial' || requested === 'retail') tier = requested;
    } else {
      const memberSnap = await fsdb.collection('members').doc(caller.uid).get();
      const status = memberSnap.exists ? memberSnap.data()?.status : null;
      if (status === 'kit' || status === 'chinakit' || status === 'chinavial') tier = status;
      else if (status === 'approved') tier = 'retail';
      else return res.status(403).json({ error: 'Membership not approved for ordering' });
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
        if (tier === 'kit') return e.norKit || listPrice;
        if (tier === 'chinakit') return e.chnKit || listPrice;
        if (tier === 'chinavial') return e.chnVial || e.norVial || listPrice;
        return e.norVial ?? listPrice;
      };

      const items = [
        ...resolved.map(r => ({ id: r.id, name: r.name, price: priceFor(r.name, r.listPrice), quantity: r.quantity })),
        ...(bacWaterQty > 0 ? [{ id: 'prod_bac_water_30ml', name: 'BAC Water (30ml)', price: 7, quantity: bacWaterQty }] : []),
      ];
      const subtotal = resolved.reduce((sum, r) => sum + priceFor(r.name, r.listPrice) * r.quantity, 0);
      const bacWaterCost = bacWaterQty * 7;

      // ── Shipping ──
      // Norway kit: $30 flat. China (kit or vial): $25 flat, free only when
      // every non-BAC-water item ships from the US warehouse. Retail: live rates.
      const isFixedShipping = tier !== 'retail';
      const isChinaTier = tier === 'chinakit' || tier === 'chinavial';
      let shippingCost = tier === 'kit'
        ? NORWAY_KIT_FLAT_SHIPPING
        : isChinaTier ? getChinaFlatShipping(resolved) : 0;
      let selectedOption: any = null;
      let shippingDetails: any = null;
      if (!isFixedShipping) {
        const totalVials = resolved.reduce((sum, r) => sum + r.quantity, 0);
        const cartLike = resolved.map(r => ({ product: { id: r.id, name: r.name, price: r.listPrice } as any, quantity: r.quantity }));
        shippingDetails = getShippingOptions(str(sf.zipCode, 10), totalVials, cartLike as any);
        selectedOption = shippingDetails.options.find((o: any) => o.id === body.selectedShippingOptionId) || shippingDetails.options[0];
        shippingCost = selectedOption ? selectedOption.cost : 0;
      }

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
          carrier: isFixedShipping ? undefined : selectedOption?.carrier,
          method: tier === 'kit'
            ? 'Norway Kit Flat Rate'
            : isChinaTier
            ? (shippingCost === 0 ? 'USA Warehouse Free Shipping' : 'China Flat Rate')
            : selectedOption?.name,
          cost: shippingCost,
          deliveryEstimate: isFixedShipping ? undefined : selectedOption?.estimatedDeliveryDate,
          weightLbs: isFixedShipping ? undefined : shippingDetails?.weightLbs,
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


  // ──────────────────────────────────────────────────────────────────────────
  // LABRAT AI Research Assistant — multi-turn chat powered by Gemini
  // System prompt encodes full peptide catalog knowledge so the model can
  // answer dosing, reconstitution, and app-feature questions accurately.
  // ──────────────────────────────────────────────────────────────────────────
  const LABRAT_SYSTEM_PROMPT = `You are the LABRAT Research Assistant — a knowledgeable, friendly guide embedded in the LABRAT Peptides app. You help researchers with practical questions about peptide dosing, reconstitution, cycle planning, and how to use the app's features.

IMPORTANT RULES:
- Always begin responses with a brief disclaimer that all information is for research purposes only and not medical advice.
- Be concise but thorough. Use bullet points for step-by-step instructions.
- Do not recommend specific medical treatments or diagnose conditions.
- When mentioning dosing, always say "typical research protocols suggest..." or "research literature indicates...".
- You can discuss reconstitution math confidently — it's chemistry, not medical advice.

═══════════════════════════════════════
APP FEATURES
═══════════════════════════════════════
- Cycle Planner: Add compounds with dose, unit (mcg/mg/IU/ml), frequency (daily/EOD/twice-weekly/weekly/custom), start date, duration. Dashboard shows active daily schedule with syringe annotations.
- Compound Library: 50+ research compounds (peptides, SARMs, steroids, supplements). Each has research writeup, dosing ranges, half-life, reconstitution notes, citations.
- Reconstitution Calculator (Peptide Mix Helper): Enter vial size (mg), solvent volume (ml), target dose (mcg or mg). It outputs units to draw on insulin syringe, mcg per unit, doses per vial. Access it via the Compound form when adding a peptide.
- Members Shop: Browse and order peptides. Pricing tiers: Norway Per-Vial (default approved), Norway Kit (10-vial pricing), China Vial, China Kit. Shop only visible after approval.
- Blood Work Tracker: Upload blood panel images or PDF, AI analyzes biomarkers.
- Dose Reminders: Set reminder times per compound, receive push notifications.

═══════════════════════════════════════
RECONSTITUTION GUIDE (ALL RESEARCHERS)
═══════════════════════════════════════
Standard Solvent: Bacteriostatic Water (BAC water, 0.9% benzyl alcohol).
EXCEPTIONS — DO NOT use BAC water for:
  - IGF-1 LR3: Use 0.1% Acetic Acid. Benzyl alcohol rapidly degrades it.
  - AOD-9604: Use 0.1% Acetic Acid. Aggregates at neutral pH.
  - Follistatin-344: Use plain Sterile Water.
  - Semax / Selank blend: Use Sterile Water (nasal delivery).
  - VIP (Vasoactive Intestinal Peptide): Use Sterile Saline.

Technique:
  1. Remove the rubber stopper cap. Clean stopper with alcohol swab.
  2. Draw chosen solvent into a syringe. For most peptides, 1–2 ml per vial.
  3. Angle the needle against the inside glass wall so solvent trickles down — never inject directly onto the powder (disrupts structure).
  4. Swirl gently. Never shake.
  5. Store reconstituted vials at 2–8°C (refrigerator). Use within 28–30 days.
  6. Dry/lyophilised powder can be stored at -20°C for long-term stability (up to 1–2 years for most peptides).

SYRINGE MATH (Insulin Syringe — 1 ml = 100 units):
  Formula: units_to_draw = (target_dose_mcg ÷ (vial_mg × 1000)) × solvent_ml × 100
  Example — BPC-157 5mg vial, 2ml BAC water, 250mcg target dose:
    = (250 ÷ 5000) × 2 × 100 = 10 units
  The Reconstitution Calculator in the app does this automatically.

═══════════════════════════════════════
PEPTIDE CATALOG — DOSING & NOTES
═══════════════════════════════════════

── GLP-1 / Weight Loss ──

Semaglutide:
  - Research dose: Start 0.25 mg/week for 4 weeks, then 0.5 mg/week. Titrate slowly by 0.25–0.5 mg every 4 weeks up to a max of 2.4 mg/week.
  - Reconstitute: BAC water. Common: 2mg vial + 2ml BAC = 1mg/ml.
  - Inject subcutaneously (belly fat, thigh, or upper arm), once weekly.
  - Side effects: Nausea, reduced appetite. Titrating slowly minimises GI issues.

Tirzepatide (GIP/GLP-1 dual agonist):
  - Research dose: Start 2.5 mg/week for 4 weeks, then 5 mg/week. Titrate by 2.5 mg every 4 weeks. Max observed: 15 mg/week.
  - Reconstitute: BAC water. Common: 15mg vial + 1.5ml BAC = 10mg/ml.
  - More potent than semaglutide for weight loss in research.

Retatrutide / Reta (GIP/GLP-1/Glucagon triple agonist):
  - Research dose: START LOW. Typical: 0.5 mg/week for 4 weeks, then 1 mg/week, then 2 mg/week. Max research dose ~12 mg/week but most protocols cap at 4–8 mg.
  - Reconstitute: BAC water. Common: 2mg vial + 1ml BAC = 2mg/ml.
  - Significantly more potent than tirzepatide. Glucagon component accelerates fat oxidation.
  - Side effects: More pronounced nausea/vomiting than sema or tirz — start lower and titrate more slowly.

AOD-9604:
  - Research dose: 250–300 mcg/day SC. Often taken in the morning fasted.
  - Reconstitute: 0.1% Acetic Acid (NOT BAC water — pH-sensitive, aggregates at neutral pH).
  - A modified fragment of GH (176-191) targeting fat metabolism without IGF-1 elevation.

── Healing & Repair ──

BPC-157 (Body Protection Compound):
  - Research dose: 200–500 mcg/day. Inject near injury site (subcutaneous or IM). 4–12 week cycles.
  - Reconstitute: BAC water. Common: 5mg vial + 2ml BAC = 2500 mcg/ml. 250 mcg = 10 units.
  - Speeds tendon, ligament, muscle, gut healing. Systemic effects from any injection site.

TB-500 (Thymosin Beta-4 fragment):
  - Research dose: Loading phase 2.5–5 mg twice weekly for 4–6 weeks, then maintenance 2.5 mg/week.
  - Reconstitute: BAC water. Common: 5mg vial + 1ml BAC = 5mg/ml.
  - Works synergistically with BPC-157 for injury repair.

Klow (Copper peptide blend):
  - Research dose: 1–2 mg/day SC. Blue powder — the copper(II) complex gives it colour.
  - Reconstitute: BAC water. Common: 5mg vial + 2ml BAC.
  - Skin collagen/elastin regeneration, wound healing.

GHK-Cu (Copper peptide):
  - Research dose: 1–2 mg/day SC injection or topical.
  - Reconstitute: BAC water. Blue powder.
  - Anti-ageing, skin repair, anti-inflammatory.

SS-31 (Elamipretide):
  - Research dose: 1–5 mg/day SC.
  - Reconstitute: BAC water.
  - Mitochondrial-targeted antioxidant peptide.

── Muscle Growth / GH Axis ──

CJC-1295 Without DAC (Modified GRF 1-29):
  - Research dose: 100–300 mcg per injection, 2–3 times daily, typically before sleep and post-workout.
  - Reconstitute: BAC water.
  - Often stacked with Ipamorelin for synergistic GH pulse.

CJC-1295 With DAC:
  - Research dose: 1–2 mg twice weekly (longer half-life due to Drug Affinity Complex).
  - Reconstitute: BAC water.

Ipamorelin (GHRP):
  - Research dose: 100–300 mcg per injection, 2–3 times daily.
  - Reconstitute: BAC water. Stack with CJC-1295 for amplified GH release.
  - Minimal cortisol/prolactin elevation vs other GHRPs.

IGF-1 LR3:
  - Research dose: 20–50 mcg/day. More aggressive protocols: 40–100 mcg/day for short cycles (4–6 weeks).
  - Reconstitute: 0.1% Acetic Acid ONLY. BAC water (benzyl alcohol) rapidly degrades IGF-1 LR3.
  - After mixing with acetic acid, dilute the drawn dose in bacteriostatic saline before injection to neutralise acidity.

Follistatin-344:
  - Research dose: 50–100 mcg/day, 10-day cycles with breaks.
  - Reconstitute: Sterile Water (plain, no benzyl alcohol).
  - Myostatin inhibitor — promotes muscle fibre growth.

Tesamorelin:
  - Research dose: 1–2 mg/day SC (abdomen). FDA-approved (Egrifta) for HIV-associated lipodystrophy.
  - Reconstitute: BAC water.
  - GHRH analogue; reduces visceral fat, increases IGF-1.

── Cognitive & Focus ──

Semax / Selank Cognitive Blend:
  - Research dose: 100–300 mcg per nostril, 1–2 times daily.
  - Reconstitute: Sterile Water. Administer as nasal drops — DO NOT inject.
  - Semax: ACTH-derived nootropic. Selank: anxiolytic, memory enhancement.

VIP (Vasoactive Intestinal Peptide):
  - Research dose: 50–100 mcg, 1–2 times daily (intranasal or SC).
  - Reconstitute: Sterile Saline (NOT BAC water, NOT plain sterile water).
  - Neuroprotective, anti-inflammatory, MCAS protocols.

── Beauty & Longevity ──

Epithalon (Epitalon):
  - Research dose: 5–10 mg/day for 10–20 day cycles, 2–3 cycles per year.
  - Reconstitute: BAC water.
  - Telomere elongation research; pineal gland peptide.

PT-141 (Bremelanotide):
  - Research dose: 0.5–2 mg SC, 1–2 hours before desired effect.
  - Reconstitute: BAC water.
  - Melanocortin receptor agonist. Research context: sexual dysfunction.

Bacteriostatic Water:
  - 30 ml multi-use vials. Sterile saline with 0.9% benzyl alcohol bacteriostatic agent.
  - Standard reconstitution solvent for most research peptides.
  - Not the same as plain sterile water or saline — benzyl alcohol prevents contamination over multiple draws.

═══════════════════════════════════════
COMMON QUESTIONS
═══════════════════════════════════════

Q: How much Retatrutide should I start with?
A: Research protocols typically begin at 0.5 mg once weekly for the first 4 weeks to assess tolerance. Then increase to 1 mg/week for 4 weeks, then 2 mg/week. The glucagon agonism makes Reta significantly more potent and nauseating than tirzepatide — titrating more slowly reduces GI side effects.

Q: How do I mix / reconstitute a peptide?
A: See the Reconstitution Guide above. Add BAC water slowly down the glass wall of the vial, swirl gently. Use the Peptide Mix Helper in the app to calculate syringe units.

Q: How many units do I draw on my syringe?
A: Use the formula: units = (target mcg ÷ (vial mg × 1000)) × solvent ml × 100. Or use the app's Reconstitution Calculator.

Q: Can I inject BPC-157 and TB-500 together?
A: Research protocols frequently combine them in the same syringe as they are both BAC-water based and compatible. Draw BPC-157 first, then TB-500.

Q: How long is a reconstituted peptide good for?
A: 28–30 days refrigerated at 2–8°C. Keep dry powder frozen at -20°C until ready to use.

Q: What's the difference between Norway and China sourcing?
A: Norway-source peptides are shipped from European pharmaceutical-grade facilities with 3–7 day delivery. China-source offers lower per-unit cost with longer shipping (2–4 weeks). Kit pricing (10-vial packs) gives additional discounts on either source. Contact support to discuss tier options.

═══════════════════════════════════════
TAKING ACTION IN THE APP (FUNCTION CALLING)
═══════════════════════════════════════
You can DO things in the app, not just answer. You have these tools:
- add_compound_to_cycle — when the user says they are starting/adding a compound AND gives enough detail (name + dose + how often). If they give a vial size and BAC water volume (a "ratio"/reconstitution), include those too. If the dose or frequency is missing, ASK for it in a normal reply instead of calling the tool.
- stop_compound — when the user says they stopped, finished, quit, or are done with something. Use the exact name from the "USER'S ACTIVE CYCLE" list if present.
- recommend_product — when the user wants to try, buy, or restock a compound. Pass a short productQuery (the compound name) so the app can find it in the shop.
- log_dose — when the user says they just took / injected / administered a dose. Use the exact active-cycle name; defaults to today.
- update_compound — when the user wants to change an existing compound: titrate the dose ("bump reta to 4mg"), change how often, extend/shorten the cycle, or fix the mix. Only include the fields that actually change.

Rules for tool use:
- Only call a tool when the user's intent is clear. One tool call per message at most.
- Always ALSO write a short, friendly natural-language reply confirming what you're about to do (the app shows the user a Confirm button before anything actually changes — nothing happens without their tap).
- Never invent doses the user didn't ask for. If you fill a sensible default (e.g. 8-week duration), say so.
- The research-purposes-only disclaimer is not required on short action confirmations.`;

  // Agentic tools the chat assistant can invoke. The client renders a Confirm
  // card for any returned action — nothing mutates until the user taps it.
  const LABRAT_CHAT_TOOLS = [{
    functionDeclarations: [
      {
        name: 'add_compound_to_cycle',
        description: "Add a new compound/peptide to the user's active cycle when they say they're starting something and provide a dose and how often. Include vial size and BAC water if they gave a reconstitution ratio.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Compound name, e.g. "Retatrutide"' },
            type: { type: Type.STRING, description: 'peptide, steroid, supplement, or compound. Default peptide.' },
            doseAmount: { type: Type.NUMBER, description: 'Numeric dose per administration, e.g. 3' },
            doseUnit: { type: Type.STRING, description: 'mcg, mg, IU, or ml' },
            frequency: { type: Type.STRING, description: 'daily, eod, twice_weekly, weekly, or custom' },
            durationWeeks: { type: Type.NUMBER, description: 'Cycle length in weeks. Default 8 if not given.' },
            vialSizeMg: { type: Type.NUMBER, description: 'For peptides: vial size in mg, e.g. 10' },
            bacWaterMl: { type: Type.NUMBER, description: 'For peptides: BAC water volume in ml used to reconstitute, e.g. 2' },
            customDays: { type: Type.NUMBER, description: 'If frequency is custom, dose every N days' },
          },
          required: ['name', 'doseAmount', 'doseUnit', 'frequency'],
        },
      },
      {
        name: 'stop_compound',
        description: "Mark a compound in the user's active cycle as stopped/completed when they say they stopped, finished, or quit it. Use the exact name from the active-cycle context.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the active compound to stop' },
          },
          required: ['name'],
        },
      },
      {
        name: 'recommend_product',
        description: 'Link the user to a product in the shop when they want to try, buy, or restock a compound.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            productQuery: { type: Type.STRING, description: 'Search term that finds the product, e.g. "Retatrutide"' },
            reason: { type: Type.STRING, description: 'Short reason to show the user, e.g. "for appetite suppression and fat loss"' },
          },
          required: ['productQuery'],
        },
      },
      {
        name: 'log_dose',
        description: "Record an administration/injection the user says they just took. Use the exact name from the active-cycle context. Defaults to today unless they name another date.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the active compound that was dosed' },
            date: { type: Type.STRING, description: 'Date in YYYY-MM-DD. Omit for today.' },
          },
          required: ['name'],
        },
      },
      {
        name: 'update_compound',
        description: "Change the dose, frequency, duration, or reconstitution of a compound already in the user's cycle — e.g. titrating up ('bump reta to 4mg') or editing the schedule. Use the exact name from the active-cycle context and only include the fields that change.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the active compound to modify' },
            doseAmount: { type: Type.NUMBER, description: 'New dose per administration' },
            doseUnit: { type: Type.STRING, description: 'mcg, mg, IU, or ml' },
            frequency: { type: Type.STRING, description: 'daily, eod, twice_weekly, weekly, or custom' },
            durationWeeks: { type: Type.NUMBER, description: 'New cycle length in weeks' },
            vialSizeMg: { type: Type.NUMBER, description: 'New vial size in mg' },
            bacWaterMl: { type: Type.NUMBER, description: 'New BAC water volume in ml' },
            customDays: { type: Type.NUMBER, description: 'If frequency is custom, dose every N days' },
          },
          required: ['name'],
        },
      },
    ],
  }];

  app.post('/api/chat', async (req, res) => {
    // Rate limit by IP (chat usable before auth on some pages)
    const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
    if (rateLimited(`chat_${ip}`, 25)) {
      return res.status(429).json({ error: 'Too many messages — slow down a bit.' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI assistant is not configured yet. GEMINI_API_KEY missing.' });
    }

    const messages: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(req.body?.messages) ? req.body.messages.slice(-10) : [];
    if (messages.length === 0 || !messages[messages.length - 1]?.content) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Optional context: the user's active cycle, so the assistant can stop or
    // reference existing compounds by name.
    const activeCompounds = Array.isArray(req.body?.context?.activeCompounds)
      ? req.body.context.activeCompounds.slice(0, 40)
      : [];

    try {
      const client = getGeminiClient();
      // Build Gemini contents from conversation history
      const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      let systemInstruction = LABRAT_SYSTEM_PROMPT;
      if (activeCompounds.length) {
        const list = activeCompounds
          .map((c: any) => `- ${c.name} (${c.doseAmount ?? '?'}${c.doseUnit ?? ''}, ${c.frequency ?? '?'})`)
          .join('\n');
        systemInstruction += `\n\n═══ USER'S ACTIVE CYCLE (reference for stop_compound) ═══\n${list}`;
      }

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          tools: LABRAT_CHAT_TOOLS,
          maxOutputTokens: 800,
          temperature: 0.4,
        },
      });

      const calls = response.functionCalls || [];
      const action = calls.length ? { name: calls[0].name, args: calls[0].args || {} } : null;
      const text = response.text?.trim() || '';
      // When the model returns only an action with no prose, the client renders
      // a default confirmation summary from the args.
      const reply = text || (action ? '' : "Sorry, I couldn't generate a response. Please try again.");
      res.json({ reply, action });
    } catch (err: any) {
      const { status, message } = handleGeminiError(err, 'Chat API');
      res.status(status).json({ error: message });
    }
  });

  // Gemini Blood Analyzer API
  app.post("/api/gemini/analyze-blood", async (req, res) => {
    const caller = await verifyFirebaseToken(req);
    if (!caller) return res.status(401).json({ error: 'Sign in required' });
    if (rateLimited(`gemini_${caller.uid}`, 5)) {
      return res.status(429).json({ error: 'Too many requests — try again in a minute' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured inside the server environment. Please define it in your Secrets settings." 
      });
    }

    try {
      const { text, fileData, mimeType, compounds = [], healthProfile } = req.body;

      const ALLOWED_UPLOAD_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'application/pdf'];
      if (fileData && mimeType && !ALLOWED_UPLOAD_MIMES.includes(mimeType)) {
        return res.status(400).json({ error: 'Unsupported file type — upload a PNG, JPEG, WebP, HEIC, or PDF.' });
      }

      const client = getGeminiClient();

      // Format user's health profile context to enrich the guidance
      const healthProfileCtx = healthProfile 
        ? `- Age: ${healthProfile.age} years old
- Sex: ${healthProfile.sex}
- Body Weight: ${healthProfile.weightLb} lbs
- Blood Pressure: ${healthProfile.systolicBP}/${healthProfile.diastolicBP} mmHg (Resting Category)
- Resting Heart Rate: ${healthProfile.restingHeartRate} bpm
- Sleep Duration: ${healthProfile.sleepHours} hours/night
- Primary Optimization Goal: ${healthProfile.primaryGoal.replace('_', ' ')}
- Prior Clinical Diagnoses / Pre-existing Conditions: ${healthProfile.diagnoses && healthProfile.diagnoses.length > 0 ? healthProfile.diagnoses.map((d: string) => d.toUpperCase().replace('_', ' ')).join(', ') : 'None reported / healthy metabolic baseline'}
- Reported Symptoms: ${healthProfile.symptoms && healthProfile.symptoms.length > 0 ? healthProfile.symptoms.join(', ') : 'None / optimal wellness'}`
        : "No human health metrics/profile supplied.";

      // Format contextual information about current user states to ground recommendations
      const compoundsCtx = compounds.length > 0
        ? compounds.map((c: any) => `- Name: ${c.name}\n  Type: ${c.type}\n  Dose: ${c.doseAmount} ${c.doseUnit} (${c.frequency})\n  Duration: ${c.durationWeeks} weeks`).join("\n")
        : "No compounds currently configured.";

      const analysisPrompt = `You are the LabRat Clinical Lab Intelligence Engine, an AI trained in endocrine diagnostics, chemical toxicology, and sports-science pharmacology.
Your task is to analyze endocrine, hepatic, renal, lipid, and vascular markers from a user's blood test, combined with their dynamic systemic metrics and pre-existing diagnoses.

Current User Health Profile & Vitals:
---
${healthProfileCtx}
---

Current Scheduled Compounds in Cycle (for biological timeline tracking context):
---
${compoundsCtx}
---

INSTRUCTIONS:
1. Parse the provided blood test contents. They can be copy-pasted text, table metrics, or image OCR contents. Identify key biomarkers like LH, FSH, Total/Free Testosterone, Estradiol (E2), AST, ALT, HDL, LDL, Hematocrit (HCT), Hemoglobin, and Prolactin.
2. Formulate marker statuses:
   - Status MUST be exactly one of: "NORMAL", "ELEVATED", "DEPRESSED", or "CRITICAL".
   - Create a helpful explanatory note detailing what the deviation indicates in the context of their cycle, age, stated symptoms, and prior pre-existing diagnoses (such as hypertension, fatty liver, insulin resistance, or renal strain).
3. Formulate Actionable Directives:
   - "toStart": Recommended target ancillaries or support protocols. Adjust based on diagnoses:
     * If HYPERTENSION: Prioritize cardioprotectants like CoQ10, Hawthorn Berry, Celery Seed, and advice on prescription ACEIs/ARBs.
     * If DIABETES/INSULIN RESISTANCE: Prioritize metabolic support like Berberine, Metformin, or ALA, and mandate checking fasting glucose/HbA1c.
     * If FATTY LIVER (NAFLD): Heavily suggest TUDCA, NAC (N-Acetyl Cysteine), or Glutathione.
     * If DYSLIPIDEMIA: Mandate high-dose Omega-3 (2-4g/day), Citrus Bergamot (500-1000mg/day), and phytosterols.
     * If KIDNEY STRAIN (CKD): Mandate Astragalus Root extract (1000-2000mg/day), strict high-volume hydration (>4L/day), and avoiding heavy creatine-loading. Suggest checking Cystatin-C over simple creatinine.
     * If GOUT/HYPERURICEMIA: Suggest Tart Cherry Extract and high hydration.
     * If HYPOTHYROIDISM: Recommend a full thyroid audit (TSH, free T3/T4).
   - "toStopOrModify": Recommended compound adjustments:
     * If HYPERTENSION: Immediately advise stopping or tapering down heavy water-retaining compounds (like Dianabol, Anadrol, high-dose Testosterone, or Deca).
     * If FATTY LIVER: Immediately mandate terminating or avoiding all oral 17-alpha-alkylated steroids (Winstrol, Superdrol, Dianabol, Anadrol, Anavar).
     * If DIABETES/INSULIN RESISTANCE: Warn against growth hormone or Growth Hormone Secretagogues (like Ibutamoren/MK-677) which drastically worsen insulin sensitivity.
     * If DYSLIPIDEMIA: Advise avoiding orals like Winstrol or high-dose masteron/androgens that decimate lipid integrity.
     * If KIDNEY STRAIN: Immediately advise stopping Trenbolone or other severely nephrotoxic compounds, and eliminate heavy NSAID use.
   - "cycleTimelineImpact": Recommendations on whether to continue, taper, or end the cycle immediately. If ALT/AST is >3x limit, HCT is >54%, or if renal/cardiovascular markers are in critical range when overlaid with pre-existing conditions (e.g., active hypertension with an active critical BP reader), advise ending the active cycle immediately for systemic wash / PCT.
4. Provide a beautifully structured, deep clinical markdown report in "markdownReport". Discuss the biological mechanisms at play, molecular interactions, and how their blood pressure, symptoms, heart rate, and pre-existing diagnoses correlate with their current blood markers. Always speak objectively, analytically, and scientifically. Include a section explaining how their pre-existing conditions interact with active performance enhancers / supplement complexes.

Provide your response in a structured JSON schema matching our required output. Start with a prominent medical disclaimer.`;

      const contents: any[] = [];
      const userParts: any[] = [{ text: analysisPrompt + "\n\nUser uploaded blood results content:\n" + (text || "No text pasting provided.") }];

      if (fileData && mimeType) {
        userParts.push({
          inlineData: {
            data: fileData,
            mimeType: mimeType
          }
        });
      }

      contents.push({ role: "user", parts: userParts });

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              disclaimer: { type: Type.STRING },
              markers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    range: { type: Type.STRING },
                    status: { type: Type.STRING }, // "NORMAL" | "ELEVATED" | "DEPRESSED" | "CRITICAL"
                    explanation: { type: Type.STRING }
                  },
                  required: ["name", "value", "status", "range", "explanation"]
                }
              },
              actionableDirectives: {
                type: Type.OBJECT,
                properties: {
                  toStart: { type: Type.ARRAY, items: { type: Type.STRING } },
                  toStopOrModify: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cycleTimelineImpact: { type: Type.STRING }
                },
                required: ["toStart", "toStopOrModify", "cycleTimelineImpact"]
              },
              markdownReport: { type: Type.STRING }
            },
            required: ["disclaimer", "markers", "actionableDirectives", "markdownReport"]
          }
        }
      });

      const parsedResult = JSON.parse(response.text || "{}");
      res.json(parsedResult);
    } catch (err: any) {
      const { status, message } = handleGeminiError(err, "Gemini Blood Analyzer API");
      res.status(status).json({ error: message });
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
