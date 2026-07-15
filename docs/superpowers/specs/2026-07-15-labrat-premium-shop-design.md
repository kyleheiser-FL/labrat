# LabRat Premium Member Shop Design

## Purpose

Upgrade the LabRat member shop so it feels like a premium, trustworthy ordering experience rather than a dense product grid. The work should focus on member conversion, order confidence, and mobile polish while preserving the existing shop architecture.

This is a product and UX improvement pass, not a full rewrite. The current shop already has meaningful pieces: member tiers, product grouping, product drawers, BAC water add-ons, checkout, orders, admin members, admin orders, and admin pricing. The design should compose those pieces into a calmer flow with clearer hierarchy and fewer moments where the user has to infer what happens next.

## Current Context

Relevant files:

- `src/components/MembersShop.tsx`
- `src/components/shop/ShopCatalogView.tsx`
- `src/components/shop/ProductDrawerModal.tsx`
- `src/components/shop/ShopCartView.tsx`
- `src/components/shop/ShopCheckoutView.tsx`
- `src/components/shop/ShopOrdersView.tsx`
- `src/components/shop/AdminMembersPanel.tsx`
- `src/components/shop/AdminOrdersPanel.tsx`
- `src/components/shop/AdminPricingPanel.tsx`
- `src/lib/shopHelpers.ts`
- `src/lib/shopTypes.ts`

Notable conditions:

- `MembersShop.tsx` is over 1,700 lines and owns much of the shop state and orchestration.
- The catalog already supports tier-specific pricing, product grouping, search, category filters, stock logic, fast shipping flags, and admin previews.
- The product drawer already groups strengths/options and contains admin financial details.
- Checkout currently has free shipping language, BAC water add-on handling, address fields, tax calculation, and server-side order creation.
- The order flow uses Firestore orders and admin status changes, with customer notifications available through `/api/notify-order`.

## Goals

1. Make the shop feel curated and premium on first entry.
2. Make tier, source, price unit, and shipping expectations obvious.
3. Help users make confident product decisions from the drawer.
4. Make checkout feel like a controlled dispatch/order request.
5. Make customer order status and admin status updates feel polished.
6. Keep the implementation incremental and testable.

## Non-Goals

- Do not rebuild the whole shop stack.
- Do not redesign the full LabRat app shell.
- Do not change pricing math or membership rules except where presentation requires clearer labels.
- Do not add payment processing.
- Do not modify medical/research guidance content beyond presentation and clarity.
- Do not move order creation away from the existing server-side validation path.

## Proposed Experience

### 1. Shop Home And Catalog

The catalog should open with a concise member storefront header before the product grid.

Header content:

- Member tier/status label.
- Shipping promise for the current tier.
- Cart shortcut with item count.
- Orders shortcut when the user has prior orders.
- A short trust line, such as certified sourcing, request-based dispatch, or free shipping, depending on tier.

Below the header, organize products into a few curated sections:

- Quick Ship or USA Warehouse where available.
- Most Ordered or Featured Research Vials.
- Category sections driven by existing category data.

Search and category filters should remain, but they should feel secondary to the curated entry. Empty states should explain whether products are hidden because of search, category, inventory, or tier restrictions.

### 2. Product Drawer

The drawer should become the main decision surface.

Keep the existing grouped option model, but improve hierarchy:

- Product name, category, and benefit badge at the top.
- One concise description paragraph.
- Clear option cards that distinguish per-vial price, kit price, strength, source, and shipping expectation.
- A sourcing/fulfillment strip showing source, shipping speed, COA/certification signal, and stock/availability.
- BAC water or solvent prompt where relevant, with a clear explanation that it can be added at checkout.
- Quantity controls and the primary add-to-cart action pinned at the bottom on mobile.

Admin-only financial information should remain available, but visually separated from customer-facing product confidence content.

### 3. Cart And Checkout

Checkout should read as a deliberate order request flow:

`Cart -> Dispatch -> Review`

Cart:

- Group items by product/source when useful.
- Show tier and price basis near totals.
- Surface BAC water add-on as a helpful recommendation, not an afterthought.

Dispatch form:

- Keep existing address/contact fields.
- Add lightweight validation cues for required fields and zip/state formatting.
- Use plain labels where possible while preserving LabRat tone.
- Keep free shipping messaging consistent with the tier.

Review/submit:

- Show final item total, BAC water, tax, shipping, and total.
- Explain what happens after submitting: request created, admin reviews/fulfills, status updates appear in Orders.
- Use one primary submit action with loading state and clear success/failure copy.

### 4. Order Lifecycle

Customer order cards should show the useful facts at a glance:

- Status label.
- Created date.
- Total.
- Item count.
- Shipping/tracking summary if available.
- Next step copy.

Order detail should include a simple status timeline:

- Placed.
- Processing.
- Shipped.
- Completed or cancelled.

Admin status updates should map to customer-friendly labels and should continue to trigger polished notification text when appropriate.

### 5. Admin Touchpoints

Admin panels should only change where the customer experience benefits:

- Admin order cards should make status updates and tracking entry easier to scan.
- Status changes should use the same label/timeline vocabulary customers see.
- Member tier/status controls should remain compatible with existing Firestore rules and tier pricing behavior.

## Component And Data Boundaries

Keep `MembersShop.tsx` as the top-level shop orchestrator for now, but reduce pressure on it by extracting small, focused view-model helpers where needed.

Suggested helper boundaries:

- `shopTierViewModel`: maps member/admin preview state to tier label, price basis, shipping promise, and visible source rules.
- `shopProductViewModel`: maps grouped product options to drawer cards and badges.
- `shopOrderStatusViewModel`: maps internal order status to customer/admin labels, timeline state, and notification copy.

These helpers should stay close to existing shop code, likely under `src/lib/shopHelpers.ts` initially or split into a new shop-specific helper file if the existing file becomes too crowded.

## Error Handling And Edge Cases

- Loading states should distinguish catalog loading, price loading, order submission, and admin actions.
- Empty catalog states should explain whether search/category/tier restrictions caused the empty result.
- Checkout should prevent submission when required address fields are incomplete.
- Order submission errors should show a user-facing message that preserves the cart.
- Product drawer should handle missing product options gracefully.
- If pricing data is unavailable, the UI should show a clear loading/error state instead of misleading prices.

## Testing And Verification

Minimum verification:

- `npm run lint`
- `npm run build`

Manual/browser verification:

- Guest or no explicit tier sees per-vial browsing as intended.
- Approved vial member sees Norway per-vial messaging.
- Kit member sees kit price basis and kit shipping copy.
- China vial/kit member sees China source messaging and matching product visibility.
- Product drawer add-to-cart works on mobile and desktop.
- BAC water add-on still affects checkout totals.
- Checkout validates required fields and preserves cart on errors.
- Order success modal appears after a successful order.
- Customer Orders view shows the improved status summary.
- Admin status update flow still works and sends customer-facing status copy.

## Rollout Plan

1. Build view-model helpers for tier labels, product option presentation, and order status labels.
2. Update catalog header and curated sections.
3. Refine product drawer hierarchy and pinned mobile add-to-cart.
4. Refine cart and checkout review/submit flow.
5. Refine orders view and admin status labels.
6. Run build/lint and verify key member tiers manually.

## Open Risks

- The shop has many tier-specific pricing paths; changes must avoid collapsing distinct Norway/China/vial/kit behavior.
- `MembersShop.tsx` is large, so edits should be staged carefully to avoid state regressions.
- Product and research copy carries compliance/trust implications; presentation changes should not make stronger medical claims.
- Existing unrelated local workspace files should not be bundled into implementation commits.
