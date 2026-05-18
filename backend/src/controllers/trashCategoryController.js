const { getActiveTrashCategories } = require('../services/categoryMemoryService');

async function getTrashCategories(req, res, next) {
  try {
    const categories = await getActiveTrashCategories();

    res.json({ categories });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTrashCategories,
};
