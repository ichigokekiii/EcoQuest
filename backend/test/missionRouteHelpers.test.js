const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildMissionRouteFields,
  dedupeMissionsById,
  missionMatchesRoute,
  normalizeRouteIds,
  parseRouteIdsInput,
} = require('../src/utils/missionRouteHelpers');
const {
  getMissionsByRoute,
  resetDemoState,
  startRouteSession,
  cancelRouteSession,
  clearActiveRouteSessions,
} = require('../src/mock/mockData');

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

test('normalizeRouteIds prefers routeIds and falls back to legacy routeId', () => {
  assert.deepEqual(normalizeRouteIds({ routeIds: ['route-a', 'route-b'] }), ['route-a', 'route-b']);
  assert.deepEqual(normalizeRouteIds({ routeId: 'route-legacy' }), ['route-legacy']);
  assert.deepEqual(normalizeRouteIds({}), []);
});

test('parseRouteIdsInput accepts arrays and comma-separated strings', () => {
  assert.deepEqual(parseRouteIdsInput({ routeIds: ['route-a', 'route-b'] }), ['route-a', 'route-b']);
  assert.deepEqual(parseRouteIdsInput({ routeIds: 'route-a, route-b' }), ['route-a', 'route-b']);
  assert.deepEqual(parseRouteIdsInput({ routeId: 'route-a' }), ['route-a']);
});

test('buildMissionRouteFields keeps routeId synced to first routeIds entry', () => {
  assert.deepEqual(buildMissionRouteFields({ routeIds: ['route-b', 'route-a'] }), {
    routeIds: ['route-b', 'route-a'],
    routeId: 'route-b',
  });
});

test('missionMatchesRoute supports routeIds and legacy routeId', () => {
  const sharedMission = {
    id: 'mission-shared',
    routeIds: ['route-a', 'route-b'],
    routeId: 'route-a',
  };

  assert.equal(missionMatchesRoute(sharedMission, 'route-a'), true);
  assert.equal(missionMatchesRoute(sharedMission, 'route-b'), true);
  assert.equal(missionMatchesRoute(sharedMission, 'route-c'), false);
  assert.equal(missionMatchesRoute({ routeId: 'route-legacy' }, 'route-legacy'), true);
});

test('dedupeMissionsById merges duplicate mission results', () => {
  const missions = dedupeMissionsById([
    { id: 'mission-1', title: 'First' },
    { id: 'mission-1', title: 'Duplicate' },
    { id: 'mission-2', title: 'Second' },
  ]);

  assert.equal(missions.length, 2);
  assert.equal(missions[0].title, 'Duplicate');
});

test('session mission progress starts at zero for linked missions', () => {
  const missions = [
    {
      id: 'mission-shared',
      title: 'Collect 5 plastic bottles',
      requiredTrashCount: 5,
      trashCategoryId: 'plastic',
      trashCategoryName: 'Plastic',
      pointsReward: 20,
    },
  ];

  const routeAProgress = buildMissionProgressEntries(missions);
  const routeBProgress = buildMissionProgressEntries(missions);

  assert.deepEqual(routeAProgress, routeBProgress);
  assert.equal(routeAProgress[0].currentCount, 0);
  assert.equal(routeAProgress[0].requiredCount, 5);
  assert.equal(routeAProgress[0].isCompleted, false);
});

test('mock missions linked through routeIds appear on each route', () => {
  resetDemoState();

  const routeOneMissions = getMissionsByRoute('route-1');
  const routeTwoMissions = getMissionsByRoute('route-2');

  assert.ok(routeOneMissions.some((mission) => mission.id === 'mission-shared'));
  assert.ok(routeTwoMissions.some((mission) => mission.id === 'mission-shared'));
  assert.ok(routeOneMissions.some((mission) => mission.id === 'mission-1'));
  assert.ok(routeTwoMissions.some((mission) => mission.id === 'mission-2'));
});

test('mock route mission definitions resolve per route and start at zero when snapshotted', () => {
  resetDemoState();

  const routeOneMissions = getMissionsByRoute('route-1');
  const routeTwoMissions = getMissionsByRoute('route-2');
  const routeOneProgress = buildMissionProgressEntries(routeOneMissions);
  const routeTwoProgress = buildMissionProgressEntries(routeTwoMissions);

  assert.ok(routeOneProgress.every((mission) => mission.currentCount === 0));
  assert.ok(routeTwoProgress.every((mission) => mission.currentCount === 0));
  assert.ok(routeOneProgress.some((mission) => mission.missionId === 'mission-shared'));
  assert.ok(routeTwoProgress.some((mission) => mission.missionId === 'mission-shared'));
  assert.equal(routeOneProgress.some((mission) => mission.missionId === 'mission-2'), false);
  assert.equal(routeTwoProgress.some((mission) => mission.missionId === 'mission-1'), false);
});

test('mock startRouteSession snapshots zero mission progress for selected missions on each route', () => {
  resetDemoState();
  clearActiveRouteSessions();

  const routeOneMissions = getMissionsByRoute('route-1');
  const routeOneSession = startRouteSession(
    'route-1',
    routeOneMissions.map((mission) => mission.id)
  );

  assert.equal(routeOneSession.approvedTrashCount, 0);
  assert.equal(routeOneSession.trashCollected, 0);
  assert.ok(
    routeOneSession.missionProgress.every(
      (mission) => mission.currentCount === 0 && mission.isCompleted === false
    )
  );
  assert.ok(routeOneSession.missionProgress.some((mission) => mission.missionId === 'mission-shared'));
  assert.ok(routeOneSession.missionProgress.some((mission) => mission.missionId === 'mission-1'));
  assert.equal(routeOneSession.missionProgress.some((mission) => mission.missionId === 'mission-2'), false);
});

test('mock startRouteSession with no selected missions starts with empty mission progress', () => {
  resetDemoState();
  clearActiveRouteSessions();

  const session = startRouteSession('route-1', []);

  assert.deepEqual(session.missionProgress, []);
});

test('mock startRouteSession only includes explicitly selected missions', () => {
  resetDemoState();
  clearActiveRouteSessions();

  const session = startRouteSession('route-1', ['mission-1']);

  assert.equal(session.missionProgress.length, 1);
  assert.equal(session.missionProgress[0].missionId, 'mission-1');
});

test('mock cancelRouteSession ends active session so a fresh start is allowed', () => {
  resetDemoState();
  clearActiveRouteSessions();

  const firstSession = startRouteSession('route-1');
  firstSession.approvedTrashCount = 2;
  firstSession.trashCollected = 4;

  cancelRouteSession(firstSession.id);

  const restartedSession = startRouteSession('route-1', getMissionsByRoute('route-1').map((mission) => mission.id));

  assert.equal(restartedSession.approvedTrashCount, 0);
  assert.equal(restartedSession.trashCollected, 0);
  assert.notEqual(restartedSession.id, firstSession.id);
});
