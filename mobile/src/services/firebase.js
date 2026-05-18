import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    '[Eco Quest] Missing EXPO_PUBLIC_FIREBASE_* in root .env. ' +
      'Copy .env.example, fill Firebase web app values, then restart Metro with --clear.'
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
