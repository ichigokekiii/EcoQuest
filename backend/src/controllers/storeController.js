const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { getStoreData } = require('../mock/mockData');
const { serializeDoc } = require('../utils/firestoreSerializers');
const {
  attachRewardRedemptionStats,
  listRedemptions,
} = require('../services/redemptionService');

async function getStoreOverview(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json(getStoreData());
    }

    const [rewardsSnapshot, recentRedemptions, allRedemptions] = await Promise.all([
      getDb().collection('rewards').where('status', '==', 'active').limit(50).get(),
      listRedemptions({ userId: req.user.id, limit: 5 }),
      listRedemptions({ limit: 200 }),
    ]);
    const rewards = attachRewardRedemptionStats(
      rewardsSnapshot.docs.map(serializeDoc),
      allRedemptions
    );

    return res.json({
      pointsBalance: Number(req.user?.points || 0),
      rewards,
      recentRedemptions,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStoreOverview,
};
