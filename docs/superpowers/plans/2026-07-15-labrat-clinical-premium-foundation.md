# LabRat Clinical Premium Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the app-wide clinical premium foundation so LabRat feels polished, readable, and consistent across `clinical-light`, `clinical`, and `neon`.

**Architecture:** Add shared CSS primitives in `src/index.css`, then apply them to the app shell and highest-reuse surfaces without changing data or business logic. Keep the migration incremental: existing Tailwind utilities remain, while new `labrat-*` classes define the premium baseline for future screen passes.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind utility classes, lucide-react, Vitest, Puppeteer for local smoke checks.

## Global Constraints

- Do not change Firebase data models, shop pricing, order logic, push notification logic, cron behavior, AI provider behavior, or medical calculations.
- Do not rewrite major app screens from scratch.
- Do not introduce a full component library migration in this pass.
- Do not remove the `neon` theme personality; refine it.
- Do not deploy incomplete visual states where clinical-light contrast is unverified.
- Preserve compact mobile-first utility; do not add marketing-style landing pages.

---

## File Structure

- Modify `src/index.css`: define reusable clinical premium primitives and theme-specific variants.
- Modify `src/App.tsx`: apply `labrat-page-shell` to the routed content wrapper and keep tab logic unchanged.
- Modify `src/components/AppHeader.tsx`: apply premium header/nav/button primitives without changing navigation rules.
- Modify `src/components/CycleDashboard.tsx`: migrate the dashboard hero and metric surfaces to the shared primitives.
- Modify `src/components/DailyDosing.tsx`: migrate daily dose/list empty states and repeated panels.
- Modify `src/components/CompoundCard.tsx`: align compound cards with shared surface and status primitives.
- Modify `src/components/CompoundFormModal.tsx`: apply form, modal, input, and button primitives.
- Modify `src/components/SettingsPage.tsx`: align settings hero, theme selector cards, and controls with the primitives.
- Modify `src/components/ToastContainer.tsx`: make toast surfaces theme-safe and consistent.
- Create `scripts/smoke-labrat-themes.mjs`: local browser smoke check for `neon`, `clinical`, and `clinical-light`.

---

### Task 1: Add Foundation CSS Primitives

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces CSS classes: `labrat-page-shell`, `labrat-page-header`, `labrat-page-title`, `labrat-page-subtitle`, `labrat-card`, `labrat-card-strong`, `labrat-panel`, `labrat-mini-surface`, `labrat-button-primary`, `labrat-button-secondary`, `labrat-icon-button`, `labrat-input`, `labrat-status-badge`, `labrat-title`, `labrat-body`, `labrat-muted`.
- Later tasks consume those class names directly in JSX.

- [ ] **Step 1: Add the base primitive block**

Append this block near the existing theme CSS in `src/index.css`, after the shop premium primitives so the foundation classes can intentionally override older utility-heavy surfaces:

```css
/* ── clinical premium foundation primitives ───────────────────────────── */
.labrat-page-shell {
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1rem 6rem;
}

.labrat-page-header {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.25rem;
  background: rgba(2, 6, 23, 0.72);
  padding: 1rem;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.22);
}

.labrat-page-title,
.labrat-title {
  color: #f8fafc;
  font-weight: 900;
  letter-spacing: 0;
}

.labrat-page-subtitle,
.labrat-body {
  color: #cbd5e1;
  line-height: 1.55;
}

.labrat-muted {
  color: #94a3b8;
}

.labrat-card,
.labrat-panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1rem;
  background: rgba(11, 19, 41, 0.74);
  color: #e2e8f0;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.18);
}

.labrat-card-strong {
  border: 1px solid rgba(34, 211, 238, 0.22);
  border-radius: 1.25rem;
  background: rgba(8, 15, 31, 0.88);
  color: #f8fafc;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.24);
}

.labrat-mini-surface {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0.875rem;
  background: rgba(15, 23, 42, 0.58);
  color: #e2e8f0;
}

.labrat-button-primary,
.labrat-button-secondary,
.labrat-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.875rem;
  font-weight: 800;
  letter-spacing: 0;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 120ms ease;
}

.labrat-button-primary {
  background: #06b6d4;
  color: #020617;
  border: 1px solid rgba(103, 232, 249, 0.35);
}

.labrat-button-primary:hover {
  background: #22d3ee;
}

.labrat-button-secondary,
.labrat-icon-button {
  background: rgba(15, 23, 42, 0.72);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.labrat-button-secondary:hover,
.labrat-icon-button:hover {
  background: rgba(30, 41, 59, 0.9);
  color: #f8fafc;
}

.labrat-input {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 0.875rem;
  background: rgba(2, 6, 23, 0.82);
  color: #f8fafc;
  outline: none;
}

.labrat-input:focus {
  border-color: rgba(34, 211, 238, 0.58);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.10);
}

.labrat-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.72);
}
```

