const express = require('express');

const { getStoreOverview } = require('../controllers/storeController');

const router = express.Router();

router.get('/', getStoreOverview);

module.exports = router;
