const { getStoreData } = require('../mock/mockData');

async function getStoreOverview(req, res, next) {
  try {
    res.json(getStoreData());
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStoreOverview,
};