- [ ] **Step 2: Add clinical theme overrides**

Add:

```css
html[data-labrat-theme="clinical"] .labrat-page-header,
html[data-labrat-theme="clinical"] .labrat-card,
html[data-labrat-theme="clinical"] .labrat-card-strong,
html[data-labrat-theme="clinical"] .labrat-panel,
html[data-labrat-theme="clinical"] .labrat-mini-surface {
  background-color: rgba(2, 6, 23, 0.86) !important;
  border-color: rgba(148, 163, 184, 0.24) !important;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.22) !important;
}

html[data-labrat-theme="clinical"] .labrat-button-primary {
  background: #2563eb !important;
  border-color: rgba(147, 197, 253, 0.35) !important;
  color: #ffffff !important;
}
```

- [ ] **Step 3: Add clinical-light overrides**

Add:

```css
html[data-labrat-theme="clinical-light"] .labrat-page-header,
html[data-labrat-theme="clinical-light"] .labrat-card,
html[data-labrat-theme="clinical-light"] .labrat-card-strong,
html[data-labrat-theme="clinical-light"] .labrat-panel,
html[data-labrat-theme="clinical-light"] .labrat-mini-surface {
  background: rgba(255, 255, 255, 0.92) !important;
  border-color: rgba(148, 163, 184, 0.32) !important;
  color: #0f172a !important;
  box-shadow: 0 2px 16px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.04) !important;
}

html[data-labrat-theme="clinical-light"] .labrat-page-title,
html[data-labrat-theme="clinical-light"] .labrat-title {
  color: #0f172a !important;
}

html[data-labrat-theme="clinical-light"] .labrat-page-subtitle,
html[data-labrat-theme="clinical-light"] .labrat-body {
  color: #334155 !important;
}

html[data-labrat-theme="clinical-light"] .labrat-muted {
  color: #64748b !important;
}

html[data-labrat-theme="clinical-light"] .labrat-button-primary {
  background: #2563eb !important;
  border-color: rgba(37, 99, 235, 0.28) !important;
  color: #ffffff !important;
}

html[data-labrat-theme="clinical-light"] .labrat-button-secondary,
html[data-labrat-theme="clinical-light"] .labrat-icon-button,
html[data-labrat-theme="clinical-light"] .labrat-input,
html[data-labrat-theme="clinical-light"] .labrat-status-badge {
  background: rgba(248, 250, 252, 0.92) !important;
  border-color: rgba(148, 163, 184, 0.38) !important;
  color: #0f172a !important;
}
```

- [ ] **Step 4: Run CSS-impact verification**

Run: `npm run lint`

Expected: exits 0. TypeScript will not validate CSS, but this ensures no accidental JSX edits are part of this task.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "Add LabRat clinical premium foundation styles"
```

---

### Task 2: Apply Foundation To App Shell And Navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/AppHeader.tsx`

**Interfaces:**
- Consumes CSS classes from Task 1.
- Produces shell markup that later screen tasks can sit inside without extra wrapper hacks.

- [ ] **Step 1: Update the main content wrapper in `src/App.tsx`**

Find the main animated content wrapper around active tab rendering and add `labrat-page-shell` to the existing wrapper class. The result should keep the existing animation and conditional rendering intact:

```tsx
<motion.main
  key={activeTab}
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.18, ease: 'easeOut' }}
  className="labrat-page-shell"
>
```

If the current element already has layout classes, preserve them and append `labrat-page-shell`.

- [ ] **Step 2: Update header chrome in `src/components/AppHeader.tsx`**

Apply `labrat-card-strong` or `labrat-panel` to the top header container while preserving existing IDs and event handlers:

```tsx
<header id="app-header" className="labrat-card-strong sticky top-0 z-50 mx-auto w-full max-w-6xl px-3 py-2">
```

Use `labrat-icon-button` on repeated header icon buttons:

```tsx
className={`labrat-icon-button h-10 w-10 ${active ? 'text-cyan-300' : ''}`}
```

Do not change button order, tab availability, auth behavior, or settings navigation.

- [ ] **Step 3: Update nav rail buttons**

In `AppHeader.tsx`, add `labrat-button-secondary` to inactive tab buttons and `labrat-button-primary` to the active tab button. Preserve the existing active-tab logic:

```tsx
className={`h-11 px-3 text-xs ${
  activeTab === tab
    ? 'labrat-button-primary'
    : 'labrat-button-secondary'
}`}
```

