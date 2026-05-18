const { getDashboardData } = require('../mock/mockData');

async function getDashboard(req, res, next) {
  try {
    res.json(getDashboardData());
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
};
