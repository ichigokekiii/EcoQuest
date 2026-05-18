const express = require('express');

const {
  completeRouteSession,
  confirmRouteTrash,
  createRouteSession,
  getActiveRouteSession,
  getRouteSessionById,
  getRouteSessionHistory,
} = require('../controllers/routeSessionController');

const router = express.Router();

router.get('/active', getActiveRouteSession);
router.get('/history', getRouteSessionHistory);
router.get('/:sessionId', getRouteSessionById);
router.post('/start/:routeId', createRouteSession);
router.post('/:sessionId/confirm-trash', confirmRouteTrash);
router.post('/:sessionId/finish', completeRouteSession);

module.exports = router;
