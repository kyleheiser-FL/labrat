LabRat Shop Admin Count Badges

This patch updates only:
- src/components/MembersShop.tsx

What it does:
- Adds a red count badge to Accounts Approval when pending member applications exist.
- Adds an amber count badge to Global Orders when new placed orders exist.
- Shows matching count pills in the admin section headers.
- Loads both admin member and order datasets for the admin dashboard so the badges are available even before opening each tab.
- Sorts member approvals with pending accounts first.

No Firebase config, auth rules, shop products, prices, carts, order data format, analyzer logic, service worker, manifest, or storage keys were changed.
