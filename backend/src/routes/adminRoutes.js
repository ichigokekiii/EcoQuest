const express = require('express');

const {
  createAdminRoute,
  getAdminDashboard,
  listAdminUsers,
  listAdminRoutes,
} = require('../controllers/adminController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/dashboard', verifyFirebaseToken, authMiddleware, adminMiddleware, getAdminDashboard);
router.get('/users', verifyFirebaseToken, authMiddleware, adminMiddleware, listAdminUsers);
router.get('/routes', verifyFirebaseToken, authMiddleware, adminMiddleware, listAdminRoutes);
router.post('/routes', verifyFirebaseToken, authMiddleware, adminMiddleware, createAdminRoute);

module.exports = router;
