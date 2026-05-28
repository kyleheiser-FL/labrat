LabRat Shop Admin Delete Members

This patch updates only:
- src/components/MembersShop.tsx

What it does:
- Adds a Delete action to the Vetting & Members Approval Portal.
- Uses a two-tap confirm flow so members are not deleted by accident.
- Deletes the member/application document from the Firestore `members` collection.
- Removes the deleted member from the admin list immediately after deletion.
- Keeps the existing Approve, Restrict, and Reset actions.

Important note:
This deletes the user's shop/member approval profile only. It does not delete the user's Firebase Authentication account, because deleting Auth users requires server-side Firebase Admin privileges such as a Cloud Function.

No Firebase config, auth setup, shop products, prices, cart/order logic, analyzer logic, service worker, manifest, or storage keys were changed.
