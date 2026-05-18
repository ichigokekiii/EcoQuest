const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc } = require('../utils/firestoreSerializers');

function parseLimit(limit = 50, fallback = 50) {
  const parsed = Number.parseInt(limit, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(parsed, 100);
}

function sortRedemptions(redemptions) {
  return [...redemptions].sort(
    (first, second) =>
      new Date(second.redeemedAt || second.updatedAt || second.createdAt || 0) -
      new Date(first.redeemedAt || first.updatedAt || first.createdAt || 0)
  );
}

async function listRedemptions({ limit = 50, userId, rewardId, status } = {}) {
  if (!isFirebaseConfigured()) {
    return [];
  }

  let query = getDb().collection('redemptions');

  if (userId) {
    query = query.where('userId', '==', userId);
  }

  if (rewardId) {
    query = query.where('rewardId', '==', rewardId);
  }

  if (status) {
    query = query.where('status', '==', status);
  }

  const snapshot = await query.limit(parseLimit(limit)).get();

  return sortRedemptions(snapshot.docs.map(serializeDoc));
}

function buildRewardRedemptionStats(redemptions = []) {
  return redemptions.reduce((statsByRewardId, redemption) => {
    const rewardId = redemption.rewardId;

    if (!rewardId) {
      return statsByRewardId;
    }

    const currentStats = statsByRewardId[rewardId] || {
      redeemedCount: 0,
      pointsSpent: 0,
    };
    const nextStats = {
      redeemedCount:
        currentStats.redeemedCount + (redemption.status === 'cancelled' ? 0 : 1),
      pointsSpent:
        currentStats.pointsSpent +
        (redemption.status === 'cancelled' ? 0 : Number(redemption.pointsSpent || 0)),
    };

    statsByRewardId[rewardId] = nextStats;
    return statsByRewardId;
  }, {});
}

function attachRewardRedemptionStats(rewards = [], redemptions = []) {
  const statsByRewardId = buildRewardRedemptionStats(redemptions);

  return rewards.map((reward) => {
    const rewardStats = statsByRewardId[reward.id] || {
      redeemedCount: 0,
      pointsSpent: 0,
    };

    return {
      ...reward,
      redeemedCount: rewardStats.redeemedCount,
      pointsSpent: rewardStats.pointsSpent,
    };
  });
}

module.exports = {
  attachRewardRedemptionStats,
  buildRewardRedemptionStats,
  listRedemptions,
};
