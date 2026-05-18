# Eco Quest Admin

Desktop admin frontend for Eco Quest.

This app is separate from the Expo mobile client and talks to the shared Express backend through `/api/admin/*` endpoints.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example`

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