- [ ] **Step 4: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/AppHeader.tsx
git commit -m "Apply premium foundation to LabRat shell"
```

---

### Task 3: Migrate Dashboard And Daily Repeated Surfaces

**Files:**
- Modify: `src/components/CycleDashboard.tsx`
- Modify: `src/components/DailyDosing.tsx`
- Modify: `src/components/CompoundCard.tsx`

**Interfaces:**
- Consumes shell and primitive classes from Tasks 1-2.
- Produces primary app screens that use `labrat-card`, `labrat-card-strong`, `labrat-mini-surface`, `labrat-title`, `labrat-body`, and `labrat-muted`.

- [ ] **Step 1: Update dashboard hero**

In `CycleDashboard.tsx`, keep `labrat-command-hero` but add `labrat-page-header` and use typography primitives:

```tsx
<section className="labrat-command-hero labrat-page-header" id="labrat-command-hero">
  <motion.div className="labrat-command-hero-copy" style={{ y: heroCopyY }}>
    <span className="labrat-command-eyebrow">{labratTheme === 'neon' ? 'LabRat Research Console' : 'Clinical Research Console'}</span>
    <h2 className="labrat-page-title">Your Protocol, Under Control</h2>
    <p className="labrat-page-subtitle">A compact overview of today's schedule, active compounds, and recovery signals.</p>
  </motion.div>
</section>
```

Preserve the existing text content unless a class change requires moving class names to the existing elements.

- [ ] **Step 2: Update dashboard metric blocks**

For each metric surface inside `labrat-command-metrics`, add `labrat-mini-surface`:

```tsx
<div className="labrat-mini-surface">
  <strong>{activeCompounds.length}</strong>
  <span>Active Compounds</span>
</div>
```

- [ ] **Step 3: Update DailyDosing panels**

In `DailyDosing.tsx`, replace repeated dark panel wrappers with `labrat-card` while preserving their current spacing:

```tsx
<div className="labrat-card p-4">
```

For empty states use:

```tsx
<div className="labrat-card p-6 text-center">
  <h3 className="labrat-title text-base">No doses scheduled</h3>
  <p className="labrat-body text-xs mt-1">Your current protocol has no administrations due for this date.</p>
</div>
```

- [ ] **Step 4: Update CompoundCard shell**

In `CompoundCard.tsx`, add `labrat-card` to the outer card, and use `labrat-status-badge` on status/category badges where the badge is not color-critical:

```tsx
<motion.div className="labrat-card p-4 transition-all">
```

Do not change dose calculations, schedule labels, guided actions, delete behavior, or log buttons.

- [ ] **Step 5: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/CycleDashboard.tsx src/components/DailyDosing.tsx src/components/CompoundCard.tsx
git commit -m "Polish dashboard and daily surfaces"
```

---

### Task 4: Migrate Forms, Settings, And Toasts

**Files:**
- Modify: `src/components/CompoundFormModal.tsx`
- Modify: `src/components/SettingsPage.tsx`
- Modify: `src/components/ToastContainer.tsx`

**Interfaces:**
- Consumes primitive classes from Task 1.
- Produces theme-safe controls that can be reused as examples for later modal/screen passes.

- [ ] **Step 1: Update CompoundFormModal modal shell**

Apply `labrat-card-strong` to the modal container:

```tsx
<motion.div className="labrat-card-strong w-full max-w-lg p-5">
```

For text inputs, selects, and textareas, append `labrat-input` while keeping existing sizing classes:

```tsx
className="labrat-input px-4 py-2.5 text-xs transition-all"
```

- [ ] **Step 2: Update CompoundFormModal buttons**

Use:

```tsx
className="labrat-button-primary px-4 py-2 text-xs"
```

for primary next/save actions, and:

```tsx
className="labrat-button-secondary px-4 py-2 text-xs"
```

for cancel/back/secondary actions. Keep disabled conditions and handlers unchanged.

- [ ] **Step 3: Update SettingsPage hero and cards**

In `SettingsPage.tsx`, add `labrat-page-header` to `#settings-hero`, use `labrat-card` for settings sections, and use `labrat-button-secondary` for theme option cards that behave like buttons.

Example:

```tsx
<section className="labrat-command-hero labrat-page-header" id="settings-hero">
```

```tsx
<button className={`labrat-card p-4 text-left ${labratTheme === 'clinical-light' ? 'border-blue-500/30' : 'border-cyan-500/25'}`}>
```

Preserve all theme-setting behavior.

- [ ] **Step 4: Update ToastContainer**

Wrap toast items with `labrat-card-strong` for high-contrast readability:

```tsx
<motion.div className="labrat-card-strong p-3">
```

