const { admin, getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc, serializeRoute } = require('../utils/firestoreSerializers');
const {
  confirmTrash: confirmMockTrash,
  finishRouteSession: finishMockRouteSession,
  getActiveSession,
  getRouteHistory,
  getSessionDetails,
  startRouteSession: startMockRouteSession,
} = require('../mock/mockData');
const { getActiveTrashCategoryById } = require('../services/categoryMemoryService');
const { uploadTrashProofImage } = require('../services/trashImageStorageService');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildMissionProgressEntries(missions = []) {
  return missions.map((mission) => ({
    missionId: mission.id,
    title: mission.title,
    currentCount: 0,
    requiredCount: mission.requiredTrashCount || 0,
    isCompleted: false,
    trashCategoryId: mission.trashCategoryId || null,
    trashCategoryName: mission.trashCategoryName || null,
    pointsReward: mission.pointsReward || 0,
  }));
}

function sortByTimestampDescending(items, keyCandidates) {
  return [...items].sort((first, second) => {
    const firstValue = keyCandidates.find((key) => first[key]) ? new Date(first[keyCandidates.find((key) => first[key])]) : new Date(0);
    const secondValue = keyCandidates.find((key) => second[key]) ? new Date(second[keyCandidates.find((key) => second[key])]) : new Date(0);

    return secondValue - firstValue;
  });
}

async function findActiveSessionDocForUser(userId) {
  const snapshot = await getDb().collection('routeSessions').where('userId', '==', userId).get();

  return snapshot.docs.find((doc) => doc.data().status === 'active') || null;
}

async function getSessionDocForUser(sessionId, userId) {
  const sessionDoc = await getDb().collection('routeSessions').doc(sessionId).get();

  if (!sessionDoc.exists) {
    throw createHttpError(404, 'Session not found');
  }

  if (sessionDoc.data().userId !== userId) {
    throw createHttpError(403, 'You do not have access to this session');
  }

  return sessionDoc;
}

async function listSessionSubmissions(sessionId) {
  const snapshot = await getDb()
    .collection('trashSubmissions')
    .where('routeSessionId', '==', sessionId)
    .get();

  return sortByTimestampDescending(
    snapshot.docs.map(serializeDoc),
    ['updatedAt', 'createdAt']
  );
}

async function getActiveRouteSession(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ session: getActiveSession() });
    }

    const activeSessionDoc = await findActiveSessionDocForUser(req.user.id);

    return res.json({
      session: activeSessionDoc ? serializeDoc(activeSessionDoc) : null,
    });
  } catch (error) {
    next(error);
  }
}

async function getRouteSessionHistory(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ sessions: getRouteHistory() });
    }

    const snapshot = await getDb().collection('routeSessions').where('userId', '==', req.user.id).get();

    const sessions = sortByTimestampDescending(
      snapshot.docs
        .map(serializeDoc)
        .filter((session) => session.status === 'completed' || session.status === 'cancelled'),
      ['completedAt', 'cancelledAt', 'updatedAt']
    );

    return res.json({ sessions });
  } catch (error) {
    next(error);
  }
}

async function getRouteSessionById(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json(getSessionDetails(req.params.sessionId));
    }

    const sessionDoc = await getSessionDocForUser(req.params.sessionId, req.user.id);
    const submissions = await listSessionSubmissions(req.params.sessionId);

    return res.json({
      session: serializeDoc(sessionDoc),
      submissions,
    });
  } catch (error) {
    next(error);
  }
}

