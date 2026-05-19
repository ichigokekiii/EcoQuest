const express = require('express');

const {
  cancelRouteSession,
  completeRouteSession,
  confirmRouteTrash,
  createRouteSession,
  getActiveRouteSession,
  getRouteSessionById,
  getRouteSessionHistory,
} = require('../controllers/routeSessionController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyFirebaseToken, authMiddleware);

router.get('/active', getActiveRouteSession);
router.get('/history', getRouteSessionHistory);
router.get('/:sessionId', getRouteSessionById);
router.post('/start/:routeId', createRouteSession);
router.post('/:sessionId/confirm-trash', confirmRouteTrash);
router.post('/:sessionId/cancel', cancelRouteSession);
router.post('/:sessionId/finish', completeRouteSession);

module.exports = router;
