LabRat responsive touch/performance patch

Files changed:
- src/index.css
- src/components/MembersShop.tsx

What this patch does:
- Fixes the tablet dashboard dead-zone by forcing the Daily Checklist dashboard into a stable full-width flow on tablets, foldables, and small laptop widths.
- Keeps the desktop split layout only for larger screens where it has enough room.
- Improves touch scrolling and prevents clipped inner scroll regions from blocking taps.
- Stabilizes shop vial images by removing hover-opacity transitions that can create flashing/flicker.
- Keeps both dark themes supported.

What this patch does NOT change:
- Firebase auth
- Firestore data/sync
- PWA install/service worker/manifest
- Shop products, prices, stock, product IDs, cart, or orders
- Bloodwork analyzer logic
- Recommendation logic
- Storage keys
