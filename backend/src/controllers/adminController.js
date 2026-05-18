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

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const number = Number(value);

  return Number.isNaN(number) ? fallback : number;
}

function sortByUpdatedAt(items) {
  return items.sort(
    (first, second) =>
      new Date(second.updatedAt || second.createdAt || 0) -
      new Date(first.updatedAt || first.createdAt || 0)
  );
}

function buildMissionData(body, currentMission = {}) {
  return {
    title: body.title ?? currentMission.title ?? 'Untitled Mission',
    routeId: body.routeId ?? currentMission.routeId ?? '',
    requiredTrashCount:
      body.requiredTrashCount !== undefined
        ? toNumber(body.requiredTrashCount, 1)
        : currentMission.requiredTrashCount ?? 1,
    trashCategoryId: body.trashCategoryId ?? currentMission.trashCategoryId ?? 'cat-plastic',
    trashCategoryName: body.trashCategoryName ?? currentMission.trashCategoryName ?? 'Plastic',
    pointsReward:
      body.pointsReward !== undefined
        ? toNumber(body.pointsReward, 0)
        : currentMission.pointsReward ?? 0,
    status: body.status ?? currentMission.status ?? 'active',
  };
}

function buildRewardData(body, currentReward = {}) {
  return {
    name: body.name ?? currentReward.name ?? 'Untitled Reward',
    description: body.description ?? currentReward.description ?? '',
    pointsCost:
      body.pointsCost !== undefined ? toNumber(body.pointsCost, 0) : currentReward.pointsCost ?? 0,
    stock: body.stock !== undefined ? toNumber(body.stock, 0) : currentReward.stock ?? 0,
    status: body.status ?? currentReward.status ?? 'active',
    category: body.category ?? currentReward.category ?? 'Eco Gear',
    imageUrl: body.imageUrl ?? currentReward.imageUrl ?? null,
  };
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
      activeSessionsSnapshot,
      submissionsSnapshot,
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('users').where('status', '==', 'active').get(),
      db.collection('routes').get(),
      db.collection('routes').where('status', '==', 'active').get(),
      db.collection('missions').get(),
      db.collection('missions').where('status', '==', 'active').get(),
      db.collection('routeSessions').where('status', '==', 'active').get(),
      db.collection('trashSubmissions').get(),
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
        activeRouteSessions: activeSessionsSnapshot.size,
        trashSubmissions: submissionsSnapshot.size,
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

    const snapshot = await getDb().collection('routes').limit(parseLimit(req.query.limit, 20)).get();

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

async function updateAdminRoute(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for route writes.' });
    }

    const routeRef = getDb().collection('routes').doc(req.params.routeId);
    const existingRoute = await routeRef.get();

    if (!existingRoute.exists) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const currentRoute = existingRoute.data();
    const updatedAt = admin.firestore.FieldValue.serverTimestamp();
    const nextRouteData = {
      name: req.body.name ?? currentRoute.name ?? 'Untitled Cleanup Route',
      description: req.body.description ?? currentRoute.description ?? '',
      startLocation: {
        name: req.body.startLocationName ?? currentRoute.startLocation?.name ?? 'Route Start',
        lat:
          req.body.startLat !== undefined
            ? Number(req.body.startLat) || 0
            : currentRoute.startLocation?.lat || 0,
        lng:
          req.body.startLng !== undefined
            ? Number(req.body.startLng) || 0
            : currentRoute.startLocation?.lng || 0,
      },
      endLocation: {
        name: req.body.endLocationName ?? currentRoute.endLocation?.name ?? 'Route End',
        lat:
          req.body.endLat !== undefined
            ? Number(req.body.endLat) || 0
            : currentRoute.endLocation?.lat || 0,
        lng:
          req.body.endLng !== undefined
            ? Number(req.body.endLng) || 0
            : currentRoute.endLocation?.lng || 0,
      },
      path: Array.isArray(req.body.path) ? req.body.path : currentRoute.path || [],
      distanceKm:
        req.body.distanceKm !== undefined
          ? Number(req.body.distanceKm) || 0
          : currentRoute.distanceKm || 0,
      estimatedTimeMinutes:
        req.body.estimatedTimeMinutes !== undefined
          ? Number(req.body.estimatedTimeMinutes) || 0
          : currentRoute.estimatedTimeMinutes || 0,
      difficulty: req.body.difficulty ?? currentRoute.difficulty ?? 'easy',
      minimumTrashRequired:
        req.body.minimumTrashRequired !== undefined
          ? Number(req.body.minimumTrashRequired) || 1
          : currentRoute.minimumTrashRequired || 1,
      visualMaxGoal:
        req.body.visualMaxGoal !== undefined
          ? Number(req.body.visualMaxGoal) || 1
          : currentRoute.visualMaxGoal || currentRoute.minimumTrashRequired || 1,
      basePoints:
        req.body.basePoints !== undefined ? Number(req.body.basePoints) || 0 : currentRoute.basePoints || 0,
      pointsPerTrash:
        req.body.pointsPerTrash !== undefined
          ? Number(req.body.pointsPerTrash) || 0
          : currentRoute.pointsPerTrash || 0,
      bonusPointsPerExtraTrash:
        req.body.bonusPointsPerExtraTrash !== undefined
          ? Number(req.body.bonusPointsPerExtraTrash) || 0
          : currentRoute.bonusPointsPerExtraTrash || 0,
      status: req.body.status ?? currentRoute.status ?? 'draft',
      imageUrl: req.body.imageUrl ?? currentRoute.imageUrl ?? null,
      updatedAt,
    };

    await routeRef.set(nextRouteData, { merge: true });
    const updatedRoute = await routeRef.get();

    return res.json({
      message: 'Route updated',
      route: serializeRoute(updatedRoute),
    });
  } catch (error) {
    next(error);
  }
}

