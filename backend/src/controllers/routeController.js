const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeRoute } = require('../utils/firestoreSerializers');
const { getRoutes: getMockRoutes, getRouteById: getMockRouteById } = require('../mock/mockData');

async function getRoutes(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ routes: getMockRoutes() });
    }

    const snapshot = await getDb().collection('routes').where('status', '==', 'active').get();

    const routes = snapshot.docs.map(serializeRoute);

    res.json({ routes });
  } catch (error) {
    next(error);
  }
}

async function getRouteById(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      const route = getMockRouteById(req.params.routeId);

      if (!route) {
        return res.status(404).json({ message: 'Route not found' });
      }

      return res.json({ route });
    }

    const doc = await getDb().collection('routes').doc(req.params.routeId).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({ route: serializeRoute(doc) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRoutes,
  getRouteById,
};