Keep notification types, dismissal behavior, and persistence unchanged.

- [ ] **Step 5: Run verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/CompoundFormModal.tsx src/components/SettingsPage.tsx src/components/ToastContainer.tsx
git commit -m "Polish forms settings and toasts"
```

---

### Task 5: Add Theme Smoke Check Script

**Files:**
- Create: `scripts/smoke-labrat-themes.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces npm script `smoke:themes`.
- Consumes local dev server at `http://127.0.0.1:3000`.

- [ ] **Step 1: Create the smoke script**

Create `scripts/smoke-labrat-themes.mjs`:

```js
import puppeteer from 'puppeteer';

const baseUrl = process.env.LABRAT_SMOKE_URL || 'http://127.0.0.1:3000';
const themes = ['neon', 'clinical', 'clinical-light'];
const routes = [
  { name: 'dashboard', url: '/?tab=dashboard', selector: '#labrat-command-hero' },
  { name: 'planner', url: '/?tab=planner', selector: '#planner-page' },
  { name: 'shop', url: '/?tab=shop', selector: '#members-shop-page' },
  { name: 'settings', url: '/?tab=settings', selector: '#settings-hero' },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  for (const theme of themes) {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
      await page.evaluateOnNewDocument((selectedTheme) => {
        localStorage.setItem('labrat_ui_theme', selectedTheme);
        localStorage.setItem('labrat_theme_selected', 'true');
        localStorage.setItem('labrat_in_app_branding', 'lr');
        localStorage.setItem('labrat_tracking_enabled', 'true');
        localStorage.setItem('labrat_experience_mode', 'expert');
        localStorage.setItem('labrat_experience_prompt_v', '1');
        localStorage.setItem('labrat_hide_shop', 'false');
      }, theme);

      await page.goto(`${baseUrl}${route.url}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector(route.selector, { timeout: 15000 });
      await new Promise((resolve) => setTimeout(resolve, 750));

      const result = await page.evaluate(() => {
        const body = getComputedStyle(document.body);
        const shell = document.querySelector('#labrat-app-shell');
        const shellStyle = shell ? getComputedStyle(shell) : null;
        return {
          theme: document.documentElement.getAttribute('data-labrat-theme'),
          bodyColor: body.color,
          bodyBg: body.backgroundColor,
          shellBg: shellStyle?.backgroundColor || '',
          textLength: document.body.innerText.trim().length,
        };
      });

      if (result.theme !== theme) {
        throw new Error(`Expected theme ${theme}, got ${result.theme} on ${route.name}`);
      }
      if (result.textLength < 50) {
        throw new Error(`Expected visible text on ${theme}/${route.name}`);
      }

      console.log(`${theme}/${route.name}: ${result.bodyColor} on ${result.bodyBg}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
```

- [ ] **Step 2: Add npm script**

In `package.json`, add:

```json
"smoke:themes": "node scripts/smoke-labrat-themes.mjs"
```

Keep existing scripts unchanged.

- [ ] **Step 3: Run targeted script syntax check**

Run:

```bash
node --check scripts/smoke-labrat-themes.mjs
```

Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add scripts/smoke-labrat-themes.mjs package.json
git commit -m "Add LabRat theme smoke check"
```

---

### Task 6: Final Verification And Production Ship

**Files:**
- No planned source edits.

**Interfaces:**
- Consumes all prior tasks.
- Produces a verified commit history on `main` and a production Vercel deployment.

- [ ] **Step 1: Run full tests**

Run:

```bash
npm run test
```

Expected: all Vitest files pass.

- [ ] **Step 2: Run TypeScript lint**

Run:

```bash
npm run lint
```

Expected: exits 0.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: exits 0. Existing Vite chunk-size warnings are acceptable if no errors occur.

- [ ] **Step 4: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Express server listens on port 3000.

- [ ] **Step 5: Run theme smoke check**

In a second terminal while the dev server runs:

```bash
npm run smoke:themes
```

Expected: logs every theme/route pair and exits 0.

- [ ] **Step 6: Stop local dev server**

Send Ctrl-C to the `npm run dev` session.

- [ ] **Step 7: Push to GitHub**

Run:

```bash
git push origin main
```

Expected: `main -> main` succeeds.

- [ ] **Step 8: Confirm Vercel production deployment**

Use the Vercel connector or CLI to confirm the latest `labrat` production deployment references the final pushed commit and reaches `READY`.

Expected:

```text
target: production
readyState: READY
githubCommitSha: <final commit sha>
```

- [ ] **Step 9: Confirm production domain**

Run:

```bash
curl -I https://www.labratapp.app
```

Expected: HTTP 200 from Vercel.
