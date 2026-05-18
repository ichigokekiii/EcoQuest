const express = require('express');

const { getTrashCategories } = require('../controllers/trashCategoryController');
const { verifyFirebaseToken, authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyFirebaseToken, authMiddleware, getTrashCategories);

module.exports = router;
