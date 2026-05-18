# Eco Quest Admin

Desktop admin frontend for Eco Quest.

This app is separate from the Expo mobile client and talks to the shared Express backend through `/api/admin/*` endpoints.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy the repo root env template: `cp ../.env.example ../.env` (from the EcoQuest repo root)

3. Start the app

   ```bash
   npm run dev
   ```

## Environment variables

- `VITE_API_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_APP_ID`
- `VITE_GOOGLE_MAPS_WEB_API_KEY` (Maps JavaScript + Places + Directions for route creation)

## Admin bootstrap

1. Create a Firebase Auth user (email/password or Google) in the Firebase console.
2. Sign in once through the admin app so `POST /api/auth/sync-user` creates `users/{uid}`.
3. Promote that user to admin using one of these options:
   - Firestore console: set `users/{uid}.role` to `admin`
   - Seed/script workflow for the first admin account
   - After the first admin exists: use **Users** page role dropdown (`PATCH /api/admin/users/:userId/role`)
4. Sign out and sign back in. The admin shell verifies `role === admin` through Express before showing the dashboard.

Non-admin Firebase accounts will see an access denied screen instead of broken API calls.
