function toPlainValue(value) {
  if (value && typeof value.toDate === 'function') {
    return value.toISOString ? value.toISOString() : value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toPlainValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, toPlainValue(nestedValue)])
    );
  }

  return value;
}

function mapRoutePathToCoordinates(path = []) {
  return path.map((point) => ({
    latitude: point.lat,
    longitude: point.lng,
  }));
}

function buildRouteMarkers(route) {
  const markers = [];

  if (route.startLocation?.lat && route.startLocation?.lng) {
    markers.push({
      id: `${route.id}-start`,
      type: 'start',
      color: '#16A34A',
      coordinate: {
        latitude: route.startLocation.lat,
        longitude: route.startLocation.lng,
      },
    });
  }

  if (route.endLocation?.lat && route.endLocation?.lng) {
    markers.push({
      id: `${route.id}-end`,
      type: 'end',
      color: '#EF4444',
      coordinate: {
        latitude: route.endLocation.lat,
        longitude: route.endLocation.lng,
      },
    });
  }

  return markers;
}

function serializeDoc(doc) {
  return {
    id: doc.id,
    ...toPlainValue(doc.data()),
  };
}

function serializeRoute(doc) {
  const route = serializeDoc(doc);

  return {
    ...route,
    title: route.name,
    locationName: route.startLocation?.name || 'Route Start',
    distance: `${route.distanceKm} km`,
    duration: `${route.estimatedTimeMinutes} min`,
    minTrash: `Min ${route.minimumTrashRequired}`,
    points: route.basePoints,
    coordinates: mapRoutePathToCoordinates(route.path),
    markers: buildRouteMarkers(route),
  };
}

module.exports = {
  serializeDoc,
  serializeRoute,
};
