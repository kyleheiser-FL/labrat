# LabRat final mobile/tablet hero + theme screenshot patch

Includes:
- Uniform right-side Daily Cockpit rat hero art for Clinical Dark and Neon themes.
- Tablet and phone positioning fixes so text can overlap above the rat art cleanly.
- Header logo sizing fixes for mobile/tablet.
- Theme-specific PWA manifest screenshots using the provided live app screenshots.
- PWA install guide preview uses the active theme screenshot.
- Service worker cache bumped to include the new screenshot assets.

Apply from repo root:

```bash
unzip -o "labrat_final_layout_pwa_screens_patch.zip" -d . && git add . && git commit -m "Fix LabRat mobile hero logos and PWA theme screenshots" || true && git push
```
