# LabRat Cycle Usability And Stats Endings Design

## Goal

Redesign the Cycle tab so it is easier to manage an active protocol, and refine the Stats tab so active compounds ending their cycles are easier to scan without duplicating the progress bars that already exist.

## User-Approved Direction

The Cycle tab should become a protocol management surface instead of a long stack of heavy compound cards. The Stats tab should keep the new timeline dashboard and improve the existing compound progress bars with clearer color/status treatment.

## Cycle Tab Layout

### Header

The top of the Cycle tab will show a concise protocol summary:

- Active compound count.
- Compounds ending soon.
- Total doses logged.
- Latest active cycle end date or days left.

The primary action should be `Add Compound`. Import/export should move into a smaller secondary control so it does not compete with normal use.

### Filtering

Add simple filter chips:

- `All`
- `Steroids`
- `Peptides`
- `Ending soon`
- `Completed`

Filters apply to the visible compound list only. They do not change stored data.

### Compound List

Replace bulky `CompoundCard` usage in the main Cycle list with compact protocol cards/rows designed for management. Each visible compound should show:

- Name and type.
- Dose and schedule.
- Draw amount when calculable from reconstitution or oil concentration.
- Start date, end date, percent complete, and days left.
- Doses logged count.
- Quick actions: edit, history/logs, complete or reactivate, delete.

Cards must avoid horizontal overflow on mobile, especially when names are long.

### Empty States

If there are no compounds, show a direct empty state with an `Add Compound` action. If a filter returns no results, show a small filtered-empty state and let the user return to `All`.

### Existing Behavior To Preserve

- Add/edit compound modal.
- Retroactive log modal.
- Import/export panel.
- Delete and complete/reactivate actions.
- Existing data shape and persistence.

## Stats Tab Refinement

The Stats tab already has per-compound progress bars. Do not add redundant progress bars. Instead, refine the existing active compound timeline rows so the ending-cycle state is easier to see at a glance.

Each active compound row should get stronger status treatment:

- Keep the existing row progress bar.
- Color the existing progress bar and/or card accent by status:
  - Cyan/blue for normal active progress.
  - Amber for ending soon.
  - Slate for no logs yet or inactive-looking informational state.
  - Rose only for attention states.
- Make days left and percent complete visually stronger in the row.
- Optionally add a small `Ending soon` summary strip above the rows only if it avoids repetition and improves scanning.

The refinement should help users quickly see which compounds are closest to ending without reading every detail and without adding duplicate cards.

## Data And Helpers

Reuse or extend `src/lib/statsTimeline.ts` where possible so Cycle and Stats share date/progress/draw calculations. Avoid duplicating cycle end math in multiple components.

If Cycle needs additional fields, add them to the helper view model only when they are needed by the redesigned UI.

## Theme And Mobile Requirements

- Must remain readable in clinical dark and clinical light modes.
- Avoid dark-only backgrounds in new chips and boxes.
- New cards must not clip long compound names.
- Action buttons should fit on small mobile widths without forcing horizontal scroll.
- Keep visible card nesting shallow.

## Testing And Verification

Run:

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run smoke:themes`

Also verify with mobile browser screenshots for:

- Cycle tab in dark mode with oil, peptide, and completed compounds.
- Cycle tab in light mode.
- Stats tab showing the refined existing progress bars and status colors in dark and light mode.

## Out Of Scope

- New charting library.
- New database schema or persistence changes.
- New medical recommendations.
- Changing Daily tab behavior.
- Removing import/export functionality.
