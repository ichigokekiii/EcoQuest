const express = require('express');

const {
  getCurrentUserRedemptions,
  redeemReward,
} = require('../controllers/redemptionController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyFirebaseToken, authMiddleware);

router.get('/me', getCurrentUserRedemptions);
router.post('/:rewardId', redeemReward);

module.exports = router;
