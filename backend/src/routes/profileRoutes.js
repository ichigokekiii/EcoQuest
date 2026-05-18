const express = require('express');

const { getProfileOverview } = require('../controllers/profileController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyFirebaseToken, authMiddleware);

router.get('/', getProfileOverview);

module.exports = router;
