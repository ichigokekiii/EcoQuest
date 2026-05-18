const { admin, getDb } = require('../config/firebaseAdmin');
const { buildDefaultUserProfile, buildUsername } = require('../utils/userProfile');

async function syncUser(req, res, next) {
  try {
    const uid = req.authUser.uid;
    const email = req.authUser.email || req.body.email;
    const fullName =
      req.body.fullName?.trim() ||
      req.authUser.name?.trim() ||
      email?.split('@')[0] ||
      '';
    const username = req.body.username?.trim();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    const userRef = getDb().collection('users').doc(uid);
    const existingUserDoc = await userRef.get();

    if (!existingUserDoc.exists) {
      const userProfile = buildDefaultUserProfile({
        uid,
        fullName,
        email,
        username,
      });

      await userRef.set({
        ...userProfile,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      const currentData = existingUserDoc.data();

      await userRef.set(
        {
          fullName,
          email,
          username: username || currentData.username || buildUsername({ email, fullName }),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    const syncedUserDoc = await userRef.get();

    res.json({
      message: 'User synced',
      user: {
        id: syncedUserDoc.id,
        ...syncedUserDoc.data(),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  syncUser,
};
