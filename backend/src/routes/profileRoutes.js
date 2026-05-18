const express = require('express');

const { getProfileOverview } = require('../controllers/profileController');

const router = express.Router();

router.get('/', getProfileOverview);

module.exports = router;
