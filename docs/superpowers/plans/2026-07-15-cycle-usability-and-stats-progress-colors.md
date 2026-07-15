# Cycle Usability And Stats Progress Colors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Cycle tab for easier protocol management and refine the existing Stats progress bars with stronger ending-cycle status colors.

**Architecture:** Extend `src/lib/statsTimeline.ts` into a shared protocol timeline helper that can power both Stats and Cycle. Replace the Cycle tab's `CompoundCard` grid with compact protocol management cards, then update Stats row accents/progress bars to use the shared status colors.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Tailwind utility classes, lucide-react icons.

## Global Constraints

- Must remain readable in clinical dark and clinical light modes.
- Avoid dark-only backgrounds in new chips and boxes.
- New cards must not clip long compound names.
- Action buttons should fit on small mobile widths without forcing horizontal scroll.
- Keep visible card nesting shallow.
- Do not add duplicate Stats progress bars.
- Preserve add/edit compound modal, retroactive log modal, import/export panel, delete, complete/reactivate, existing data shape, and persistence.
- No new charting library.
- No new database schema or persistence changes.
- No medical recommendations.
- Do not change Daily tab behavior.

---

## File Structure

- Modify `src/lib/statsTimeline.ts`: export reusable row helpers for Cycle and add status tone metadata.
- Modify `src/lib/statsTimeline.test.ts`: cover completed rows, ending-soon status, and draw labels.
- Modify `src/components/CyclePlanner.tsx`: replace main compound grid with compact filtered protocol cards.
- Modify `src/components/StatsView.tsx`: color existing progress bars/card accents by row status.

---

### Task 1: Shared Protocol Timeline Helpers

**Files:**
- Modify: `src/lib/statsTimeline.ts`
- Modify: `src/lib/statsTimeline.test.ts`

**Interfaces:**
- Consumes: `Compound`, `DoseLog`.
- Produces:
  - `buildProtocolRows(compounds: Compound[], logs: DoseLog[], todayISO?: string): StatsCompoundRow[]`
  - `getStatusTone(status: StatsCompoundRow['status']): StatusTone`
  - `StatusTone` with `chipClass`, `barClass`, `accentClass`, and `label`.

- [ ] **Step 1: Add failing helper tests**

Append these tests to `src/lib/statsTimeline.test.ts`:

```ts
it('includes completed rows for protocol management and marks ending soon', () => {
  const endingSoon: Compound = {
    ...baseCompound,
    id: 'ending',
    name: 'Ending Compound',
    startDate: '2026-07-01',
    durationWeeks: 3,
    isCompleted: false,
  };
  const completed: Compound = {
    ...baseCompound,
    id: 'completed',
    name: 'Completed Compound',
    isCompleted: true,
  };

  const rows = buildProtocolRows([endingSoon, completed], [], '2026-07-20');

  expect(rows).toHaveLength(2);
  expect(rows.find(row => row.id === 'ending')).toMatchObject({
    status: 'Ending soon',
    daysLeft: 2,
  });
  expect(rows.find(row => row.id === 'completed')).toMatchObject({
    status: 'Completed',
    daysLeft: 0,
  });
});

it('returns status tone classes for existing progress bars', () => {
  expect(getStatusTone('Ending soon')).toMatchObject({
    label: 'Ending soon',
    barClass: 'bg-gradient-to-r from-amber-300 to-orange-400',
  });
  expect(getStatusTone('Completed')).toMatchObject({
    label: 'Completed',
    barClass: 'bg-gradient-to-r from-slate-400 to-slate-500',
  });
});
```

Update the test import:

```ts
import { buildProtocolRows, buildStatsTimelineViewModel, getDrawLabel, getStatusTone } from './statsTimeline';
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/lib/statsTimeline.test.ts`

Expected: FAIL because `buildProtocolRows`, `getStatusTone`, and `Completed` status do not exist yet.

- [ ] **Step 3: Extend helper types and functions**

In `src/lib/statsTimeline.ts`, change the `status` union:

```ts
status: 'Ending soon' | 'No logs yet' | 'Recently logged' | 'On track' | 'Completed';
```

Add this interface and constant after `StatsTimelineViewModel`:

