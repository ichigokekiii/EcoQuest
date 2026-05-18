const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc } = require('../utils/firestoreSerializers');
const {
  getMissionsByRoute: getMockMissionsByRoute,
  getMissionOverview,
  getMissionProgress,
} = require('../mock/mockData');
const { fetchActiveMissionsForRoute, normalizeRouteIds } = require('../utils/missionRouteHelpers');

function sortByLatest(items = [], keys = ['updatedAt', 'createdAt']) {
  return [...items].sort((first, second) => {
    const firstKey = keys.find((key) => first[key]);
    const secondKey = keys.find((key) => second[key]);

    return new Date(second[secondKey] || 0) - new Date(first[firstKey] || 0);
  });
}

function getWeekWindowStart() {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  return now;
}

function buildMissionProgressMap(sessions = []) {
  return sessions.reduce((progressMap, session) => {
    for (const mission of session.missionProgress || []) {
      const currentProgress = progressMap[mission.missionId] || {
        currentCount: 0,
        isCompleted: false,
      };

      progressMap[mission.missionId] = {
        currentCount: currentProgress.currentCount + Number(mission.currentCount || 0),
        isCompleted: currentProgress.isCompleted || Boolean(mission.isCompleted),
      };
    }

    return progressMap;
  }, {});
}

async function getMissions(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json(getMissionOverview());
    }

    const db = getDb();
    const [missionsSnapshot, routesSnapshot, sessionsSnapshot] = await Promise.all([
      db.collection('missions').get(),
      db.collection('routes').get(),
      db.collection('routeSessions').where('userId', '==', req.user.id).get(),
    ]);

    const missions = missionsSnapshot.docs.map(serializeDoc);
    const routesById = Object.fromEntries(
      routesSnapshot.docs.map((routeDoc) => {
        const route = serializeDoc(routeDoc);
        return [route.id, route.name || route.title || 'Cleanup Route'];
      })
    );
    const sessions = sortByLatest(sessionsSnapshot.docs.map(serializeDoc), [
      'updatedAt',
      'completedAt',
      'createdAt',
    ]);
    const progressByMissionId = buildMissionProgressMap(sessions);

    const all = missions.map((mission) => {
      const progress = progressByMissionId[mission.id] || {
        currentCount: 0,
        isCompleted: false,
      };
      const target = Number(mission.requiredTrashCount || 0);
      const current = Math.min(progress.currentCount, target || progress.currentCount);
      const isCompleted = progress.isCompleted || (target > 0 && progress.currentCount >= target);

      return {
        id: mission.id,
        title: mission.title,
        subtitle: mission.trashCategoryName
          ? `Collect ${target} ${mission.trashCategoryName}`
          : `Collect ${target} items`,
        routeId: normalizeRouteIds(mission)[0] || mission.routeId || null,
        routeIds: normalizeRouteIds(mission),
        routeName:
          normalizeRouteIds(mission)
            .map((linkedRouteId) => routesById[linkedRouteId])
            .filter(Boolean)
            .join(', ') || 'Cleanup Route',
        trashCategoryId: mission.trashCategoryId || null,
        trashCategoryName: mission.trashCategoryName || null,
        pointsReward: Number(mission.pointsReward || 0),
        current,
        target,
        isCompleted,
        status: mission.status || 'active',
      };
    });

    const active = all.filter(
      (mission) => (mission.status === 'active' || mission.status === 'scheduled') && !mission.isCompleted
    );
    const completed = all.filter((mission) => mission.isCompleted);
    const weekStart = getWeekWindowStart();
    const weeklySessions = sessions.filter((session) => {
      const timestamp = session.completedAt || session.updatedAt || session.createdAt;
      return timestamp ? new Date(timestamp) >= weekStart : false;
    });
    const weeklyProgress = {
      completedMissions: weeklySessions.reduce(
        (total, session) =>
          total +
          (session.missionProgress || []).filter((mission) => mission.isCompleted).length,
        0
      ),
      totalMissions: all.length,
      totalPoints: weeklySessions.reduce(
        (total, session) => total + Number(session.totalPointsEarned || 0),
        0
      ),
      approvedTrashCount: weeklySessions.reduce(
        (total, session) => total + Number(session.approvedTrashCount || 0),
        0
      ),
    };

    return res.json({
      active,
      completed,
      all,
      weeklyProgress,
    });
  } catch (error) {
    next(error);
  }
}

async function getMissionsByRoute(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({ missions: getMockMissionsByRoute(req.params.routeId) });
    }

    const missions = await fetchActiveMissionsForRoute(getDb(), req.params.routeId);

    res.json({ missions });
  } catch (error) {
    next(error);
  }
}

async function getSessionMissionProgress(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json({
        sessionId: req.params.sessionId,
        missionProgress: getMissionProgress(req.params.sessionId),
      });
    }

    const sessionDoc = await getDb().collection('routeSessions').doc(req.params.sessionId).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = serializeDoc(sessionDoc);

    if (session.userId !== req.user.id) {
      return res.status(403).json({ message: 'You do not have access to this session' });
    }

    return res.json({
      sessionId: req.params.sessionId,
      missionProgress: session.missionProgress || [],
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
