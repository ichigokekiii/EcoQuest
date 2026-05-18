const admin = require('firebase-admin');

function getMissingEnvVars() {
  const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_STORAGE_BUCKET'];

  return requiredEnvVars.filter((key) => !process.env[key]);
}

function ensureFirebaseConfigured() {
  const missingEnvVars = getMissingEnvVars();

  if (missingEnvVars.length > 0) {
    const error = new Error(
      `Firebase Admin SDK is not configured. Missing: ${missingEnvVars.join(', ')}`
    );

    error.statusCode = 500;
    throw error;
  }
}

function isFirebaseConfigured() {
  return getMissingEnvVars().length === 0;
}

function hasServiceAccountEnv() {
  return (
    Boolean(process.env.FIREBASE_CLIENT_EMAIL) &&
    Boolean(process.env.FIREBASE_PRIVATE_KEY)
  );
}

function getFirebaseApp() {
  ensureFirebaseConfigured();

  if (admin.apps.length > 0) {
    return admin.app();
  }

  const credential = hasServiceAccountEnv()
    ? admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    : admin.credential.applicationDefault();

  return admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

function getDb() {
  return getFirebaseApp().firestore();
}

function getAuth() {
  return getFirebaseApp().auth();
}

function getBucket() {
  return getFirebaseApp().storage().bucket();
}

module.exports = {
  admin,
  ensureFirebaseConfigured,
  isFirebaseConfigured,
  getDb,
  getAuth,
  getBucket,
};
