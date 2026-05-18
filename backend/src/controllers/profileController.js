const { getProfileData } = require('../mock/mockData');

async function getProfileOverview(req, res, next) {
  try {
    res.json(getProfileData());
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfileOverview,
};
