const express = require('express');

const {
  createAdminMission,
  createAdminReward,
  createAdminRoute,
  getAdminDashboard,
  listAdminMissions,
  listAdminRewards,
  listAdminRouteSessions,
  listAdminTrashSubmissions,
  listAdminUsers,
  listAdminRoutes,
  updateAdminMission,
  updateAdminReward,
  updateAdminRoute,
  updateAdminTrashSubmission,
} = require('../controllers/adminController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/dashboard', verifyFirebaseToken, authMiddleware, adminMiddleware, getAdminDashboard);
router.get('/users', verifyFirebaseToken, authMiddleware, adminMiddleware, listAdminUsers);
router.get('/routes', verifyFirebaseToken, authMiddleware, adminMiddleware, listAdminRoutes);
router.post('/routes', verifyFirebaseToken, authMiddleware, adminMiddleware, createAdminRoute);
router.patch('/routes/:routeId', verifyFirebaseToken, authMiddleware, adminMiddleware, updateAdminRoute);
router.get('/missions', verifyFirebaseToken, authMiddleware, adminMiddleware, listAdminMissions);
router.post('/missions', verifyFirebaseToken, authMiddleware, adminMiddleware, createAdminMission);
router.patch(
  '/missions/:missionId',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  updateAdminMission
);
router.get('/rewards', verifyFirebaseToken, authMiddleware, adminMiddleware, listAdminRewards);
router.post('/rewards', verifyFirebaseToken, authMiddleware, adminMiddleware, createAdminReward);
router.patch(
  '/rewards/:rewardId',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  updateAdminReward
);
router.get(
  '/route-sessions',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  listAdminRouteSessions
);
router.get(
  '/trash-submissions',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  listAdminTrashSubmissions
);
router.patch(
  '/trash-submissions/:submissionId',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  updateAdminTrashSubmission
);

module.exports = router;
