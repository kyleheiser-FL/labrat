LabRat PWABuilder Service Worker Detection Fix

What this patch changes:
- Keeps public/sw.js in the correct root-served location: /sw.js.
- Registers /sw.js immediately with explicit scope: "/" and updateViaCache: "none".
- Adds Vercel headers for /sw.js and /manifest.json, including Service-Worker-Allowed: / and no-cache on the service worker.
- Replaces the service worker with a safer root-scoped version that claims clients and always returns a Response for handled fetches.
- Syncs the root manifest.json with public/manifest.json so the manifest screenshots stay consistent.

What this patch does NOT change:
- Firebase auth logic.
- Shop stock, prices, product IDs, cart, or orders.
- Bloodwork analyzer logic.
- Cycle planner/recommendation logic.
- App data/storage keys.

After deploying, re-test PWABuilder with the final canonical domain that the browser ends on, for example:
https://www.labratapp.app/manifest.json
or
https://labratapp.app/manifest.json
Use whichever one your site does not redirect away from.
