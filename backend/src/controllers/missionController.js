const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc } = require('../utils/firestoreSerializers');
const {
  getMissionsByRoute: getMockMissionsByRoute,
  getMissionOverview,
  getMissionProgress,
} = require('../mock/mockData');

async function getMissions(req, res, next) {
  try {
    return res.json(getMissionOverview());
  } catch (error) {
    next(error);
  }
}

async function getMissionsByRoute(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ missions: getMockMissionsByRoute(req.params.routeId) });
    }

    const snapshot = await getDb()
      .collection('missions')
      .where('routeId', '==', req.params.routeId)
      .where('status', '==', 'active')
      .get();

    const missions = snapshot.docs.map(serializeDoc);

    res.json({ missions });
  } catch (error) {
    next(error);
  }
}

async function getSessionMissionProgress(req, res, next) {
  try {
    res.json({
      sessionId: req.params.sessionId,
      missionProgress: getMissionProgress(req.params.sessionId),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMissions,
  getMissionsByRoute,
  getSessionMissionProgress,
};