```ts
export interface StatusTone {
  label: StatsCompoundRow['status'];
  chipClass: string;
  barClass: string;
  accentClass: string;
}

const STATUS_TONES: Record<StatsCompoundRow['status'], StatusTone> = {
  'Ending soon': {
    label: 'Ending soon',
    chipClass: 'border-amber-500/40 bg-amber-500/12 text-amber-300',
    barClass: 'bg-gradient-to-r from-amber-300 to-orange-400',
    accentClass: 'border-amber-500/30',
  },
  'No logs yet': {
    label: 'No logs yet',
    chipClass: 'border-slate-500/35 bg-slate-500/10 text-slate-300',
    barClass: 'bg-gradient-to-r from-slate-400 to-slate-500',
    accentClass: 'border-slate-500/25',
  },
  'Recently logged': {
    label: 'Recently logged',
    chipClass: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
    barClass: 'bg-gradient-to-r from-cyan-400 to-emerald-400',
    accentClass: 'border-emerald-500/25',
  },
  'On track': {
    label: 'On track',
    chipClass: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300',
    barClass: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    accentClass: 'border-cyan-500/25',
  },
  Completed: {
    label: 'Completed',
    chipClass: 'border-slate-500/35 bg-slate-500/10 text-slate-300',
    barClass: 'bg-gradient-to-r from-slate-400 to-slate-500',
    accentClass: 'border-slate-500/25',
  },
};

export function getStatusTone(status: StatsCompoundRow['status']): StatusTone {
  return STATUS_TONES[status];
}
```

Update `getStatus()`:

```ts
function getStatus(compound: Compound, logs: DoseLog[], daysLeft: number, todayISO: string): StatsCompoundRow['status'] {
  if (compound.isCompleted) return 'Completed';
  if (daysLeft > 0 && daysLeft <= 7) return 'Ending soon';
  if (logs.length === 0) return 'No logs yet';
  const latest = logs.map(log => log.date).sort().at(-1);
  if (latest && daysBetween(parseISODate(latest), parseISODate(todayISO)) <= 2) return 'Recently logged';
  return 'On track';
}
```

Update `buildRow()` to call:

```ts
status: getStatus(compound, compoundLogs, daysLeft, todayISO),
```

Add `buildProtocolRows()`:

```ts
export function buildProtocolRows(compounds: Compound[], logs: DoseLog[], todayISO = new Date().toISOString().slice(0, 10)): StatsCompoundRow[] {
  return compounds.map(compound => buildRow(compound, logs, todayISO));
}
```

Keep `buildStatsTimelineViewModel()` filtering to active compounds only.

- [ ] **Step 4: Run targeted tests**

Run: `npm test -- src/lib/statsTimeline.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/statsTimeline.ts src/lib/statsTimeline.test.ts
git commit -m "Extend protocol timeline helpers"
```

---

### Task 2: Cycle Tab Compact Management UI

**Files:**
- Modify: `src/components/CyclePlanner.tsx`

**Interfaces:**
- Consumes: `buildProtocolRows()`, `getStatusTone()`, and `StatsCompoundRow` from `src/lib/statsTimeline.ts`.
- Produces: filtered compact Cycle protocol cards preserving existing modals and handlers.

- [ ] **Step 1: Update imports**

In `src/components/CyclePlanner.tsx`, remove unused `CompoundCard` import. Add imports:

```ts
import { buildProtocolRows, getStatusTone, StatsCompoundRow } from '../lib/statsTimeline';
```

Add `Search` to the lucide import if a search icon is desired. Do not add a search input in this pass.

- [ ] **Step 2: Add filter state and view-model derivation**

Inside `CyclePlanner`, near the other state declarations, add:

```ts
type CycleFilter = 'all' | 'steroids' | 'peptides' | 'ending' | 'completed';
const [cycleFilter, setCycleFilter] = useState<CycleFilter>('all');
```

After `pctCandidates`, add:

