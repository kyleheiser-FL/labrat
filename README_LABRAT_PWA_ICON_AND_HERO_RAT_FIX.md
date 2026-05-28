# LabRat PWA Icon + Hero Rat Background Fix

This patch keeps all functional app logic intact and updates only visual/PWA assets:

- Clinical Dark top-left logo: clinical LR logo.
- Neon theme top-left logo: neon LR logo.
- Neon PWA install icon: neon LR logo.
- Clinical PWA install icon: clinical LR logo.
- Daily Cockpit right-side hero art: larger background rat, not foreground.
- Clinical Daily Cockpit: dark rat background instead of LR background.
- Neon Daily Cockpit: neon rat background, larger and faded into the panel.
- Manifest selection switches based on the active theme before the install prompt.

Important: Android/Chrome caches PWA launcher icons. If the app was already installed, uninstall it first, then clear browser site data or hard refresh before reinstalling to verify the new launcher icon.