async function listAdminRouteSessions(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ sessions: getAdminDashboardData().sessions || [] });
    }

    const snapshot = await getDb()
      .collection('routeSessions')
      .limit(parseLimit(req.query.limit, 20))
      .get();

    const sessions = snapshot.docs
      .map(serializeDoc)
      .sort((first, second) => new Date(second.updatedAt || second.createdAt) - new Date(first.updatedAt || first.createdAt));

    return res.json({ sessions });
  } catch (error) {
    next(error);
  }
}

async function listAdminTrashSubmissions(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ submissions: getAdminDashboardData().submissions || [] });
    }

    const snapshot = await getDb()
      .collection('trashSubmissions')
      .limit(parseLimit(req.query.limit, 20))
      .get();

    const submissions = snapshot.docs
      .map(serializeDoc)
      .sort((first, second) => new Date(second.updatedAt || second.createdAt) - new Date(first.updatedAt || first.createdAt));

    return res.json({ submissions });
  } catch (error) {
    next(error);
  }
}

async function updateAdminTrashSubmission(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      const submission = getAdminDashboardData().submissions.find(
        (item) => item.id === req.params.submissionId
      );

      if (!submission) {
        return res.status(404).json({ message: 'Trash submission not found' });
      }

      return res.json({
        message: 'Submission updated',
        submission: {
          ...submission,
          status: req.body.status || submission.status,
          reviewedBy: req.user.id,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const submissionRef = getDb().collection('trashSubmissions').doc(req.params.submissionId);
    const existingSubmission = await submissionRef.get();

    if (!existingSubmission.exists) {
      return res.status(404).json({ message: 'Trash submission not found' });
    }

    await submissionRef.set(
      {
        status: req.body.status || existingSubmission.data().status || 'pending',
        reviewNotes: req.body.reviewNotes || null,
        reviewedBy: req.user.id,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updatedSubmission = await submissionRef.get();

    return res.json({
      message: 'Submission updated',
      submission: serializeDoc(updatedSubmission),
    });
  } catch (error) {
    next(error);
  }
}

async function listAdminMissions(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ missions: getAdminDashboardData().missions || [] });
    }

    const snapshot = await getDb().collection('missions').limit(parseLimit(req.query.limit, 50)).get();
    const missions = sortByUpdatedAt(snapshot.docs.map(serializeDoc));

    return res.json({ missions });
  } catch (error) {
    next(error);
  }
}

async function createAdminMission(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for mission writes.' });
    }

    const missionData = {
      ...buildMissionData(req.body),
      createdBy: req.user.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await getDb().collection('missions').add(missionData);
    const missionDoc = await docRef.get();

    return res.status(201).json({
      message: 'Mission created',
      mission: serializeDoc(missionDoc),
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminMission(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for mission writes.' });
    }

    const missionRef = getDb().collection('missions').doc(req.params.missionId);
    const existingMission = await missionRef.get();

    if (!existingMission.exists) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    await missionRef.set(
      {
        ...buildMissionData(req.body, existingMission.data()),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updatedMission = await missionRef.get();

    return res.json({
      message: 'Mission updated',
      mission: serializeDoc(updatedMission),
    });
  } catch (error) {
    next(error);
  }
}

async function listAdminRewards(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ rewards: getAdminDashboardData().rewards || [] });
    }

    const snapshot = await getDb().collection('rewards').limit(parseLimit(req.query.limit, 50)).get();
    const rewards = sortByUpdatedAt(snapshot.docs.map(serializeDoc));

    return res.json({ rewards });
  } catch (error) {
    next(error);
  }
}

async function createAdminReward(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for reward writes.' });
    }

    const rewardData = {
      ...buildRewardData(req.body),
      createdBy: req.user.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await getDb().collection('rewards').add(rewardData);
    const rewardDoc = await docRef.get();

    return res.status(201).json({
      message: 'Reward created',
      reward: serializeDoc(rewardDoc),
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminReward(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for reward writes.' });
    }

    const rewardRef = getDb().collection('rewards').doc(req.params.rewardId);
    const existingReward = await rewardRef.get();

    if (!existingReward.exists) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    await rewardRef.set(
      {
        ...buildRewardData(req.body, existingReward.data()),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updatedReward = await rewardRef.get();

    return res.json({
      message: 'Reward updated',
      reward: serializeDoc(updatedReward),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAdminMission,
  createAdminReward,
  createAdminRoute,
  getAdminDashboard,
  listAdminMissions,
  listAdminRewards,
  listAdminUsers,
  listAdminRoutes,
  listAdminRouteSessions,
  listAdminTrashSubmissions,
  updateAdminMission,
  updateAdminReward,
  updateAdminRoute,
  updateAdminTrashSubmission,
};