```ts
const protocolRows = useMemo(() => buildProtocolRows(compounds, logs), [compounds, logs]);
const activeCount = protocolRows.filter(row => row.status !== 'Completed').length;
const endingSoonCount = protocolRows.filter(row => row.status === 'Ending soon').length;
const latestEnd = protocolRows
  .filter(row => row.status !== 'Completed')
  .map(row => row.endISO)
  .sort()
  .at(-1);
const latestEndDaysLeft = protocolRows
  .filter(row => row.status !== 'Completed')
  .map(row => row.daysLeft)
  .sort((a, b) => b - a)[0] ?? 0;

const rowById = new Map(protocolRows.map(row => [row.id, row]));
const visibleCompounds = compounds.filter(compound => {
  const row = rowById.get(compound.id);
  if (!row) return false;
  if (cycleFilter === 'steroids') return compound.type === 'steroid';
  if (cycleFilter === 'peptides') return compound.type === 'peptide';
  if (cycleFilter === 'ending') return row.status === 'Ending soon';
  if (cycleFilter === 'completed') return row.status === 'Completed';
  return row.status !== 'Completed';
});
```

- [ ] **Step 3: Add local compact card component**

Inside `CyclePlanner`, before `return`, add:

```tsx
const filterOptions: { key: CycleFilter; label: string; count: number }[] = [
  { key: 'all', label: 'All', count: compounds.filter(c => !c.isCompleted).length },
  { key: 'steroids', label: 'Steroids', count: compounds.filter(c => !c.isCompleted && c.type === 'steroid').length },
  { key: 'peptides', label: 'Peptides', count: compounds.filter(c => !c.isCompleted && c.type === 'peptide').length },
  { key: 'ending', label: 'Ending soon', count: endingSoonCount },
  { key: 'completed', label: 'Completed', count: compounds.filter(c => c.isCompleted).length },
];

const ProtocolCard = ({ compound, row }: { compound: Compound; row: StatsCompoundRow }) => {
  const tone = getStatusTone(row.status);
  return (
    <article className={`labrat-card p-4 sm:p-5 min-w-0 ${tone.accentClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2.5">
          <span className="w-3 h-3 rounded-full shrink-0 mt-1.5 shadow-[0_0_16px_currentColor]" style={{ background: compound.color, color: compound.color }} />
          <div className="min-w-0">
            <h4 className="labrat-title text-lg font-black leading-tight break-words">{compound.name}</h4>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-semibold">
              <span className="labrat-dose-chip px-2 py-1">{compound.type}</span>
              <span className="labrat-dose-chip px-2 py-1">{row.doseLabel}</span>
              {row.drawLabel && <span className="labrat-dose-chip labrat-dose-chip-accent px-2 py-1">{row.drawLabel}</span>}
              <span className="labrat-dose-chip px-2 py-1">{row.frequencyLabel}</span>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${tone.chipClass}`}>
          {tone.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="labrat-muted flex items-center justify-between gap-3 text-[12px] font-mono">
          <span>{row.startLabel}</span>
          <span>{row.progressPct}%</span>
          <span>{row.endLabel}</span>
        </div>
        <div className="labrat-progress-track h-2 mt-2 overflow-hidden">
          <div className={`h-full rounded-full ${tone.barClass}`} style={{ width: `${row.progressPct}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="labrat-mini-surface p-2.5">
          <strong className="labrat-title block text-base tabular-nums">{row.daysLeft}</strong>
          <span className="labrat-muted text-[10px] uppercase tracking-wide">days left</span>
        </div>
        <div className="labrat-mini-surface p-2.5">
          <strong className="labrat-title block text-base tabular-nums">{row.loggedCount}</strong>
          <span className="labrat-muted text-[10px] uppercase tracking-wide">logged</span>
        </div>
        <div className="labrat-mini-surface p-2.5">
          <strong className="labrat-title block text-base truncate">{row.lastLoggedLabel}</strong>
          <span className="labrat-muted text-[10px] uppercase tracking-wide">last dose</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button type="button" onClick={() => openFormEdit(compound)} className="labrat-button-secondary py-2 px-3 text-xs cursor-pointer">Edit</button>
        <button type="button" onClick={() => handleOpenRetroLog(compound.id)} className="labrat-button-secondary py-2 px-3 text-xs cursor-pointer">History</button>
        <button type="button" onClick={() => onUpdateCompound({ ...compound, isCompleted: !compound.isCompleted })} className="labrat-button-secondary py-2 px-3 text-xs cursor-pointer">
          {compound.isCompleted ? 'Reactivate' : 'Complete'}
        </button>
        <button type="button" onClick={() => onDeleteCompound(compound.id)} className="labrat-button-secondary py-2 px-3 text-xs text-rose-300 hover:text-rose-200 cursor-pointer">Delete</button>
      </div>
    </article>
  );
};
```

- [ ] **Step 4: Replace top action bar and compound grid**

Edit the visible Cycle tab JSX in three exact regions:

1. Replace the existing `/* Top action bar */` section with a new `labrat-card-strong` summary header containing:
   - `Cycle Builder` kicker.
   - `Protocol control` heading.
   - One sentence of helper text.
   - `Import / Export` toggle button using `showHelperTools` and `setShowHelperTools`.
   - `Add Compound` button using `openFormNew` and retaining `id="new-formulate-btn"`.
   - Four metric tiles for `activeCount`, `endingSoonCount`, `logs.length`, and `latestEnd ? latestEndDaysLeft : 0`.
   - Horizontal filter chip row rendered from `filterOptions`.

2. Leave the existing `{visibility.dataControls && showHelperTools && (...)}` data-controls JSX block intact. Do not change labels, inputs, save button behavior, or export/import handlers inside that block.

3. Replace only the main compound list conditional with:
   - Existing no-compounds empty state when `compounds.length === 0`.
   - New filtered-empty card when `visibleCompounds.length === 0`; include a `Show all` button calling `setCycleFilter('all')`.
   - `grid grid-cols-1 lg:grid-cols-2 gap-3` rendering `ProtocolCard` for `visibleCompounds`.
   - Full-width bottom `Add Compound` button using `openFormNew`.

Keep the `/* Cycle History Timeline */` section and every modal after it in the file.

- [ ] **Step 5: Run TypeScript**

Run: `npm run lint`

Expected: PASS. Remove any now-unused imports from `CyclePlanner.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/components/CyclePlanner.tsx
git commit -m "Redesign cycle protocol management"
```

---

### Task 3: Refine Existing Stats Progress Colors

**Files:**
- Modify: `src/components/StatsView.tsx`

**Interfaces:**
- Consumes: `getStatusTone()` from `src/lib/statsTimeline.ts`.
- Produces: existing Stats compound rows with status-colored accents and progress bars. No new duplicate progress section.

- [ ] **Step 1: Replace local status classes**

In `src/components/StatsView.tsx`, update import:

```ts
import { buildStatsTimelineViewModel, getStatusTone, StatsCompoundRow } from '../lib/statsTimeline';
```

Delete the local `statusClasses` constant.

- [ ] **Step 2: Use status tone in `CompoundTimelineRow`**

At the top of `CompoundTimelineRow`, add:

```ts
const tone = getStatusTone(row.status);
```

Update the article class:

```tsx
<article className={`labrat-card p-4 sm:p-5 min-w-0 ${tone.accentClass}`}>
```

Update the status chip:

```tsx
<span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${tone.chipClass}`}>
  {tone.label}
</span>
```

Update the row progress bar:

```tsx
<div className={`h-full rounded-full ${tone.barClass}`} style={{ width: `${row.progressPct}%` }} />
```

- [ ] **Step 3: Make existing days-left/percent stronger without adding new bars**

In the timeline label row, change the percent span to:

```tsx
<span className={row.status === 'Ending soon' ? 'font-black text-amber-300' : 'font-black text-cyan-300'}>{row.progressPct}%</span>
```

Do not add a new `Cycle endings` section or duplicate progress bars.

- [ ] **Step 4: Run verification**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/StatsView.tsx src/lib/statsTimeline.ts src/lib/statsTimeline.test.ts
git commit -m "Color code stats cycle progress"
```

---

## Final Verification

- [ ] Run `npm run smoke:themes` against a local built server.
- [ ] Capture mobile Cycle screenshots in dark and light mode with oil, peptide, and completed compounds.
- [ ] Capture mobile Stats screenshots in dark and light mode showing status-colored existing progress bars.
- [ ] Merge to `main`, run `npm run lint`, `npm test`, `npm run build`, and `npm run smoke:themes`.
- [ ] Push `main`.
- [ ] Confirm Vercel production deployment is Ready.
