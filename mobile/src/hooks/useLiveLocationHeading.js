import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';

function normalizeHeading(value) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return null;
  }

  return value;
}

function hasSimulatedCoords(simulatedCoords) {
  return (
    simulatedCoords &&
    typeof simulatedCoords.latitude === 'number' &&
    typeof simulatedCoords.longitude === 'number'
  );
}

export function useLiveLocationHeading(enabled = true, options = {}) {
  const { simulatedCoords = null } = options;
  const isSimulating = hasSimulatedCoords(simulatedCoords);

  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!enabled || isSimulating) {
      return undefined;
    }

    let positionSubscription;
    let headingSubscription;
    let cancelled = false;

    async function startTracking() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (cancelled) {
        return;
      }

      if (status !== 'granted') {
        setPermissionDenied(true);
        return;
      }

      setPermissionDenied(false);

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          setLocation(current.coords);

          const initialHeading = normalizeHeading(current.coords.heading);
          if (initialHeading != null) {
            setHeading(initialHeading);
          }
        }
      } catch (error) {
        console.log('Unable to read current location:', error);
      }

      positionSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 3,
          timeInterval: 2000,
        },
        (update) => {
          setLocation(update.coords);

          const courseHeading = normalizeHeading(update.coords.heading);
          if (courseHeading != null) {
            setHeading(courseHeading);
          }
        }
      );

      headingSubscription = await Location.watchHeadingAsync((update) => {
        const compassHeading =
          normalizeHeading(update.trueHeading) ?? normalizeHeading(update.magHeading);

        if (compassHeading != null) {
          setHeading(compassHeading);
        }
      });
    }

    startTracking();

    return () => {
      cancelled = true;
      positionSubscription?.remove();
      headingSubscription?.remove();
    };
  }, [enabled, isSimulating]);

  const effectiveLocation = useMemo(() => {
    if (!isSimulating) {
      return location;
    }

    return {
      latitude: simulatedCoords.latitude,
      longitude: simulatedCoords.longitude,
      heading: simulatedCoords.heading,
    };
  }, [isSimulating, location, simulatedCoords]);

  const effectiveHeading = isSimulating
    ? simulatedCoords.heading ?? heading
    : heading;

  return {
    location: effectiveLocation,
    heading: effectiveHeading,
    permissionDenied: isSimulating ? false : permissionDenied,
    isSimulating,
  };
}
