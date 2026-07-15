# LabRat Stats Timeline Dashboard Design

## Goal

Revamp the Stats tab from a duplicated cycle-card view into a timeline-first dashboard. The first screen should answer: where am I in the active cycle, what is ending soon, what has been logged, and which compounds need attention.

## User-Approved Direction

Use the Timeline Dashboard approach:

- Lead with overall cycle progress and active-cycle timing.
- Show a horizontal cycle runway from earliest active start to latest active end.
- Replace full `CompoundCard` reuse with compact timeline rows designed for Stats.
- Keep administration history below as a secondary record with undo support.

## Layout

### Header Summary

The top of `StatsView` will use a stronger dashboard header with:

- Overall active cycle percent complete.
- Days left until the latest active cycle end.
- Active compound count.
- Doses logged in the current week.

The copy should be concise and operational, not marketing-heavy.

### Cycle Runway

Below the header, show a single timeline band:

- Start label: earliest active compound start date.
- End label: latest active compound end date.
- Filled progress based on today within that full active-cycle window.
- Current-day marker when today falls inside the window.

If no active compounds exist, replace this with an empty state that points the user to the Cycle tab.

### Active Compound Timeline Rows

Each active compound will render as a compact row/card with:

- Name and type badge.
- Dose and frequency.
- Draw quantity when calculable from peptide reconstitution or oil concentration.
- Start date, end date, days left, percent complete.
- Doses logged for that compound.
- Last logged date or `No logs yet`.
- Small progress bar.

Rows should be easy to scan on mobile and should not expose edit/delete controls. Stats is read-oriented.

### Attention States

Each compound row can show one subtle status chip:

- `Ending soon` when the compound has 7 or fewer days left and is not complete.
- `No logs yet` when no dose logs exist for the compound.
- `Recently logged` when the latest log is within the last 2 days.
- `On track` as the default healthy state.

These are informational only. No medical or diagnostic claims.

### Administration History

Keep `AdministrationLedger` below the timeline section. Give it a lighter section header so it feels secondary to the dashboard but remains available for review and undo.

### Encyclopedia Link

Keep the encyclopedia entry point at the bottom, visually smaller than the dashboard content.

## Data And Helpers

`StatsView` will use local helper functions for:

- Parsing local dates safely.
- Calculating compound end dates from `startDate` and `durationWeeks`.
- Calculating percent complete.
- Formatting days left.
- Counting current-week logs.
- Producing draw labels for peptides and oil-based compounds.

No persistence changes are required. The tab derives all information from existing `compounds` and `logs` props.

## Theme And Mobile Requirements

- Must remain readable in clinical dark and clinical light modes.
- Avoid dark-only chip backgrounds.
- Use responsive grids that do not clip long compound names.
- Keep cards compact enough that mobile users can see more than one compound row per screen when possible.

## Testing And Verification

Run:

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run smoke:themes`

Also verify with a mobile browser screenshot containing:

- At least one oil/steroid compound.
- At least one peptide compound.
- A light theme render check for text contrast.

## Out Of Scope

- New charts library.
- New persistent analytics tables.
- Medical interpretation or recommendations.
- Editing compounds from the Stats tab.
- Changing the existing administration ledger behavior.
