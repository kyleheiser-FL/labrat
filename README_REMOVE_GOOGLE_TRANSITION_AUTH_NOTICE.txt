LabRat patch: remove Google transition / Firebase setup notice from login modal.

Changed:
- src/App.tsx

What changed:
- Removes the visible "Transitioning from Google?" info box.
- Removes the visible "Setup Integration Guide" / Firebase Console note.
- Renames the link from "Forgot Password / Transition Google Login?" to "Forgot Password?".

No Firebase auth logic, shop logic, bloodwork logic, storage keys, service worker, or PWA files were changed.
