const { resetDemoState } = require('../mock/mockData');

async function resetMockState(req, res, next) {
  try {
    res.json({
      message: 'Mock API state has been reset',
      dashboard: resetDemoState(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  resetMockState,
};
