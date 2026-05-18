const express = require('express');

const { resetMockState } = require('../controllers/devController');

const router = express.Router();

router.post('/reset', resetMockState);

module.exports = router;
