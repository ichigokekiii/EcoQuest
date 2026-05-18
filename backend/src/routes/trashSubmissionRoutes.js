const express = require('express');

const { analyzeTrashSubmission } = require('../controllers/trashSubmissionController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', verifyFirebaseToken, authMiddleware, analyzeTrashSubmission);

module.exports = router;
