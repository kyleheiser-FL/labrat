LabRat Restore Touch + Tablet Dead Spot + Clean Vials Patch

Purpose:
- Restores stable scrolling/touch behavior by replacing the over-aggressive responsive/touch CSS with the stable app CSS.
- Fixes the tablet dashboard dead spot surgically by keeping the dashboard one-column until true wide desktop (2xl/1536px+).
- Re-applies clean professional dark vial artwork.
- Restores MembersShop.tsx from the stable app base to remove any hover/touch instability from the previous broad patch.

Files changed:
- src/index.css
- src/components/CycleDashboard.tsx
- src/components/MembersShop.tsx
- public/shop/labrat-professional-vial-peptide.png
- public/shop/labrat-professional-vial-solvent.png

Safe areas:
- Does not change Firebase auth/config.
- Does not change service worker, manifest, PWA install logic.
- Does not change shop product IDs, prices, stock, cart/order storage, blood analyzer logic, compound logic, recommendation logic, or data keys.

Command:
unzip -o "LabRat_Restore_Touch_Tablet_CleanVials_Patch.zip" -d . && npm install && git add . && git commit -m "Restore touch and fix tablet dashboard layout" || true && git push
