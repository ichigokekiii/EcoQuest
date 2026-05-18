const express = require('express');

const { syncUser } = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/sync-user', verifyFirebaseToken, syncUser);

module.exports = router;
