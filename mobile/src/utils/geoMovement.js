const METERS_PER_DEGREE_LAT = 111320;

export function normalizeStick(x, y, maxRadius = 1) {
  const magnitude = Math.hypot(x, y);

  if (magnitude <= maxRadius || magnitude === 0) {
    return { x, y };
  }

  const scale = maxRadius / magnitude;
  return { x: x * scale, y: y * scale };
}

export function stickMagnitude(x, y) {
  return Math.hypot(x, y);
}

export function headingFromVector(eastMps, northMps) {
  if (Math.abs(eastMps) < 0.001 && Math.abs(northMps) < 0.001) {
    return null;
  }

  const radians = Math.atan2(eastMps, northMps);
  const degrees = (radians * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
}

export function moveByMeters({ latitude, longitude }, eastMeters, northMeters) {
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180);

  return {
    latitude: latitude + northMeters / METERS_PER_DEGREE_LAT,
    longitude: longitude + eastMeters / metersPerDegreeLng,
  };
}

export function velocityFromStick(stickX, stickY, maxSpeedMps) {
  const magnitude = stickMagnitude(stickX, stickY);
  const clampedMagnitude = Math.min(magnitude, 1);
  const speed = clampedMagnitude * maxSpeedMps;

  if (speed <= 0) {
    return { eastMps: 0, northMps: 0, speed: 0 };
  }

  const normalizedX = stickX / magnitude;
  const normalizedY = stickY / magnitude;

  return {
    eastMps: normalizedX * speed,
    northMps: -normalizedY * speed,
    speed,
  };
}
