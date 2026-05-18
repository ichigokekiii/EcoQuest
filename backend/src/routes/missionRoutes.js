const express = require('express');

const {
  getMissions,
  getMissionsByRoute,
  getSessionMissionProgress,
} = require('../controllers/missionController');

const router = express.Router();

router.get('/', getMissions);
router.get('/progress/:sessionId', getSessionMissionProgress);
router.get('/route/:routeId', getMissionsByRoute);

module.exports = router;
