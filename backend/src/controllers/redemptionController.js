const { admin, getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc } = require('../utils/firestoreSerializers');
const { listRedemptions } = require('../services/redemptionService');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function redeemReward(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for reward redemptions.' });
    }

    const db = getDb();
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(req.user.id);
      const rewardRef = db.collection('rewards').doc(req.params.rewardId);

      const [userDoc, rewardDoc] = await Promise.all([
        transaction.get(userRef),
        transaction.get(rewardRef),
      ]);

      if (!rewardDoc.exists) {
        throw createHttpError(404, 'Reward not found');
      }

      if (!userDoc.exists) {
        throw createHttpError(404, 'User record not found');
      }

      const rewardData = rewardDoc.data();
      const userData = userDoc.data();
      const rewardStatus = rewardData.status || 'active';
      const pointsCost = Number(rewardData.pointsCost || 0);
      const stock = Number(rewardData.stock || 0);
      const userPoints = Number(userData.points || 0);

      if (rewardStatus !== 'active') {
        throw createHttpError(400, 'Reward is not available');
      }

      if (stock <= 0) {
        throw createHttpError(400, 'Reward is out of stock');
      }

      if (userPoints < pointsCost) {
        throw createHttpError(400, 'Not enough points');
      }

      const timestamp = admin.firestore.Timestamp.now();
      const redemptionRef = db.collection('redemptions').doc();
      const pointTransactionRef = db.collection('pointTransactions').doc();
      const redemptionData = {
        userId: req.user.id,
        userName: req.user.fullName || req.user.username || req.user.email || 'Eco Quest User',
        rewardId: rewardDoc.id,
        rewardName: rewardData.name || 'Reward',
        rewardCategory: rewardData.category || null,
        pointsSpent: pointsCost,
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp,
        redeemedAt: timestamp,
      };
      const pointTransactionData = {
        userId: req.user.id,
        rewardId: rewardDoc.id,
        rewardName: rewardData.name || 'Reward',
        type: 'reward_redemption',
        points: -pointsCost,
        createdAt: timestamp,
      };

      transaction.update(userRef, {
        points: admin.firestore.FieldValue.increment(-pointsCost),
        updatedAt: timestamp,
      });
      transaction.update(rewardRef, {
        stock: admin.firestore.FieldValue.increment(-1),
        updatedAt: timestamp,
      });
      transaction.set(redemptionRef, redemptionData);
      transaction.set(pointTransactionRef, pointTransactionData);

      return {
        redemption: {
          id: redemptionRef.id,
          ...serializeDoc({
            id: redemptionRef.id,
            data: () => redemptionData,
          }),
        },
        pointsBalance: userPoints - pointsCost,
      };
    });

    return res.status(201).json({
      message: 'Reward redeemed',
      redemption: result.redemption,
      points: result.pointsBalance,
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUserRedemptions(req, res, next) {
  try {
    const redemptions = await listRedemptions({
      userId: req.user.id,
      limit: req.query.limit || 50,
    });

    return res.json({ redemptions });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  redeemReward,
  getCurrentUserRedemptions,
};
