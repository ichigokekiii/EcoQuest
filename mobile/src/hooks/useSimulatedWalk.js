import { useCallback, useEffect, useRef, useState } from 'react';
import {
  headingFromVector,
  moveByMeters,
  stickMagnitude,
  velocityFromStick,
} from '../utils/geoMovement';

export const MAX_WALK_SPEED_MPS = 18;
const STICK_DEADZONE = 0.08;

function isValidCoordinate(coordinate) {
  return (
    coordinate &&
    typeof coordinate.latitude === 'number' &&
    typeof coordinate.longitude === 'number'
  );
}

export function useSimulatedWalk({ enabled = true, seedCoordinate = null, resetCoordinate = null }) {
  const [coords, setCoords] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const positionRef = useRef(null);
  const headingRef = useRef(0);
  const joystickRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(null);
  const lastFrameTimeRef = useRef(null);
  const hasSeededRef = useRef(false);

  const stopLoop = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastFrameTimeRef.current = null;
  }, []);

  const seedPosition = useCallback(
    (coordinate) => {
      if (!isValidCoordinate(coordinate)) {
        return false;
      }

      positionRef.current = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };
      headingRef.current = coordinate.heading ?? headingRef.current ?? 0;
      setCoords({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        heading: headingRef.current,
      });
      hasSeededRef.current = true;
      return true;
    },
    []
  );

  const ensureSeeded = useCallback(() => {
    if (hasSeededRef.current && positionRef.current) {
      return true;
    }

    if (isValidCoordinate(seedCoordinate)) {
      return seedPosition(seedCoordinate);
    }

    return false;
  }, [seedCoordinate, seedPosition]);

  const tick = useCallback(
    (timestamp) => {
      if (!enabled || !isActive || !positionRef.current) {
        stopLoop();
        return;
      }

      const { x, y } = joystickRef.current;
      const magnitude = stickMagnitude(x, y);

      if (magnitude < STICK_DEADZONE) {
        stopLoop();
        return;
      }

      if (lastFrameTimeRef.current == null) {
        lastFrameTimeRef.current = timestamp;
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const deltaSeconds = Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.05);
      lastFrameTimeRef.current = timestamp;

      const { eastMps, northMps } = velocityFromStick(x, y, MAX_WALK_SPEED_MPS);
      const eastDelta = eastMps * deltaSeconds;
      const northDelta = northMps * deltaSeconds;

      if (eastDelta !== 0 || northDelta !== 0) {
        const nextPosition = moveByMeters(positionRef.current, eastDelta, northDelta);
        positionRef.current = nextPosition;

        const nextHeading = headingFromVector(eastMps, northMps);
        if (nextHeading != null) {
          headingRef.current = nextHeading;
        }

        setCoords({
          latitude: nextPosition.latitude,
          longitude: nextPosition.longitude,
          heading: headingRef.current,
        });
      }

      frameRef.current = requestAnimationFrame(tick);
    },
    [enabled, isActive, stopLoop]
  );

  const startLoop = useCallback(() => {
    if (frameRef.current != null) {
      return;
    }

    lastFrameTimeRef.current = null;
    frameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const setJoystickVector = useCallback(
    (vector) => {
      const x = vector?.x ?? 0;
      const y = vector?.y ?? 0;
      joystickRef.current = { x, y };

      if (!enabled) {
        return;
      }

      const magnitude = stickMagnitude(x, y);
      if (magnitude < STICK_DEADZONE) {
        stopLoop();
        return;
      }

      if (!isActive) {
        if (!ensureSeeded()) {
          return;
        }
        setIsActive(true);
      }

      startLoop();
    },
    [enabled, isActive, ensureSeeded, startLoop, stopLoop]
  );

  const resetToStart = useCallback(() => {
    stopLoop();
    joystickRef.current = { x: 0, y: 0 };

    const target = isValidCoordinate(resetCoordinate)
      ? resetCoordinate
      : isValidCoordinate(seedCoordinate)
        ? seedCoordinate
        : null;

    if (!target) {
      setIsActive(false);
      setCoords(null);
      positionRef.current = null;
      hasSeededRef.current = false;
      return;
    }

    seedPosition(target);
    setIsActive(false);
  }, [resetCoordinate, seedCoordinate, seedPosition, stopLoop]);

  const deactivate = useCallback(() => {
    stopLoop();
    joystickRef.current = { x: 0, y: 0 };
    setIsActive(false);
    setCoords(null);
    positionRef.current = null;
    hasSeededRef.current = false;
  }, [stopLoop]);

  useEffect(() => {
    if (!enabled) {
      deactivate();
    }
  }, [enabled, deactivate]);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  return {
    coords,
    isActive,
    isWalking: isActive && stickMagnitude(joystickRef.current.x, joystickRef.current.y) >= STICK_DEADZONE,
    setJoystickVector,
    resetToStart,
    deactivate,
  };
}
