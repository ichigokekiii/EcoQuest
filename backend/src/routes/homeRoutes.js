const express = require('express');

const { getDashboard } = require('../controllers/homeController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyFirebaseToken, authMiddleware);

router.get('/dashboard', getDashboard);

module.exports = router;
