const { admin, getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc, serializeRoute } = require('../utils/firestoreSerializers');
const { getAdminDashboardData } = require('../mock/mockData');
const {
  attachRewardRedemptionStats,
  listRedemptions,
} = require('../services/redemptionService');
const { reverseGeocode, searchLocations } = require('../services/geocodingService');

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

const { buildMissionRouteFields } = require('../utils/missionRouteHelpers');

function buildMissionData(body, currentMission = {}) {
  const { routeIds, routeId } = buildMissionRouteFields(body, currentMission);

  return {
    title: body.title ?? currentMission.title ?? 'Untitled Mission',
    routeIds,
    routeId,
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
      pendingSubmissionsSnapshot,
      redemptionsSnapshot,
    ] = await Promise.all([
      db.collection('users').get(),
      db.collection('users').where('status', '==', 'active').get(),
      db.collection('routes').get(),
      db.collection('routes').where('status', '==', 'active').get(),
      db.collection('missions').get(),
      db.collection('missions').where('status', '==', 'active').get(),
      db.collection('routeSessions').where('status', '==', 'active').get(),
      db.collection('trashSubmissions').get(),
      db.collection('trashSubmissions').where('status', '==', 'pending').get(),
      db.collection('redemptions').get(),
    ]);
    const totalPointsRedeemed = redemptionsSnapshot.docs.reduce((total, redemptionDoc) => {
      const redemption = redemptionDoc.data();
      return total + (redemption.status === 'cancelled' ? 0 : Number(redemption.pointsSpent || 0));
    }, 0);

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
        pendingSubmissions: pendingSubmissionsSnapshot.size,
        redemptions: redemptionsSnapshot.size,
        pointsRedeemed: totalPointsRedeemed,
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

async function deleteAdminRoute(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for route writes.' });
    }

    const routeId = req.params.routeId;
    const routeRef = getDb().collection('routes').doc(routeId);
    const existingRoute = await routeRef.get();

    if (!existingRoute.exists) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const activeSessionSnapshot = await getDb()
      .collection('routeSessions')
      .where('routeId', '==', routeId)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (!activeSessionSnapshot.empty) {
      return res.status(409).json({
        message: 'Cannot delete a route while a user has an active session on it.',
      });
    }

    await routeRef.delete();

    return res.json({
      message: 'Route deleted',
      routeId,
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

async function updateAdminUserRole(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for user role updates.' });
    }

    const allowedRoles = ['user', 'admin'];
    const nextRole = req.body.role;

    if (!allowedRoles.includes(nextRole)) {
      return res.status(400).json({ message: 'Role must be user or admin.' });
    }

    const userRef = getDb().collection('users').doc(req.params.userId);
    const existingUser = await userRef.get();

    if (!existingUser.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userRef.set(
      {
        role: nextRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updatedUser = await userRef.get();

    return res.json({
      message: 'User role updated',
      user: serializeDoc(updatedUser),
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminUserStatus(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for user status updates.' });
    }

    const allowedStatuses = ['active', 'inactive', 'suspended'];
    const nextStatus = req.body.status;

    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ message: 'Status must be active, inactive, or suspended.' });
    }

    const userRef = getDb().collection('users').doc(req.params.userId);
    const existingUser = await userRef.get();

    if (!existingUser.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    await userRef.set(
      {
        status: nextStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updatedUser = await userRef.get();

    return res.json({
      message: 'User status updated',
      user: serializeDoc(updatedUser),
    });
  } catch (error) {
    next(error);
  }
}

function buildTrashCategoryData(body, currentCategory = {}) {
  return {
    name: body.name ?? currentCategory.name ?? 'Untitled Category',
    description: body.description ?? currentCategory.description ?? '',
    examples: Array.isArray(body.examples)
      ? body.examples
      : currentCategory.examples || [],
    rules: Array.isArray(body.rules) ? body.rules : currentCategory.rules || [],
    status: body.status ?? currentCategory.status ?? 'active',
  };
}

async function listAdminTrashCategories(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ categories: getAdminDashboardData().trashCategories || [] });
    }

    const snapshot = await getDb()
      .collection('trashCategories')
      .limit(parseLimit(req.query.limit, 50))
      .get();
    const categories = sortByUpdatedAt(snapshot.docs.map(serializeDoc));

    return res.json({ categories });
  } catch (error) {
    next(error);
  }
}

async function createAdminTrashCategory(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for category writes.' });
    }

    const categoryId =
      req.body.id?.trim() ||
      String(req.body.name || 'category')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    if (!categoryId) {
      return res.status(400).json({ message: 'Category id or name is required.' });
    }

    const categoryRef = getDb().collection('trashCategories').doc(categoryId);
    const existingCategory = await categoryRef.get();

    if (existingCategory.exists) {
      return res.status(409).json({ message: 'Category id already exists.' });
    }

    const categoryData = {
      ...buildTrashCategoryData(req.body),
      createdBy: req.user.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await categoryRef.set(categoryData);
    const categoryDoc = await categoryRef.get();

    return res.status(201).json({
      message: 'Trash category created',
      category: serializeDoc(categoryDoc),
    });
  } catch (error) {
    next(error);
  }
}

async function updateAdminTrashCategory(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: 'Firebase is not configured for category writes.' });
    }

    const categoryRef = getDb().collection('trashCategories').doc(req.params.categoryId);
    const existingCategory = await categoryRef.get();

    if (!existingCategory.exists) {
      return res.status(404).json({ message: 'Trash category not found' });
    }

    await categoryRef.set(
      {
        ...buildTrashCategoryData(req.body, existingCategory.data()),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const updatedCategory = await categoryRef.get();

    return res.json({
      message: 'Trash category updated',
      category: serializeDoc(updatedCategory),
    });
  } catch (error) {
    next(error);
  }
}

