const express = require('express');

const {
  getMissions,
  getMissionsByRoute,
  getSessionMissionProgress,
} = require('../controllers/missionController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyFirebaseToken, authMiddleware);

router.get('/', getMissions);
router.get('/progress/:sessionId', getSessionMissionProgress);
router.get('/route/:routeId', getMissionsByRoute);

module.exports = router;