async function createRouteSession(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      const session = startMockRouteSession(req.params.routeId);

      return res.status(201).json({
        message: 'Route session started',
        session,
      });
    }

    const db = getDb();
    const routeDoc = await db.collection('routes').doc(req.params.routeId).get();

    if (!routeDoc.exists) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const serializedRoute = serializeRoute(routeDoc);

    if (serializedRoute.status !== 'active') {
      return res.status(400).json({ message: 'Route is not active' });
    }

    const existingActiveSessionDoc = await findActiveSessionDocForUser(req.user.id);

    if (existingActiveSessionDoc) {
      return res.status(409).json({
        message: 'User already has an active route session',
        session: serializeDoc(existingActiveSessionDoc),
      });
    }

    const missionSnapshot = await db
      .collection('missions')
      .where('routeId', '==', req.params.routeId)
      .where('status', '==', 'active')
      .get();

    const missions = missionSnapshot.docs.map(serializeDoc);
    const timestamp = admin.firestore.Timestamp.now();
    const sessionData = {
      userId: req.user.id,
      userName: req.user.fullName || req.user.username || req.user.email || 'Eco Quest User',
      routeId: req.params.routeId,
      routeName: serializedRoute.title,
      status: 'active',
      startedAt: timestamp,
      completedAt: null,
      cancelledAt: null,
      trashCollected: 0,
      approvedTrashCount: 0,
      requiredTrashCount: serializedRoute.minimumTrashRequired || serializedRoute.targetTrash || 0,
      visualMaxGoal:
        serializedRoute.visualMaxGoal ||
        serializedRoute.minimumTrashRequired ||
        serializedRoute.targetTrash ||
        0,
      missionProgress: buildMissionProgressEntries(missions),
      basePointsEarned: 0,
      trashPointsEarned: 0,
      bonusPointsEarned: 0,
      achievementBonusEarned: 0,
      totalPointsEarned: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const sessionRef = await db.collection('routeSessions').add(sessionData);

    return res.status(201).json({
      message: 'Route session started',
      session: {
        id: sessionRef.id,
        ...serializeDoc({
          id: sessionRef.id,
          data: () => sessionData,
        }),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function confirmRouteTrash(req, res, next) {
  try {
    const quantity = Math.max(1, Number.parseInt(req.body.quantity, 10) || 1);

    if (!isFirebaseConfigured()) {
      const result = confirmMockTrash(req.params.sessionId, req.body.finalCategoryId, quantity, req.body.imageUri);

      return res.status(201).json({
        message: 'Trash submission saved',
        ...result,
      });
    }

    const db = getDb();
    const category = await getActiveTrashCategoryById(req.body.finalCategoryId);

    if (!category) {
      throw createHttpError(400, 'Selected trash category is not active');
    }

    const existingSessionDoc = await getSessionDocForUser(req.params.sessionId, req.user.id);

    if (existingSessionDoc.data().status !== 'active') {
      throw createHttpError(400, 'Session is not active');
    }

    const uploadedImage = await uploadTrashProofImage({
      userId: req.user.id,
      sessionId: req.params.sessionId,
      imageBase64: req.body.imageBase64,
      imageMimeType: req.body.imageMimeType,
      imageFileName: req.body.imageFileName,
    });

    const result = await db.runTransaction(async (transaction) => {
      const sessionRef = db.collection('routeSessions').doc(req.params.sessionId);
      const sessionDoc = await transaction.get(sessionRef);

      if (!sessionDoc.exists) {
        throw createHttpError(404, 'Session not found');
      }

      const sessionData = sessionDoc.data();

      if (sessionData.userId !== req.user.id) {
        throw createHttpError(403, 'You do not have access to this session');
      }

      if (sessionData.status !== 'active') {
        throw createHttpError(400, 'Session is not active');
      }

      const timestamp = admin.firestore.Timestamp.now();
      const updatedMissionProgress = (sessionData.missionProgress || []).map((mission) => {
        if (mission.trashCategoryId && mission.trashCategoryId !== category.id) {
          return mission;
        }

        const currentCount = (mission.currentCount || 0) + quantity;

        return {
          ...mission,
          currentCount,
          isCompleted: currentCount >= (mission.requiredCount || 0),
        };
      });

      const updatedSession = {
        ...sessionData,
        trashCollected: (sessionData.trashCollected || 0) + quantity,
        approvedTrashCount: (sessionData.approvedTrashCount || 0) + quantity,
        missionProgress: updatedMissionProgress,
        updatedAt: timestamp,
      };

      const submissionRef = db.collection('trashSubmissions').doc();
      const submissionData = {
        routeSessionId: sessionDoc.id,
        routeId: sessionData.routeId,
        routeName: sessionData.routeName,
        userId: req.user.id,
        userName: req.user.fullName || req.user.username || req.user.email || 'Eco Quest User',
        finalCategoryId: category.id,
        finalCategoryName: category.name,
        trashCategoryId: category.id,
        trashCategoryName: category.name,
        quantity,
        imageUri: req.body.imageUri || null,
        imageUrl: uploadedImage.imageUrl || req.body.imageUrl || req.body.imageUri || null,
        storagePath: uploadedImage.storagePath,
        aiSuggestedCategoryId: req.body.aiSuggestedCategoryId || null,
        aiSuggestedCategoryName: req.body.aiSuggestedCategoryName || null,
        aiConfidence: req.body.aiConfidence ?? null,
        aiReason: req.body.aiReason || null,
        aiNeedsReview: Boolean(req.body.aiNeedsReview),
        categoryChangedByUser: Boolean(
          req.body.aiSuggestedCategoryId && req.body.aiSuggestedCategoryId !== category.id
        ),
        status: 'auto_approved',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      transaction.update(sessionRef, {
        trashCollected: updatedSession.trashCollected,
        approvedTrashCount: updatedSession.approvedTrashCount,
        missionProgress: updatedMissionProgress,
        updatedAt: timestamp,
      });
      transaction.set(submissionRef, submissionData);
      transaction.update(db.collection('users').doc(req.user.id), {
        totalTrashCollected: admin.firestore.FieldValue.increment(quantity),
        updatedAt: timestamp,
      });

      return {
        submission: {
          id: submissionRef.id,
          ...submissionData,
          createdAt: timestamp.toDate().toISOString(),
          updatedAt: timestamp.toDate().toISOString(),
        },
        session: {
          id: sessionDoc.id,
          ...updatedSession,
          updatedAt: timestamp.toDate().toISOString(),
        },
      };
    });

    return res.status(201).json({
      message: 'Trash submission saved',
      ...result,
      canFinish: result.session.approvedTrashCount >= result.session.requiredTrashCount,
    });
  } catch (error) {
    next(error);
  }
}

async function completeRouteSession(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      const result = finishMockRouteSession(req.params.sessionId);

      return res.json({
        message: 'Route completed',
        ...result,
      });
    }

    const db = getDb();
    const result = await db.runTransaction(async (transaction) => {
      const sessionRef = db.collection('routeSessions').doc(req.params.sessionId);
      const sessionDoc = await transaction.get(sessionRef);

      if (!sessionDoc.exists) {
        throw createHttpError(404, 'Session not found');
      }

      const sessionData = sessionDoc.data();

      if (sessionData.userId !== req.user.id) {
        throw createHttpError(403, 'You do not have access to this session');
      }

      if (sessionData.status !== 'active') {
        throw createHttpError(400, 'Session is not active');
      }

      if ((sessionData.approvedTrashCount || 0) < (sessionData.requiredTrashCount || 0)) {
        throw createHttpError(400, 'Minimum trash requirement not reached');
      }

      const routeDoc = await transaction.get(db.collection('routes').doc(sessionData.routeId));
      const routeData = routeDoc.exists ? serializeRoute(routeDoc) : null;
      const completedMissions = (sessionData.missionProgress || []).filter((mission) => mission.isCompleted);
      const timestamp = admin.firestore.Timestamp.now();
      const bonusTrash = Math.max(
        (sessionData.approvedTrashCount || 0) - (sessionData.requiredTrashCount || 0),
        0
      );
      const basePointsEarned = routeData?.basePoints || 0;
      const trashPointsEarned =
        (sessionData.approvedTrashCount || 0) * (routeData?.pointsPerTrash || 5);
      const bonusPointsEarned = bonusTrash * (routeData?.bonusPointsPerExtraTrash || 2);
      const achievementBonusEarned = completedMissions.reduce(
        (total, mission) => total + (mission.pointsReward || 0),
        0
      );
      const totalPointsEarned =
        basePointsEarned +
        trashPointsEarned +
        bonusPointsEarned +
        achievementBonusEarned;
      const pointTransactionRef = db.collection('pointTransactions').doc();
      const pointTransactionData = {
        userId: req.user.id,
        routeSessionId: sessionDoc.id,
        routeId: sessionData.routeId,
        routeName: sessionData.routeName,
        type: 'route_completion',
        points: totalPointsEarned,
        breakdown: {
          basePointsEarned,
          trashPointsEarned,
          bonusPointsEarned,
          achievementBonusEarned,
        },
        createdAt: timestamp,
      };

      transaction.update(sessionRef, {
        status: 'completed',
        completedAt: timestamp,
        updatedAt: timestamp,
        basePointsEarned,
        trashPointsEarned,
        bonusPointsEarned,
        achievementBonusEarned,
        totalPointsEarned,
      });
      transaction.update(db.collection('users').doc(req.user.id), {
        points: admin.firestore.FieldValue.increment(totalPointsEarned),
        routesCompleted: admin.firestore.FieldValue.increment(1),
        missionsCompleted: admin.firestore.FieldValue.increment(completedMissions.length),
        updatedAt: timestamp,
      });
      transaction.set(pointTransactionRef, pointTransactionData);

      return {
        session: {
          id: sessionDoc.id,
          ...sessionData,
          status: 'completed',
          completedAt: timestamp.toDate().toISOString(),
          updatedAt: timestamp.toDate().toISOString(),
          basePointsEarned,
          trashPointsEarned,
          bonusPointsEarned,
          achievementBonusEarned,
          totalPointsEarned,
        },
        summary: {
          basePointsEarned,
          trashPointsEarned,
          bonusPointsEarned,
          achievementBonusEarned,
          totalPointsEarned,
          completedMissions: completedMissions.length,
          bonusTrash,
          pointTransactionId: pointTransactionRef.id,
        },
      };
    });

    return res.json({
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
