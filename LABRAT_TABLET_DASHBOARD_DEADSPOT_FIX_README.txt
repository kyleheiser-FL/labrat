LabRat Tablet Dashboard Dead-Spot Fix

Changed file:
- src/index.css

What it fixes:
- Removes the tablet dashboard/main-page dead spot by hiding the decorative command hero at tablet widths and forcing the dashboard into a clean single-column tablet flow.

What it does not touch:
- Firebase/auth
- PWA service worker/manifest
- Shop product data, prices, stock, IDs, or order logic
- Compounds, bloodwork, recommendation logic, storage keys
- Vial artwork files
