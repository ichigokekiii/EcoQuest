const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { getStoreData } = require('../mock/mockData');
const { serializeDoc } = require('../utils/firestoreSerializers');

async function getStoreOverview(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json(getStoreData());
    }

    const snapshot = await getDb()
      .collection('rewards')
      .where('status', '==', 'active')
      .limit(50)
      .get();

    return res.json({
      pointsBalance: req.user?.points || 0,
      rewards: snapshot.docs.map(serializeDoc),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStoreOverview,
};
