const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc, serializeRoute } = require('../utils/firestoreSerializers');
const { getDashboardData } = require('../mock/mockData');

function sortByLatest(items = [], keys = ['updatedAt', 'createdAt']) {
  return [...items].sort((first, second) => {
    const firstKey = keys.find((key) => first[key]);
    const secondKey = keys.find((key) => second[key]);

    return new Date(second[secondKey] || 0) - new Date(first[firstKey] || 0);
  });
}

function buildActiveMissionPreview(activeSession) {
  if (!activeSession?.missionProgress?.length) {
    return null;
  }

  const nextMission =
    activeSession.missionProgress.find((mission) => !mission.isCompleted) ||
    activeSession.missionProgress[0];

  if (!nextMission) {
    return null;
  }

  return {
    missionId: nextMission.missionId,
    title: nextMission.title,
    currentCount: nextMission.currentCount || 0,
    requiredCount: nextMission.requiredCount || 0,
    isCompleted: Boolean(nextMission.isCompleted),
    pointsReward: nextMission.pointsReward || 0,
    routeId: activeSession.routeId,
    routeName: activeSession.routeName,
    trashCategoryName: nextMission.trashCategoryName || null,
  };
}

async function getDashboard(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json(getDashboardData());
    }

    const db = getDb();
    const [routesSnapshot, sessionsSnapshot] = await Promise.all([
      db.collection('routes').where('status', '==', 'active').limit(6).get(),
      db.collection('routeSessions').where('userId', '==', req.user.id).get(),
    ]);

    const nearbyRoutes = routesSnapshot.docs.map(serializeRoute);
    const sessions = sortByLatest(sessionsSnapshot.docs.map(serializeDoc), [
      'updatedAt',
      'startedAt',
      'createdAt',
    ]);
    const activeSession = sessions.find((session) => session.status === 'active') || null;
    const recentCompletedSessions = sessions
      .filter((session) => session.status === 'completed' || session.status === 'cancelled')
      .slice(0, 3);
    const activeMission = buildActiveMissionPreview(activeSession);

    return res.json({
      profile: {
        id: req.user.id,
        fullName: req.user.fullName,
        username: req.user.username || null,
        points: Number(req.user.points || 0),
        level: Number(req.user.level || 1),
        achievementsCount: Number(req.user.achievementsCount || 0),
      },
      stats: {
        points: Number(req.user.points || 0),
        totalTrashCollected: Number(req.user.totalTrashCollected || 0),
        routesCompleted: Number(req.user.routesCompleted || 0),
        missionsCompleted: Number(req.user.missionsCompleted || 0),
      },
      activeSession: activeSession
        ? {
            id: activeSession.id,
            routeId: activeSession.routeId,
            routeName: activeSession.routeName,
            trashCollected: Number(activeSession.trashCollected || 0),
            approvedTrashCount: Number(activeSession.approvedTrashCount || 0),
            requiredTrashCount: Number(activeSession.requiredTrashCount || 0),
          }
        : null,
      activeMission,
      nearbyRoutes,
      recentSessions: recentCompletedSessions,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
};