async function applyTrashSubmissionApproval(submissionRef, submissionData, reviewerId) {
  const db = getDb();
  const quantity = submissionData.quantity || 1;

  return db.runTransaction(async (transaction) => {
    const sessionRef = db.collection('routeSessions').doc(submissionData.routeSessionId);
    const sessionDoc = await transaction.get(sessionRef);

    if (!sessionDoc.exists) {
      throw new Error('Route session not found');
    }

    const sessionData = sessionDoc.data();
    const timestamp = admin.firestore.Timestamp.now();
    const updatedMissionProgress = (sessionData.missionProgress || []).map((mission) => {
      if (mission.trashCategoryId && mission.trashCategoryId !== submissionData.finalCategoryId) {
        return mission;
      }

      const currentCount = (mission.currentCount || 0) + quantity;

      return {
        ...mission,
        currentCount,
        isCompleted: currentCount >= (mission.requiredCount || 0),
      };
    });

    transaction.update(sessionRef, {
      approvedTrashCount: (sessionData.approvedTrashCount || 0) + quantity,
      missionProgress: updatedMissionProgress,
      updatedAt: timestamp,
    });
    transaction.update(db.collection('users').doc(submissionData.userId), {
      totalTrashCollected: admin.firestore.FieldValue.increment(quantity),
      updatedAt: timestamp,
    });
    transaction.update(submissionRef, {
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: timestamp,
      updatedAt: timestamp,
    });
  });
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

    const existingData = existingSubmission.data();
    const nextStatus = req.body.status || existingData.status || 'pending';

    if (
      nextStatus === 'approved' &&
      existingData.status !== 'approved' &&
      existingData.routeSessionId
    ) {
      await applyTrashSubmissionApproval(submissionRef, existingData, req.user.id);
      const updatedSubmission = await submissionRef.get();

      return res.json({
        message: 'Submission approved',
        submission: serializeDoc(updatedSubmission),
      });
    }

    await submissionRef.set(
      {
        status: nextStatus,
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

    const [snapshot, redemptions] = await Promise.all([
      getDb().collection('rewards').limit(parseLimit(req.query.limit, 50)).get(),
      listRedemptions({ limit: 500 }),
    ]);
    const rewards = sortByUpdatedAt(
      attachRewardRedemptionStats(snapshot.docs.map(serializeDoc), redemptions)
    );

    return res.json({ rewards });
  } catch (error) {
    next(error);
  }
}

async function listAdminRedemptions(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ redemptions: getAdminDashboardData().redemptions || [] });
    }

    const redemptions = await listRedemptions({
      limit: req.query.limit || 50,
      userId: req.query.userId,
      rewardId: req.query.rewardId,
      status: req.query.status,
    });

    return res.json({ redemptions });
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

async function searchAdminLocations(req, res, next) {
  try {
    const result = await searchLocations(req.query.q);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function reverseGeocodeAdminLocation(req, res, next) {
  try {
    const result = await reverseGeocode(req.query.lat, req.query.lng);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAdminMission,
  createAdminReward,
  createAdminRoute,
  deleteAdminRoute,
  createAdminTrashCategory,
  getAdminDashboard,
  listAdminMissions,
  listAdminRedemptions,
  listAdminRewards,
  listAdminTrashCategories,
  listAdminUsers,
  listAdminRoutes,
  listAdminRouteSessions,
  listAdminTrashSubmissions,
  reverseGeocodeAdminLocation,
  searchAdminLocations,
  updateAdminMission,
  updateAdminReward,
  updateAdminRoute,
  updateAdminTrashCategory,
  updateAdminTrashSubmission,
  updateAdminUserRole,
  updateAdminUserStatus,
};
