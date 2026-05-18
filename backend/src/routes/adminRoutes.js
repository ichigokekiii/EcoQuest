const express = require('express');

const {
  createAdminMission,
  createAdminReward,
  createAdminRoute,
  createAdminTrashCategory,
  getAdminDashboard,
  listAdminMissions,
  listAdminRewards,
  listAdminRouteSessions,
  listAdminTrashCategories,
  listAdminTrashSubmissions,
  listAdminUsers,
  listAdminRoutes,
  updateAdminMission,
  updateAdminReward,
  updateAdminRoute,
  updateAdminTrashCategory,
  updateAdminTrashSubmission,
  updateAdminUserRole,
  updateAdminUserStatus,
} = require('../controllers/adminController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/dashboard', verifyFirebaseToken, authMiddleware, adminMiddleware, getAdminDashboard);
router.get('/users', verifyFirebaseToken, authMiddleware, adminMiddleware, listAdminUsers);
router.patch(
  '/users/:userId/role',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  updateAdminUserRole
);
router.patch(
  '/users/:userId/status',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  updateAdminUserStatus
);
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
router.get(
  '/trash-categories',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  listAdminTrashCategories
);
router.post(
  '/trash-categories',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  createAdminTrashCategory
);
router.patch(
  '/trash-categories/:categoryId',
  verifyFirebaseToken,
  authMiddleware,
  adminMiddleware,
  updateAdminTrashCategory
);

module.exports = router;
