import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createProxyMiddleware } from "http-proxy-middleware";
import firebaseConfig from "./firebase-applet-config.json";
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from "firebase-admin/app";
import { getMessaging as getAdminMessaging } from "firebase-admin/messaging";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

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

// Firebase Admin SDK — initialized lazily so missing credentials don't crash non-admin endpoints
function getAdminApp() {
  if (getAdminApps().length > 0) return getAdminApps()[0];
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) return null;
  try {
    const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
    return initAdminApp({ credential: cert(serviceAccount) });
  } catch (e) {
    console.error('[Admin] Failed to initialize Firebase Admin:', e);
    return null;
  }
}

// Middleware
app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      apiReady: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString()
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Scheduled reminder sender — called by Vercel Cron every 5 minutes
  // Reads pushProfiles/{uid} from Firestore and sends FCM when time matches
  // ──────────────────────────────────────────────────────────────────────────
  app.get("/api/send-reminders", async (req, res) => {
    // Verify Vercel cron secret to prevent public access
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = req.headers.authorization || '';
      if (auth !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const adminApp = getAdminApp();
    if (!adminApp) {
      return res.status(503).json({ error: 'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64.' });
    }

    const firestore = getAdminFirestore(adminApp);
    const fcmMessaging = getAdminMessaging(adminApp);

    const nowUtc = new Date();
    const nowUtcMinutes = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();
    const todayStr = nowUtc.toISOString().split('T')[0];

    let sent = 0;
    let errors = 0;

    try {
      const profilesSnap = await firestore.collection('pushProfiles').where('reminderEnabled', '==', true).get();

      for (const profileDoc of profilesSnap.docs) {
        const uid = profileDoc.id;
        const profile = profileDoc.data();
        const tokens: string[] = profile.fcmTokens || [];
        if (tokens.length === 0) continue;

        // Compute user's local minute-of-day from UTC + their stored offset
        // timezoneOffset = getTimezoneOffset() — positive means WEST of UTC
        const offset: number = typeof profile.timezoneOffset === 'number' ? profile.timezoneOffset : 0;
        const userLocalMinutes = ((nowUtcMinutes - offset) % 1440 + 1440) % 1440;

        // Check daily reminder time
        const reminderTime: string = profile.reminderTime || '';
        if (reminderTime && /^\d{1,2}:\d{2}$/.test(reminderTime)) {
          const [rh, rm] = reminderTime.split(':').map(Number);
          const targetMinutes = rh * 60 + rm;
          const diff = Math.abs(userLocalMinutes - targetMinutes);
          if (diff < 5) {
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
          const compDiff = Math.abs(userLocalMinutes - compTarget);
          if (compDiff < 5) {
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

      res.json({ ok: true, sent, errors, checkedAt: nowUtc.toISOString() });
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

    const adminApp = getAdminApp();
    if (!adminApp) return res.status(503).json({ error: 'Push service not configured' });

    const db = getAdminFirestore(adminApp);
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

  // Gemini Peptide Advisor API
  app.post("/api/gemini/advisor", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured inside the server environment. Please define it in your Secrets settings." 
      });
    }

    try {
      const { prompt, compounds = [], logs = [], metrics = [] } = req.body;
      
      const client = getGeminiClient();

      // Format contextual information about current user states
      const compoundsCtx = compounds.length > 0
        ? compounds.map((c: any) => `- Name: ${c.name}\n  Type: ${c.type}\n  Dose: ${c.doseAmount} ${c.doseUnit} (${c.frequency})\n  Weeks: ${c.durationWeeks}\n  Start: ${c.startDate}`).join("\n")
        : "No compounds currently configured.";

      const recentLogsCtx = logs.length > 0
        ? logs.slice(-5).map((l: any) => `- Date: ${l.date} ${l.time} Administered ${l.compoundName} (${l.doseAmount} ${l.doseUnit})`).join("\n")
        : "No injection logs recorded.";

      const baseSystemPrompt = `You are the LabRat Peptide and Endocrine Science Copilot—an advanced AI research assistant dedicated to biological, peptide, chemical compounds, and hormonal chemistry tracking calculations.

CRITICAL DISCLAIMER FOR USER SAFETY:
1. All compound descriptions, reconstitution volumes, and half-life guides must be treated as textbook scientific theory and historical academic summaries.
2. Under no circumstances should you provide clinical prescriptions, diagnostic evaluations, medical advice, or push the utilization of controlled or illegal substances.
3. Keep your tone objective, clinical, mathematically precise, analytical, and scientifically detailed.

Current User Active Roster Context:
---
[Compounds Scheduled]:
${compoundsCtx}

[Recent logs]:
${recentLogsCtx}
---

Answer the user's technical research query comprehensively using your academic biochemical knowledge base. Discuss reconstitution formulations, physiological compound interactions, molecular structure contexts, or adverse risk mitigations (like TUDCA, NAC, or endocrine PCT cycles) where appropriate. Organize your response using clean, beautiful Markdown grids, lists, and headings for extreme legibility.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: baseSystemPrompt + "\n\nUser Question:\n" + prompt }] }
        ],
        config: {
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (err: any) {
      const { status, message } = handleGeminiError(err, "Gemini Advisor API");
      res.status(status).json({ error: message });
    }
  });

  // Cycle Optimizer suggestion generator
  app.post("/api/gemini/optimize", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured inside the server environment." 
      });
    }

    try {
      const { compounds = [] } = req.body;
      if (compounds.length === 0) {
        return res.json({ suggestions: ["Add a compound to your Cycle Architect timeline first to unlock tailored AI optimization suggestions."] });
      }

      const client = getGeminiClient();

      const compoundsList = compounds.map((c: any) => `- ${c.name} (${c.type}): ${c.doseAmount} ${c.doseUnit} (${c.frequency}), ${c.durationWeeks} weeks`).join("\n");

      const prompt = `Review the following cycle scheduled parameters for theoretical chemical overlapping, timing conflicts, proper dosing intervals, or missing support elements (e.g., need for liver protection with oral alkylated steroids, need for prolactin mitigations with nandrolones, need for HCG/endocrine PCT loops, or reconstitution safety parameters for peptides):

Current Scheduled Compounds:
${compoundsList}

Provide exactly 3 highly specific, clinical-grade scientific observations or precautionary optimization tips. Each tip must be short, action-oriented, and structured around biological safety. Output as a JSON array of 3 strings.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          }
        }
      });

      const suggestions = JSON.parse(response.text || "[]");
      res.json({ suggestions });
    } catch (err: any) {
      const { status, message } = handleGeminiError(err, "Gemini Optimize API");
      res.status(status).json({ error: message });
    }
  });

  // Gemini Blood Analyzer API
  app.post("/api/gemini/analyze-blood", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured inside the server environment. Please define it in your Secrets settings." 
      });
    }

    try {
      const { text, fileData, mimeType, compounds = [], healthProfile } = req.body;
      
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
        model: "gemini-3.5-flash",
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
