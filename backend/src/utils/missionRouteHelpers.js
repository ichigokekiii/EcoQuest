const { serializeDoc } = require('./firestoreSerializers');

function normalizeRouteIds(mission = {}) {
  if (Array.isArray(mission.routeIds) && mission.routeIds.length > 0) {
    return [...new Set(mission.routeIds.filter(Boolean))];
  }

  if (mission.routeId) {
    return [mission.routeId];
  }

  return [];
}

function missionMatchesRoute(mission, routeId) {
  if (!routeId) {
    return false;
  }

  return normalizeRouteIds(mission).includes(routeId);
}

function parseRouteIdsInput(body = {}, currentMission = {}) {
  if (Array.isArray(body.routeIds)) {
    return [...new Set(body.routeIds.filter(Boolean))];
  }

  if (typeof body.routeIds === 'string' && body.routeIds.trim()) {
    return [...new Set(body.routeIds.split(',').map((value) => value.trim()).filter(Boolean))];
  }

  if (body.routeId !== undefined) {
    return body.routeId ? [body.routeId] : [];
  }

  return normalizeRouteIds(currentMission);
}

function buildMissionRouteFields(body, currentMission = {}) {
  const routeIds = parseRouteIdsInput(body, currentMission);

  return {
    routeIds,
    routeId: routeIds[0] || '',
  };
}

function dedupeMissionsById(missions = []) {
  const missionsById = new Map();

  for (const mission of missions) {
    if (!mission?.id) {
      continue;
    }

    missionsById.set(mission.id, mission);
  }

  return [...missionsById.values()];
}

async function fetchActiveMissionsForRoute(db, routeId) {
  const [routeIdsSnapshot, legacySnapshot] = await Promise.all([
    db
      .collection('missions')
      .where('routeIds', 'array-contains', routeId)
      .where('status', '==', 'active')
      .get(),
    db
      .collection('missions')
      .where('routeId', '==', routeId)
      .where('status', '==', 'active')
      .get(),
  ]);

  return dedupeMissionsById([
    ...routeIdsSnapshot.docs.map(serializeDoc),
    ...legacySnapshot.docs.map(serializeDoc),
  ]);
}

module.exports = {
  normalizeRouteIds,
  missionMatchesRoute,
  parseRouteIdsInput,
  buildMissionRouteFields,
  dedupeMissionsById,
  fetchActiveMissionsForRoute,
};
