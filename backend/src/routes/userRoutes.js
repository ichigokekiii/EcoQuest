const express = require('express');

const { getCurrentUser } = require('../controllers/userController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', verifyFirebaseToken, authMiddleware, getCurrentUser);

module.exports = router;
