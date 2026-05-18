const express = require('express');

const { getDashboard } = require('../controllers/homeController');

const router = express.Router();

router.get('/dashboard', getDashboard);

module.exports = router;
