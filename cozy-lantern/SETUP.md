# CozyLantern — Setup Guide

## Prerequisites
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Expo CLI (`npm install -g eas-cli`)
- Firebase CLI (`npm install -g firebase-tools`)

## 1. Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `cozy-lantern`)
3. Enable **Authentication** (Email/Password provider)
4. Enable **Firestore** (start in production mode)
5. Enable **Cloud Messaging** (for push notifications)
6. Enable **Cloud Functions** (requires Blaze pay-as-you-go plan)

## 2. Configure Mobile App

Copy your Firebase config into `apps/mobile/firebase-config.json`:
```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}
```

## 3. Configure Web App

Create `apps/web/.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_GOOGLE_MAPS_API_KEY=...   ← Enable Maps JavaScript API in GCP
```

## 4. Deploy Firestore Rules & Indexes

```bash
firebase login
firebase use --add   # select your project
firebase deploy --only firestore
```

## 5. Install Dependencies

```bash
pnpm install
```

## 6. Run Locally

```bash
# Mobile
pnpm dev:mobile        # starts Expo dev server — scan QR with Expo Go

# Web dashboard
pnpm dev:web           # starts at http://localhost:5173
```

## 7. Deploy Cloud Functions

Add your Google Maps API key:
```bash
firebase functions:secrets:set GOOGLE_MAPS_API_KEY
```
Then deploy:
```bash
cd functions && pnpm build
firebase deploy --only functions
```

## 8. Build Mobile for TestFlight / Play Beta

```bash
cd apps/mobile
eas build --profile preview --platform all
```

## Testing

```bash
# Unit tests (shared package)
cd packages/shared && pnpm test

# Firestore rules (requires Firebase emulator)
firebase emulators:start --only firestore,auth
```

## Background Location Notes

- **iOS**: Users must tap "Allow While Using" first, then the app will prompt for "Always Allow".
  Include a clear explanation screen before requesting background permission.
- **Android 10+**: After granting location permission, users must separately enable "Allow all the time"
  in their device settings. Show a guidance screen with step-by-step instructions.
- Background tracking requires a physical device — the iOS Simulator and Android Emulator
  do not fully support background location tasks.
