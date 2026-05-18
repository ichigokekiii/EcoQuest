export const emptyRouteForm = {
  name: '',
  description: '',
  difficulty: 'easy',
  status: 'active',
  startLocationName: '',
  startLat: '14.6096',
  startLng: '120.9904',
  endLocationName: '',
  endLat: '14.6115',
  endLng: '120.993',
  distanceKm: '1',
  estimatedTimeMinutes: '20',
  minimumTrashRequired: '3',
  visualMaxGoal: '5',
  basePoints: '100',
  pointsPerTrash: '5',
  bonusPointsPerExtraTrash: '3',
  path: [],
};

export function buildRouteFormFromRoute(route) {
  return {
    name: route.name || route.title || '',
    description: route.description || '',
    difficulty: route.difficulty || 'easy',
    status: route.status || 'draft',
    startLocationName: route.startLocation?.name || route.locationName || '',
    startLat: String(route.startLocation?.lat ?? ''),
    startLng: String(route.startLocation?.lng ?? ''),
    endLocationName: route.endLocation?.name || '',
    endLat: String(route.endLocation?.lat ?? ''),
    endLng: String(route.endLocation?.lng ?? ''),
    distanceKm: String(route.distanceKm ?? ''),
    estimatedTimeMinutes: String(route.estimatedTimeMinutes ?? ''),
    minimumTrashRequired: String(route.minimumTrashRequired ?? route.targetTrash ?? ''),
    visualMaxGoal: String(route.visualMaxGoal ?? route.minimumTrashRequired ?? ''),
    basePoints: String(route.basePoints ?? 0),
    pointsPerTrash: String(route.pointsPerTrash ?? 5),
    bonusPointsPerExtraTrash: String(route.bonusPointsPerExtraTrash ?? 2),
    path: Array.isArray(route.path) ? route.path : route.coordinates || [],
  };
}

export function buildRoutePayload(form) {
  return {
    ...form,
    path: Array.isArray(form.path) ? form.path : [],
  };
}
