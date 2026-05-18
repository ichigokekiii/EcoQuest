const { getAuth, getDb } = require('../config/firebaseAdmin');

async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const idToken = authHeader.replace('Bearer ', '').trim();

    if (!idToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);

    req.authUser = decodedToken;
    next();
  } catch (error) {
    console.error('verifyFirebaseToken error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

async function authMiddleware(req, res, next) {
  try {
    if (!req.authUser) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userDoc = await getDb().collection('users').doc(req.authUser.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User record not found' });
    }

    req.user = {
      id: userDoc.id,
      ...userDoc.data(),
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  verifyFirebaseToken,
  authMiddleware,
};
