const DEMO_USER_ID = 'demo-user-1';

function now() {
  return new Date().toISOString();
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildMissionProgress(routeId, missionDefinitions, countsByMission = {}) {
  return missionDefinitions
    .filter((mission) => mission.routeId === routeId && mission.status === 'active')
    .map((mission) => {
      const currentCount = countsByMission[mission.id] || 0;

      return {
        missionId: mission.id,
        title: mission.title,
        currentCount,
        requiredCount: mission.requiredTrashCount,
        isCompleted: currentCount >= mission.requiredTrashCount,
        trashCategoryId: mission.trashCategoryId,
        trashCategoryName: mission.trashCategoryName,
      };
    });
}

function createSession(route, missionDefinitions, options = {}) {
  const startedAt = options.startedAt || now();

  return {
    id: options.id,
    userId: DEMO_USER_ID,
    routeId: route.id,
    routeName: route.title,
    status: options.status || 'active',
    startedAt,
    completedAt: options.completedAt || null,
    cancelledAt: options.cancelledAt || null,
    trashCollected: options.trashCollected || 0,
    approvedTrashCount: options.approvedTrashCount || 0,
    requiredTrashCount: route.requiredTrashCount,
    visualMaxGoal: route.visualMaxGoal,
    missionProgress: buildMissionProgress(
      route.id,
      missionDefinitions,
      options.countsByMission || {}
    ),
    basePointsEarned: options.basePointsEarned || 0,
    trashPointsEarned: options.trashPointsEarned || 0,
    bonusPointsEarned: options.bonusPointsEarned || 0,
    achievementBonusEarned: options.achievementBonusEarned || 0,
    totalPointsEarned: options.totalPointsEarned || 0,
    createdAt: options.createdAt || startedAt,
    updatedAt: options.updatedAt || startedAt,
  };
}

function createInitialState() {
  const routes = [
    {
      id: 'route-1',
      name: 'Riverside Cleanup',
      title: 'Riverside Cleanup',
      difficulty: 'Easy',
      locationName: 'Marina District',
      distance: '1.2 km',
      duration: '30 min',
      minTrash: 'Min 10',
      requiredTrashCount: 10,
      minimumTrashRequired: 10,
      visualMaxGoal: 20,
      points: 120,
      basePoints: 120,
      distanceKm: 1.2,
      estimatedTimeMinutes: 30,
      status: 'active',
      startLocation: {
        name: 'Marina District',
        lat: 37.8012,
        lng: -122.4402,
      },
      endLocation: {
        name: 'Marina District Exit',
        lat: 37.8038,
        lng: -122.436,
      },
      path: [
        { lat: 37.8012, lng: -122.4402 },
        { lat: 37.8025, lng: -122.4385 },
        { lat: 37.8038, lng: -122.436 },
      ],
      coordinates: [
        { latitude: 37.8012, longitude: -122.4402 },
        { latitude: 37.8025, longitude: -122.4385 },
        { latitude: 37.8038, longitude: -122.436 },
      ],
      markers: [
        {
          id: 'route-1-start',
          type: 'start',
          color: '#16A34A',
          coordinate: { latitude: 37.8012, longitude: -122.4402 },
        },
        {
          id: 'route-1-checkpoint',
          type: 'checkpoint',
          color: '#D97706',
          coordinate: { latitude: 37.8025, longitude: -122.4385 },
        },
        {
          id: 'route-1-end',
          type: 'end',
          color: '#16A34A',
          coordinate: { latitude: 37.8038, longitude: -122.436 },
        },
      ],
    },
    {
      id: 'route-2',
      name: 'Central Park Loop',
      title: 'Central Park Loop',
      difficulty: 'Medium',
      locationName: 'SoMa',
      distance: '2.5 km',
      duration: '55 min',
      minTrash: 'Min 18',
      requiredTrashCount: 18,
      minimumTrashRequired: 18,
      visualMaxGoal: 24,
      points: 250,
      basePoints: 250,
      distanceKm: 2.5,
      estimatedTimeMinutes: 55,
      status: 'active',
      startLocation: {
        name: 'SoMa',
        lat: 37.783,
        lng: -122.404,
      },
      endLocation: {
        name: 'SoMa South Exit',
        lat: 37.779,
        lng: -122.4005,
      },
      path: [
        { lat: 37.783, lng: -122.404 },
        { lat: 37.7815, lng: -122.402 },
        { lat: 37.779, lng: -122.4005 },
      ],
      coordinates: [
        { latitude: 37.783, longitude: -122.404 },
        { latitude: 37.7815, longitude: -122.402 },
        { latitude: 37.779, longitude: -122.4005 },
      ],
      markers: [
        {
          id: 'route-2-start',
          type: 'start',
          color: '#16A34A',
          coordinate: { latitude: 37.783, longitude: -122.404 },
        },
        {
          id: 'route-2-end',
          type: 'end',
          color: '#EF4444',
          coordinate: { latitude: 37.779, longitude: -122.4005 },
        },
      ],
    },
  ];

  const missionDefinitions = [
    {
      id: 'mission-1',
      routeId: 'route-1',
      title: 'Collect 5 plastic bottles',
      requiredTrashCount: 5,
      trashCategoryId: 'cat-plastic',
      trashCategoryName: 'Plastic',
      pointsReward: 20,
      status: 'active',
    },
    {
      id: 'mission-2',
      routeId: 'route-2',
      title: 'Collect 8 plastic items',
      requiredTrashCount: 8,
      trashCategoryId: 'cat-plastic',
      trashCategoryName: 'Plastic',
      pointsReward: 30,
      status: 'active',
    },
  ];

  const trashCategories = [
    { id: 'cat-plastic', name: 'Plastic', status: 'active' },
    { id: 'cat-paper', name: 'Paper', status: 'active' },
    { id: 'cat-glass', name: 'Glass', status: 'active' },
  ];

  const activeSession = createSession(routes[0], missionDefinitions, {
    id: 'session-1',
    trashCollected: 3,
    approvedTrashCount: 3,
    countsByMission: { 'mission-1': 3 },
    startedAt: '2026-05-18T07:30:00.000Z',
    createdAt: '2026-05-18T07:30:00.000Z',
    updatedAt: '2026-05-18T08:10:00.000Z',
  });

  const completedSession = createSession(routes[1], missionDefinitions, {
    id: 'session-0',
    status: 'completed',
    trashCollected: 20,
    approvedTrashCount: 20,
    countsByMission: { 'mission-2': 8 },
    basePointsEarned: 250,
    trashPointsEarned: 100,
    bonusPointsEarned: 4,
    achievementBonusEarned: 30,
    totalPointsEarned: 384,
    startedAt: '2026-05-15T09:00:00.000Z',
    createdAt: '2026-05-15T09:00:00.000Z',
    updatedAt: '2026-05-15T10:05:00.000Z',
    completedAt: '2026-05-15T10:05:00.000Z',
  });

  const rewards = [
    {
      id: 'reward-1',
      name: 'Eco Tote Bag',
      pointsCost: 600,
      stock: 14,
      description: 'Reusable bag for your next cleanup run.',
    },
    {
      id: 'reward-2',
      name: 'Stainless Water Bottle',
      pointsCost: 900,
      stock: 9,
      description: 'A refillable bottle for long route sessions.',
    },
    {
      id: 'reward-3',
      name: 'Tree Planting Voucher',
      pointsCost: 1200,
      stock: 5,
      description: 'Convert your points into a funded tree planting.',
    },
  ];

  const trashSubmissions = [
    {
      id: 'submission-1',
      routeSessionId: 'session-1',
      routeId: 'route-1',
      finalCategoryId: 'cat-plastic',
      finalCategoryName: 'Plastic',
      status: 'auto_approved',
      createdAt: '2026-05-18T07:40:00.000Z',
      updatedAt: '2026-05-18T07:40:00.000Z',
    },
    {
      id: 'submission-2',
      routeSessionId: 'session-1',
      routeId: 'route-1',
      finalCategoryId: 'cat-plastic',
      finalCategoryName: 'Plastic',
      status: 'auto_approved',
      createdAt: '2026-05-18T07:52:00.000Z',
      updatedAt: '2026-05-18T07:52:00.000Z',
    },
    {
      id: 'submission-3',
      routeSessionId: 'session-1',
      routeId: 'route-1',
      finalCategoryId: 'cat-plastic',
      finalCategoryName: 'Plastic',
      status: 'auto_approved',
      createdAt: '2026-05-18T08:05:00.000Z',
      updatedAt: '2026-05-18T08:05:00.000Z',
    },
  ];

  return {
    user: {
      id: DEMO_USER_ID,
      name: 'Alex Rivera',
      fullName: 'Alex Rivera',
      email: 'alex.rivera@ecoquest.app',
      greeting: 'Good morning',
      rank: 12,
      level: 'Green Ranger',
      points: 2480,
      totalTrashCollected: 124,
      routesCompleted: 8,
      missionsCompleted: 5,
      joinedAt: '2026-03-05T08:00:00.000Z',
    },
    routes,
    missionDefinitions,
    trashCategories,
    routeSessions: [completedSession, activeSession],
    rewards,
    trashSubmissions,
    nextSessionNumber: 2,
    nextSubmissionNumber: 4,
  };
}

let state = createInitialState();

function getRoutes() {
  return state.routes;
}

function getRouteById(routeId) {
  return state.routes.find((route) => route.id === routeId);
}

function getRouteHistory() {
  return state.routeSessions
    .filter(
      (session) =>
        session.userId === DEMO_USER_ID &&
        (session.status === 'completed' || session.status === 'cancelled')
    )
    .sort((first, second) => {
      const firstDate = first.completedAt || first.cancelledAt || first.updatedAt;
      const secondDate = second.completedAt || second.cancelledAt || second.updatedAt;

      return new Date(secondDate) - new Date(firstDate);
    });
}

function getActiveSession() {
  return (
    state.routeSessions.find(
      (session) => session.userId === DEMO_USER_ID && session.status === 'active'
    ) || null
  );
}

function getDashboardData() {
  return {
    user: {
      id: state.user.id,
      name: state.user.name,
      greeting: state.user.greeting,
      points: state.user.points,
      rank: state.user.rank,
      level: state.user.level,
    },
    stats: {
      totalTrashCollected: state.user.totalTrashCollected,
      routesCompleted: state.user.routesCompleted,
      missionsCompleted: state.user.missionsCompleted,
    },
    activeSession: getActiveSession(),
    nearbyRoutes: getRoutes(),
  };
}

function getMissionsByRoute(routeId) {
  return state.missionDefinitions.filter(
    (mission) => mission.routeId === routeId && mission.status === 'active'
  );
}

function getMissionOverview() {
  const activeSession = getActiveSession();

  return {
    activeSession,
    availableRoutes: getRoutes(),
    history: getRouteHistory(),
    canFinish: activeSession
      ? activeSession.approvedTrashCount >= activeSession.requiredTrashCount
      : false,
  };
}

function getStoreData() {
  return {
    pointsBalance: state.user.points,
    rewards: state.rewards,
  };
}

function getProfileData() {
  return {
    user: state.user,
    activeSession: getActiveSession(),
    recentSessions: getRouteHistory(),
  };
}

function getAdminDashboardData() {
  const recentUsers = [
    {
      id: 'demo-user-1',
      fullName: 'Alex Rivera',
      email: 'alex.rivera@ecoquest.app',
      role: 'user',
      status: 'active',
      points: state.user.points,
    },
    {
      id: 'admin-user-1',
      fullName: 'Jamie Santos',
      email: 'jamie.santos@ecoquest.app',
      role: 'admin',
      status: 'active',
      points: 0,
    },
  ];

  return {
    admin: {
      id: 'admin-user-1',
      fullName: 'Jamie Santos',
      role: 'admin',
    },
    summary: {
      users: recentUsers.length,
      activeUsers: recentUsers.filter((user) => user.status === 'active').length,
      routes: state.routes.length,
      activeRoutes: state.routes.filter((route) => route.status === 'active').length,
      missions: state.missionDefinitions.length,
      activeMissions: state.missionDefinitions.filter((mission) => mission.status === 'active')
        .length,
    },
    recentUsers,
    routes: state.routes,
  };
}

function getSessionById(sessionId) {
  const session = state.routeSessions.find((item) => item.id === sessionId);

  if (!session) {
    throw createHttpError(404, 'Session not found');
  }

  return session;
}

function getSessionDetails(sessionId) {
  const session = getSessionById(sessionId);
  const submissions = state.trashSubmissions.filter(
    (submission) => submission.routeSessionId === sessionId
  );

  return {
    session,
    submissions,
  };
}

function getMissionProgress(sessionId) {
  return getSessionById(sessionId).missionProgress;
}

function startRouteSession(routeId) {
  const route = getRouteById(routeId);

  if (!route) {
    throw createHttpError(404, 'Route not found');
  }

  if (route.status !== 'active') {
    throw createHttpError(400, 'Route is not active');
  }

  const activeSession = getActiveSession();

  if (activeSession) {
    throw createHttpError(409, 'User already has an active route session');
  }

  const sessionId = `session-${state.nextSessionNumber}`;
  state.nextSessionNumber += 1;

  const createdAt = now();
  const session = createSession(route, state.missionDefinitions, {
    id: sessionId,
    startedAt: createdAt,
    createdAt,
    updatedAt: createdAt,
  });

  state.routeSessions.push(session);

  return session;
}

function confirmTrash(sessionId, finalCategoryId = 'cat-plastic') {
  const session = getSessionById(sessionId);

  if (session.status !== 'active') {
    throw createHttpError(400, 'Session is not active');
  }

  const category = state.trashCategories.find(
    (item) => item.id === finalCategoryId && item.status === 'active'
  );

  if (!category) {
    throw createHttpError(400, 'Invalid category');
  }

  session.trashCollected += 1;
  session.approvedTrashCount += 1;
  session.updatedAt = now();

  session.missionProgress = session.missionProgress.map((mission) => {
    if (mission.trashCategoryId && mission.trashCategoryId !== finalCategoryId) {
      return mission;
    }

    const currentCount = mission.currentCount + 1;

    return {
      ...mission,
      currentCount,
      isCompleted: currentCount >= mission.requiredCount,
    };
  });

  state.user.totalTrashCollected += 1;

  const submissionId = `submission-${state.nextSubmissionNumber}`;
  state.nextSubmissionNumber += 1;

  const submission = {
    id: submissionId,
    routeSessionId: session.id,
    routeId: session.routeId,
    finalCategoryId: category.id,
    finalCategoryName: category.name,
    status: 'auto_approved',
    createdAt: now(),
    updatedAt: now(),
  };

  state.trashSubmissions.push(submission);

  return {
    submission,
    session,
    canFinish: session.approvedTrashCount >= session.requiredTrashCount,
  };
}

function getMissionReward(missionId) {
  return (
    state.missionDefinitions.find((mission) => mission.id === missionId)?.pointsReward || 0
  );
}

function finishRouteSession(sessionId) {
  const session = getSessionById(sessionId);

  if (session.status !== 'active') {
    throw createHttpError(400, 'Session is not active');
  }

  if (session.approvedTrashCount < session.requiredTrashCount) {
    throw createHttpError(400, 'Minimum trash requirement not reached');
  }

  const route = getRouteById(session.routeId);
  const completedMissions = session.missionProgress.filter((mission) => mission.isCompleted);
  const bonusTrash = Math.max(session.approvedTrashCount - session.requiredTrashCount, 0);

  session.basePointsEarned = route ? route.basePoints : 0;
  session.trashPointsEarned = session.approvedTrashCount * 5;
  session.bonusPointsEarned = bonusTrash * 2;
  session.achievementBonusEarned = completedMissions.reduce(
    (total, mission) => total + getMissionReward(mission.missionId),
    0
  );
  session.totalPointsEarned =
    session.basePointsEarned +
    session.trashPointsEarned +
    session.bonusPointsEarned +
    session.achievementBonusEarned;
  session.status = 'completed';
  session.completedAt = now();
  session.updatedAt = now();

  state.user.points += session.totalPointsEarned;
  state.user.routesCompleted += 1;
  state.user.missionsCompleted += completedMissions.length;

  return {
    session,
    summary: {
      basePointsEarned: session.basePointsEarned,
      trashPointsEarned: session.trashPointsEarned,
      bonusPointsEarned: session.bonusPointsEarned,
      achievementBonusEarned: session.achievementBonusEarned,
      totalPointsEarned: session.totalPointsEarned,
    },
  };
}

function resetDemoState() {
  state = createInitialState();
  return getDashboardData();
}

module.exports = {
  createHttpError,
  getDashboardData,
  getAdminDashboardData,
  getRoutes,
  getRouteById,
  getActiveSession,
  getRouteHistory,
  getMissionsByRoute,
  getMissionOverview,
  getStoreData,
  getProfileData,
  getSessionDetails,
  getMissionProgress,
  startRouteSession,
  confirmTrash,
  finishRouteSession,
  resetDemoState,
};
