const { admin, getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc, serializeRoute } = require('../utils/firestoreSerializers');
const { getAdminDashboardData } = require('../mock/mockData');

function parseLimit(rawLimit, fallback = 10) {
  const limit = Number.parseInt(rawLimit, 10);

  if (Number.isNaN(limit) || limit <= 0) {
    return fallback;
  }

  return Math.min(limit, 50);
}

async function getAdminDashboard(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json(getAdminDashboardData());
    }

    const db = getDb();
    const [
      usersSnapshot,
      activeUsersSnapshot,
      routesSnapshot,
      activeRoutesSnapshot,
      missionsSnapshot,
      activeMissionsSnapshot,
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('users').where('status', '==', 'active').get(),
      db.collection('routes').get(),
      db.collection('routes').where('status', '==', 'active').get(),
      db.collection('missions').get(),
      db.collection('missions').where('status', '==', 'active').get(),
    ]);

    return res.json({
      admin: {
        id: req.user.id,
        fullName: req.user.fullName,
        role: req.user.role,
      },
      summary: {
        users: usersSnapshot.size,
        activeUsers: activeUsersSnapshot.size,
        routes: routesSnapshot.size,
        activeRoutes: activeRoutesSnapshot.size,
        missions: missionsSnapshot.size,
        activeMissions: activeMissionsSnapshot.size,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function listAdminUsers(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ users: getAdminDashboardData().recentUsers });
    }

    const snapshot = await getDb().collection('users').limit(parseLimit(req.query.limit)).get();

    return res.json({
      users: snapshot.docs.map(serializeDoc),
    });
  } catch (error) {
    next(error);
  }
}

async function listAdminRoutes(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ routes: getAdminDashboardData().routes });
    }

    const snapshot = await getDb().collection('routes').limit(parseLimit(req.query.limit)).get();

    return res.json({
      routes: snapshot.docs.map(serializeRoute),
    });
  } catch (error) {
    next(error);
  }
}

async function createAdminRoute(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for route writes.' });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const routeData = {
      name: req.body.name || 'Untitled Cleanup Route',
      description: req.body.description || '',
      startLocation: {
        name: req.body.startLocationName || 'Route Start',
        lat: Number(req.body.startLat) || 0,
        lng: Number(req.body.startLng) || 0,
      },
      endLocation: {
        name: req.body.endLocationName || 'Route End',
        lat: Number(req.body.endLat) || 0,
        lng: Number(req.body.endLng) || 0,
      },
      path: Array.isArray(req.body.path) ? req.body.path : [],
      distanceKm: Number(req.body.distanceKm) || 0,
      estimatedTimeMinutes: Number(req.body.estimatedTimeMinutes) || 0,
      difficulty: req.body.difficulty || 'easy',
      minimumTrashRequired: Number(req.body.minimumTrashRequired) || 1,
      visualMaxGoal: Number(req.body.visualMaxGoal) || Number(req.body.minimumTrashRequired) || 1,
      basePoints: Number(req.body.basePoints) || 0,
      pointsPerTrash: Number(req.body.pointsPerTrash) || 0,
      bonusPointsPerExtraTrash: Number(req.body.bonusPointsPerExtraTrash) || 0,
      status: req.body.status || 'draft',
      imageUrl: req.body.imageUrl || null,
      createdBy: req.user.id,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await getDb().collection('routes').add(routeData);
    const routeDoc = await docRef.get();

    return res.status(201).json({
      message: 'Route created',
      route: serializeRoute(routeDoc),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAdminRoute,
  getAdminDashboard,
  listAdminUsers,
  listAdminRoutes,
};
