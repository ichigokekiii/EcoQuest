const { getDb, isFirebaseConfigured } = require('../config/firebaseAdmin');
const { serializeDoc } = require('../utils/firestoreSerializers');
const { getProfileData } = require('../mock/mockData');
const { listRedemptions } = require('../services/redemptionService');

function sortByLatest(items = [], keys = ['updatedAt', 'createdAt']) {
  return [...items].sort((first, second) => {
    const firstKey = keys.find((key) => first[key]);
    const secondKey = keys.find((key) => second[key]);

    return new Date(second[secondKey] || 0) - new Date(first[firstKey] || 0);
  });
}

async function getProfileOverview(req, res, next) {
  try {
    if (!isFirebaseConfigured()) {
      return res.json(getProfileData());
    }

    const db = getDb();
    const [sessionsSnapshot, submissionsSnapshot, redemptions] = await Promise.all([
      db.collection('routeSessions').where('userId', '==', req.user.id).get(),
      db.collection('trashSubmissions').where('userId', '==', req.user.id).get(),
      listRedemptions({ userId: req.user.id, limit: 10 }),
    ]);

    const recentSessions = sortByLatest(sessionsSnapshot.docs.map(serializeDoc), [
      'completedAt',
      'updatedAt',
      'createdAt',
    ]).slice(0, 6);
    const recentSubmissions = sortByLatest(submissionsSnapshot.docs.map(serializeDoc), [
      'createdAt',
      'updatedAt',
    ]).slice(0, 6);
    const achievementsSummary = [
      {
        id: 'points-earned',
        title: 'Points Earned',
        value: Number(req.user.points || 0),
        icon: 'zap',
      },
      {
        id: 'trash-collected',
        title: 'Trash Collected',
        value: Number(req.user.totalTrashCollected || 0),
        icon: 'trash-2',
      },
      {
        id: 'routes-completed',
        title: 'Routes Completed',
        value: Number(req.user.routesCompleted || 0),
        icon: 'map',
      },
      {
        id: 'missions-completed',
        title: 'Missions Completed',
        value: Number(req.user.missionsCompleted || 0),
        icon: 'target',
      },
    ];

    return res.json({
      profile: {
        id: req.user.id,
        fullName: req.user.fullName,
        username: req.user.username || null,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl || null,
        role: req.user.role || 'user',
        status: req.user.status || 'active',
        level: Number(req.user.level || 1),
        achievementsCount: Number(req.user.achievementsCount || 0),
      },
      stats: {
        points: Number(req.user.points || 0),
        totalTrashCollected: Number(req.user.totalTrashCollected || 0),
        routesCompleted: Number(req.user.routesCompleted || 0),
        missionsCompleted: Number(req.user.missionsCompleted || 0),
      },
      recentSessions,
      recentSubmissions,
      recentRedemptions: redemptions,
      achievementsSummary,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfileOverview,
};
