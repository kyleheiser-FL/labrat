# LabRat Clinical Premium Foundation Design

## Purpose

Give the whole LabRat app the same premium foundation that the shop now has: polished, trustworthy, highly readable, and theme-safe across Light and Dark modes. This pass focuses on shared visual primitives and the app shell first, not on changing medical, shop, Firebase, notification, AI, or scheduler behavior.

## Design Direction

LabRat should feel like a serious health operating system with two user-facing modes and one preference layer:

- `system`: follows the phone/browser color-scheme preference and resolves to Light or Dark automatically.
- `light`: the primary premium look. White/off-white surfaces, dark readable text, restrained blue accents, subtle borders, minimal glow.
- `dark`: professional dark mode. Black/slate surfaces, crisp contrast, restrained blue/emerald accents, very little glow.

Legacy saved `neon` values must map to Dark automatically. Neon must no longer appear as a user-facing theme option.

The app should keep its compact mobile-first utility. This is not a landing-page redesign and should not add marketing hero sections where users need tools.

## Scope

This foundation pass covers app-wide visual primitives and repeated surfaces:

- App shell background and page spacing.
- Header and navigation rail readability.
- Page headers and compact hero sections.
- Card, panel, and form field surfaces.
- Buttons, icon buttons, toggles, segmented controls, metadata pills, and status badges.
- Modal surfaces, loading states, empty states, and toast readability.
- Theme-safe CSS overrides that prevent dark-on-light or light-on-light failures.

This pass should touch repeated structural patterns before individual workflow detail polish. Screen-specific redesigns for Daily, Planner, Library, Blood, Stats, Settings, Guided Mode, and remaining modals should come after the foundation is stable.

## Non-Goals

- Do not change Firebase data models, shop pricing, order logic, push notification logic, cron behavior, AI provider behavior, or medical calculations.
- Do not rewrite major app screens from scratch.
- Do not introduce a full component library migration in this pass.
- Do not expose `neon` as a user-facing theme option.
- Map legacy saved `neon` preferences to Dark.
- Support both automatic System mode and manual Light/Dark switching.
- Do not deploy incomplete visual states where clinical-light contrast is unverified.

## Visual Primitives

Create shared CSS primitives that can be applied incrementally:

- `labrat-page-shell`
- `labrat-page-header`
- `labrat-page-title`
- `labrat-page-subtitle`
- `labrat-card`
- `labrat-card-strong`
- `labrat-panel`
- `labrat-mini-surface`
- `labrat-button-primary`
- `labrat-button-secondary`
- `labrat-icon-button`
- `labrat-input`
- `labrat-status-badge`
- `labrat-title`
- `labrat-body`
- `labrat-muted`

These primitives should define baseline structure and theme-aware color/contrast. Existing utility classes can remain, but repeated visual decisions should move toward these primitives so future screen passes are faster and more consistent.

## Theme Rules

Every primitive must define behavior for the resolved Light and Dark modes.

For Light:

- Use white or near-white panels with slate text.
- Use blue as the main accent and emerald/amber/red only for status meaning.
- Keep shadows subtle and avoid glow effects.
- Ensure muted text remains readable on white surfaces.

For Dark:

- Use black/slate surfaces and quiet blue accents.
- Keep borders visible enough to distinguish stacked panels.
- Avoid bright neon glows unless they indicate a meaningful active state.

## Rollout Plan

### Phase 1: Foundation CSS

Add app-wide primitive classes in `src/index.css`. Keep class names explicit and low-risk. Do not remove existing theme overrides until replacements are verified.

### Phase 2: App Shell

Apply primitives to `src/App.tsx`, `src/components/AppHeader.tsx`, and shared page containers where practical. The header and bottom/rail navigation should look intentional in all themes and remain compact on mobile.

### Phase 3: Common Surfaces

Apply primitives to repeated cards, panels, forms, buttons, and empty states in the highest-reuse components:

- `CycleDashboard.tsx`
- `DailyDosing.tsx`
- `CompoundCard.tsx`
- `CompoundFormModal.tsx`
- `SettingsPage.tsx`
- `ToastContainer.tsx`
- common modal components

### Phase 4: Verification

Run automated checks and a browser smoke pass for System, Dark, and Light preferences at mobile width. The check should verify page load, app shell visibility, resolved theme, and readable foreground/background colors on the major shell surfaces.

## Testing

Required verification:

- `npm run test`
- `npm run lint`
- `npm run build`
- Local browser smoke check for System, Dark, and Light preferences.

The browser smoke check must include at least:

- First-run or expert-mode app load.
- Dashboard/Daily shell.
- Planner shell.
- Shop shell, to ensure the previous premium shop work is not regressed.
- Settings shell, because it controls theme changes.

## Risks

- The app currently has many Tailwind utility classes and broad clinical-light overrides. New primitives must coexist with these rules until the app is fully migrated.
- Too much visual cleanup at once could accidentally change layout density. Keep mobile ergonomics compact.
- Legacy `neon` CSS may remain temporarily for compatibility, but no UI should route users into it.
- System mode must react to phone/browser setting changes without requiring a reload.

## Success Criteria

- The whole app feels more like one product, not separate visual eras.
- Light mode becomes the most polished default-feeling theme.
- Dark mode is readable and professional.
- System mode follows phone/browser settings and can still be overridden manually.
- No known contrast failure on major app shell surfaces.
- No business logic or data behavior changes are introduced by the foundation pass.
