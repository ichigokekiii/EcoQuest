const express = require('express');

const { getRoutes, getRouteById } = require('../controllers/routeController');

const router = express.Router();

router.get('/', getRoutes);
router.get('/nearby', getRoutes);
router.get('/:routeId', getRouteById);

module.exports = router;
