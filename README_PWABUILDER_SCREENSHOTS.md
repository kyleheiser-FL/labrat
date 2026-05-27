# LabRat PWABuilder screenshots

Drop this ZIP at the root of the LabRat Vite repo and merge the `public/` folder.

Files included:

- `public/screenshots/*.png` — 8 high-resolution screenshots:
  - 4 wide desktop screenshots at `1920x1080`
  - 4 narrow mobile screenshots at `1080x1920`
- `manifest-screenshots-snippet.json` — copy the `screenshots` array into your existing `public/manifest.json` or `public/manifest.webmanifest`.

The screenshot sizes are kept consistent by form factor so Chrome/PWABuilder do not reject them for mismatched aspect ratios.

Suggested install:

1. Unzip into the repo root.
2. Keep the screenshots at `public/screenshots/`.
3. Open your manifest file, usually `public/manifest.json` or `public/manifest.webmanifest`.
4. Add the `screenshots` array from `manifest-screenshots-snippet.json` at the top level of the manifest JSON.
5. Rebuild/deploy and re-run PWABuilder.

No service worker, auth, Firebase, product IDs, cart, analyzer, storage keys, or runtime logic are touched by this package.
