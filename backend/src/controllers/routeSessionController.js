const {
  confirmTrash,
  finishRouteSession,
  getActiveSession,
  getRouteHistory,
  getSessionDetails,
  startRouteSession,
} = require('../mock/mockData');

async function getActiveRouteSession(req, res, next) {
  try {
    res.json({ session: getActiveSession() });
  } catch (error) {
    next(error);
  }
}

async function getRouteSessionHistory(req, res, next) {
  try {
    res.json({ sessions: getRouteHistory() });
  } catch (error) {
    next(error);
  }
}

async function getRouteSessionById(req, res, next) {
  try {
    res.json(getSessionDetails(req.params.sessionId));
  } catch (error) {
    next(error);
  }
}

async function createRouteSession(req, res, next) {
  try {
    const session = startRouteSession(req.params.routeId);

    res.status(201).json({
      message: 'Route session started',
      session,
    });
  } catch (error) {
    next(error);
  }
}

async function confirmRouteTrash(req, res, next) {
  try {
    const result = confirmTrash(req.params.sessionId, req.body.finalCategoryId);

    res.status(201).json({
      message: 'Trash submission saved',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function completeRouteSession(req, res, next) {
  try {
    const result = finishRouteSession(req.params.sessionId);

    res.json({
      message: 'Route completed',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getActiveRouteSession,
  getRouteSessionHistory,
  getRouteSessionById,
  createRouteSession,
  confirmRouteTrash,
  completeRouteSession,
};
