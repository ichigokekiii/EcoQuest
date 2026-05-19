import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { normalizeStick } from '../utils/geoMovement';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const JOYSTICK_SIZE = 104;
const KNOB_SIZE = 44;
const MAX_KNOB_RADIUS = (JOYSTICK_SIZE - KNOB_SIZE) / 2 - 4;
const PILL_SIZE = 56;

export default function RouteWalkJoystick({
  onVectorChange,
  onReset,
  onCollapse,
  isWalking = false,
  bottomOffset = 284,
}) {
  const [expanded, setExpanded] = useState(false);
  const offsetX = useSharedValue(16);
  const offsetY = useSharedValue(SCREEN_HEIGHT - bottomOffset - PILL_SIZE);
  const knobX = useSharedValue(0);
  const knobY = useSharedValue(0);
  const dragContext = useSharedValue({ x: 0, y: 0 });

  const publishVector = useCallback(
    (x, y) => {
      const normalized = normalizeStick(x, y, 1);
      onVectorChange?.(normalized);
    },
    [onVectorChange]
  );

  const springKnobToCenter = useCallback(() => {
    knobX.value = withSpring(0, { damping: 18, stiffness: 220 });
    knobY.value = withSpring(0, { damping: 18, stiffness: 220 });
  }, [knobX, knobY]);

  const resetKnob = useCallback(() => {
    springKnobToCenter();
    publishVector(0, 0);
  }, [publishVector, springKnobToCenter]);

  const shellDragGesture = Gesture.Pan()
    .enabled(!expanded)
    .onStart(() => {
      dragContext.value = { x: offsetX.value, y: offsetY.value };
    })
    .onUpdate((event) => {
      const nextX = dragContext.value.x + event.translationX;
      const nextY = dragContext.value.y + event.translationY;
      const maxX = SCREEN_WIDTH - PILL_SIZE - 16;
      const maxY = SCREEN_HEIGHT - PILL_SIZE - 16;

      offsetX.value = Math.min(Math.max(nextX, 8), maxX);
      offsetY.value = Math.min(Math.max(nextY, 80), maxY);
    });

  const knobGesture = Gesture.Pan()
    .onStart(() => {
      dragContext.value = { x: knobX.value, y: knobY.value };
    })
    .onUpdate((event) => {
      const nextX = dragContext.value.x + event.translationX;
      const nextY = dragContext.value.y + event.translationY;
      const distance = Math.hypot(nextX, nextY);
      const clampedDistance = Math.min(distance, MAX_KNOB_RADIUS);
      const scale = distance > 0 ? clampedDistance / distance : 0;
      const clampedX = nextX * scale;
      const clampedY = nextY * scale;

      knobX.value = clampedX;
      knobY.value = clampedY;

      runOnJS(publishVector)(clampedX / MAX_KNOB_RADIUS, clampedY / MAX_KNOB_RADIUS);
    })
    .onEnd(() => {
      knobX.value = withSpring(0, { damping: 18, stiffness: 220 });
      knobY.value = withSpring(0, { damping: 18, stiffness: 220 });
      runOnJS(publishVector)(0, 0);
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: knobX.value }, { translateY: knobY.value }],
  }));

  const handleCollapse = () => {
    resetKnob();
    setExpanded(false);
    onCollapse?.();
  };

  const handleExpand = () => {
    const maxX = SCREEN_WIDTH - JOYSTICK_SIZE - 16;
    const maxY = SCREEN_HEIGHT - JOYSTICK_SIZE - 16;
    offsetX.value = Math.min(offsetX.value, maxX);
    offsetY.value = Math.min(offsetY.value, maxY);
    setExpanded(true);
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <GestureDetector gesture={shellDragGesture}>
        <Animated.View
          style={[styles.floatingContainer, containerStyle]}
          pointerEvents="box-none"
        >
          {expanded ? (
            <View style={styles.expandedWrap}>
              <Pressable style={styles.collapseButton} onPress={handleCollapse} hitSlop={8}>
                <Feather name="minimize-2" size={14} color="#6B7280" />
              </Pressable>

              <GestureDetector gesture={knobGesture}>
                <View style={styles.joystickPad}>
                  <Animated.View style={[styles.knob, knobStyle]} />
                </View>
              </GestureDetector>

              {isWalking ? <Text style={styles.demoBadge}>Demo walk</Text> : null}
            </View>
          ) : (
            <GestureDetector gesture={shellDragGesture}>
              <Pressable
                style={[styles.pill, isWalking && styles.pillActive]}
                onPress={handleExpand}
                onLongPress={onReset}
                delayLongPress={350}
              >
                <Feather name="navigation" size={22} color="#16A34A" />
                {isWalking ? <View style={styles.activeDot} /> : null}
              </Pressable>
            </GestureDetector>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  floatingContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  pill: {
    width: PILL_SIZE,
    height: PILL_SIZE,
    borderRadius: PILL_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillActive: {
    borderColor: '#86EFAC',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  expandedWrap: {
    width: JOYSTICK_SIZE,
    alignItems: 'center',
  },
  collapseButton: {
    alignSelf: 'flex-end',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  joystickPad: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: JOYSTICK_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#16A34A',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  demoBadge: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.3,
  },
});
