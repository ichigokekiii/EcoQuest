import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { spacing, radius } from '../src/constants/theme';
import {
  finishRouteSession,
  getActiveRouteSession,
  getRouteById,
  getRouteMissions,
  getRouteSessionById,
} from '../src/services/api';

const { height, width } = Dimensions.get('window');

const GOOGLE_DIRECTIONS_APIKEY =
  process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY ||
  (Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
    : process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY);

const SNAP_TOP = 0;
const SNAP_BOTTOM = 180; // Collapsed snap: show progress labels above fixed bottom button; hide in-card actions

function normalizeRoute(route) {
  const firstCoordinate = route.coordinates?.[0];

  return {
    ...route,
    centerRegion: route.centerRegion || {
      latitude: firstCoordinate?.latitude || 14.6096,
      longitude: firstCoordinate?.longitude || 120.9904,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    },
    targetTrash: route.targetTrash || route.minimumTrashRequired || 0,
  };
}

export default function ActiveRouteScreen() {
  const router = useRouter();
  const { id, sessionId, refresh } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [session, setSession] = useState(null);
  const [routeMissions, setRouteMissions] = useState([]);
  const [finishing, setFinishing] = useState(false);

  // Reanimated Bottom Sheet State
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      if (translateY.value < -20) translateY.value = -20; // Soft clamp top
    })
    .onEnd((event) => {
      let targetY = SNAP_TOP;
      if (event.velocityY > 500 || translateY.value > SNAP_BOTTOM / 2) {
        targetY = SNAP_BOTTOM;
      }
      // Stiff, rigid locking physics matching Move It
      translateY.value = withSpring(targetY, { damping: 20, stiffness: 250, mass: 0.5 });
    });

  const bottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: Math.max(translateY.value, -10) }]
    };
  });

  const popupStyle = useAnimatedStyle(() => {
    const isCollapsed = translateY.value > SNAP_BOTTOM / 2;
    return {
      opacity: withTiming(isCollapsed ? 1 : 0, { duration: 150 }),
      transform: [{ translateY: withTiming(isCollapsed ? 0 : 150, { duration: 150 }) }],
      // Prevent pointer events when hidden by setting zIndex dynamically
      zIndex: isCollapsed ? 150 : -1,
    };
  });

  useEffect(() => {
    fetchActiveRouteState();
  }, [id, sessionId, refresh]);

  const fetchActiveRouteState = async () => {
    try {
      setLoading(true);
      const sessionResponse = sessionId
        ? await getRouteSessionById(sessionId)
        : await getActiveRouteSession();
      const resolvedSession = sessionResponse.session || null;

      if (!resolvedSession) {
        setSession(null);
        setRoute(null);
        setRouteMissions([]);
        setLoading(false);
        return;
      }

      const routeId = resolvedSession.routeId || id;
      const [routeResponse, missionsResponse] = await Promise.all([
        getRouteById(routeId),
        getRouteMissions(routeId),
      ]);

      setSession(resolvedSession);
      setRouteCoordinates([]);
      setRoute(normalizeRoute(routeResponse.route || routeResponse));
      setRouteMissions(missionsResponse.missions || []);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching active route state:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  if (!session || !route) {
    return (
      <View style={[styles.container, styles.emptyStateContainer]}>
        <Feather name="map" size={40} color="#16A34A" />
        <Text style={styles.emptyStateTitle}>No active route session</Text>
        <Text style={styles.emptyStateText}>
          Start a cleanup route from the map tab to track your progress here.
        </Text>
        <TouchableOpacity style={styles.addPhotoButton} onPress={() => router.replace('/(tabs)/map')}>
          <Text style={styles.addPhotoText}>Browse Routes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const trashTarget = route.targetTrash || route.minimumTrashRequired || session.requiredTrashCount || 0;
  const approvedTrashCount = Number(session.approvedTrashCount || 0);
  const submittedTrashCount = Number(session.trashCollected || 0);
  const pendingReviewCount = Math.max(submittedTrashCount - approvedTrashCount, 0);
  const progressPercent = trashTarget > 0 ? Math.min((approvedTrashCount / trashTarget) * 100, 100) : 0;
  const canFinish = approvedTrashCount >= session.requiredTrashCount;
  const approvedPointsPreview = approvedTrashCount * 5;
  const missionProgress = session.missionProgress || [];

  return (
    <View style={styles.container}>
      {/* Fullscreen Map (Light Mode) */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={route.centerRegion}
        showsCompass={false}
        showsUserLocation={false}
      >
        {GOOGLE_DIRECTIONS_APIKEY && route.coordinates?.length >= 2 ? (
          <>
            <MapViewDirections
              origin={route.coordinates[0]}
              destination={route.coordinates[route.coordinates.length - 1]}
              waypoints={route.coordinates.length > 2 ? route.coordinates.slice(1, -1) : []}
              apikey={GOOGLE_DIRECTIONS_APIKEY}
              strokeWidth={7}
              strokeColor="#15803d"
              onReady={(result) => setRouteCoordinates(result.coordinates)}
              mode="WALKING"
            />
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#4ade80"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </>
        ) : (
          <Polyline
            coordinates={route.coordinates}
            strokeColor="#16A34A"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Mock User Location Marker */}
        {route.coordinates.length > 0 && (
          <Marker coordinate={route.coordinates[0]} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userLocationOuter}>
              <View style={styles.userLocationInner} />
            </View>
          </Marker>
        )}

        {route.markers.map(marker => (
          <Marker key={marker.id} coordinate={marker.coordinate} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[
              styles.standardMarker,
              { backgroundColor: marker.type === 'start' ? '#16A34A' : marker.type === 'checkpoint' ? '#D97706' : '#111827' }
            ]} />
          </Marker>
        ))}
      </MapView>

      {/* Top Overlays */}
      <SafeAreaView edges={['top']} style={styles.topOverlays} pointerEvents="box-none">
        <View style={styles.headerRow} pointerEvents="box-none">
          <View style={styles.leftPills} pointerEvents="box-none">
            <View style={styles.distancePillLarge}>
              <Feather name="map-pin" size={18} color="#9CA3AF" style={styles.distanceIcon} />
              <Text style={styles.distanceTextNumber}>{route.distance}</Text>
              <Text style={styles.distanceTextUnit}> left</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.quitIconButton} onPress={() => router.replace('/(tabs)/map')}>
            <Feather name="log-out" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Fixed Bottom Button (Visible only when swiped down) */}
      <Animated.View style={[styles.bottomActionContainer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }, popupStyle]}>
        <TouchableOpacity
          style={styles.addPhotoButton}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/camera', params: { id: route.id, sessionId: session.id } })}
        >
          <Feather name="camera" size={20} color="#FFFFFF" style={styles.cameraIcon} />
          <Text style={styles.addPhotoText}>Add Trash Photo</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Interactive Draggable Bottom Sheet */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.bottomSheet,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
            bottomSheetStyle
          ]}
        >
          {/* Drag Handle Area */}
          <View style={styles.dragArea}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Content Area */}
          <View style={styles.sheetContentWrapper}>
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.sheetSubtitle}>APPROVED TRASH</Text>
                <View style={styles.countRow}>
                  <Text style={styles.largeCount}>{approvedTrashCount}</Text>
                  <Text style={styles.subCount}>/ {trashTarget}</Text>
                </View>
              </View>
              <View style={styles.pointsTextContainer}>
                <Text style={styles.pointsNumberText}>+{approvedPointsPreview} </Text>
                <Text style={styles.pointsUnitText}>pts</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabelText}>Approved: {approvedTrashCount}</Text>
                <Text style={styles.progressLabelActive}>Goal: {trashTarget}</Text>
              </View>
            </View>

            <View style={styles.reviewSummaryRow}>
              <View style={styles.reviewSummaryCard}>
                <Text style={styles.reviewSummaryLabel}>Submitted</Text>
                <Text style={styles.reviewSummaryValue}>{submittedTrashCount}</Text>
              </View>
              <View style={styles.reviewSummaryCard}>
                <Text style={styles.reviewSummaryLabel}>Awaiting review</Text>
                <Text style={styles.reviewSummaryValue}>{pendingReviewCount}</Text>
              </View>
            </View>

            {/* Below items are hidden when collapsed */}
            <Text style={styles.unlockGrayText}>
              {canFinish
                ? 'Minimum approved requirement reached. You can finish now or keep collecting for bonus points.'
                : pendingReviewCount > 0
                  ? `${pendingReviewCount} submitted item${pendingReviewCount === 1 ? '' : 's'} still need review. You need ${Math.max(session.requiredTrashCount - approvedTrashCount, 0)} more approved item${Math.max(session.requiredTrashCount - approvedTrashCount, 0) === 1 ? '' : 's'} to finish.`
                  : `Collect ${Math.max(session.requiredTrashCount - approvedTrashCount, 0)} more approved item${Math.max(session.requiredTrashCount - approvedTrashCount, 0) === 1 ? '' : 's'} to complete the route.`}
            </Text>

            {missionProgress.length > 0 && (
              <View style={styles.missionProgressList}>
                {missionProgress.map((mission) => (
                  <View key={mission.missionId} style={styles.missionProgressItem}>
                    <View style={styles.missionProgressTextGroup}>
                      <Text style={styles.missionProgressTitle}>{mission.title}</Text>
                      <Text style={styles.missionProgressSubtitle}>
                        {mission.currentCount} / {mission.requiredCount}
                      </Text>
                    </View>
                    <Feather
                      name={mission.isCompleted ? 'check-circle' : 'circle'}
                      size={18}
                      color={mission.isCompleted ? '#16A34A' : '#D1D5DB'}
                    />
                  </View>
                ))}
              </View>
            )}

            {routeMissions.length > 0 && missionProgress.length === 0 && (
              <View style={styles.missionProgressList}>
                {routeMissions.slice(0, 3).map((mission) => (
                  <View key={mission.id} style={styles.missionProgressItem}>
                    <View style={styles.missionProgressTextGroup}>
                      <Text style={styles.missionProgressTitle}>{mission.title}</Text>
                      <Text style={styles.missionProgressSubtitle}>
                        Collect {mission.requiredTrashCount || 0} {mission.trashCategoryName || 'items'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => router.push({ pathname: '/camera', params: { id: route.id, sessionId: session.id } })}
            >
              <Feather name="camera" size={20} color="#FFFFFF" style={styles.cameraIcon} />
              <Text style={styles.addPhotoText}>Add Trash Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.finishButtonDisabled, canFinish && styles.finishButtonActive]}
              disabled={!canFinish || finishing}
              onPress={async () => {
                try {
                  setFinishing(true);
                  const response = await finishRouteSession(session.id);
                  router.replace({
                    pathname: '/route-complete',
                    params: {
                      id: route.id,
                      sessionId: response.session?.id || session.id,
                      routeName: response.session?.routeName || route.title,
                      trashCollected: String(response.session?.approvedTrashCount || 0),
                      requiredTrashCount: String(response.session?.requiredTrashCount || 0),
                      completedMissions: String(response.summary?.completedMissions || 0),
                      totalMissions: String((response.session?.missionProgress || []).length),
                      duration: route.duration,
                      basePointsEarned: String(response.summary?.basePointsEarned || 0),
                      trashPointsEarned: String(response.summary?.trashPointsEarned || 0),
                      bonusPointsEarned: String(response.summary?.bonusPointsEarned || 0),
                      achievementBonusEarned: String(response.summary?.achievementBonusEarned || 0),
                      totalPointsEarned: String(response.summary?.totalPointsEarned || 0),
                    },
                  });
                } catch (error) {
                  console.log('Error finishing route session:', error);
                } finally {
                  setFinishing(false);
                }
              }}
            >
              <Text style={[styles.finishButtonTextDisabled, canFinish && styles.finishButtonTextActive]}>
                {finishing ? 'Finishing...' : 'Finish Route'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyStateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  userLocationOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  standardMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  topOverlays: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftPills: {
    flex: 1,
  },
  distancePillLarge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'baseline',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  distanceIcon: {
    marginRight: 8,
    alignSelf: 'center',
  },
  distanceTextNumber: {
    color: '#16A34A',
    fontSize: 22,
    fontWeight: 'bold',
  },
  distanceTextUnit: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
  },
  quitIconButton: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 50,
    zIndex: 100,
  },
  dragArea: {
    width: '100%',
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  sheetContentWrapper: {
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  sheetSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  largeCount: {
    color: '#111827',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 56,
  },
  subCount: {
    color: '#9CA3AF',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '600',
  },
  pointsTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pointsNumberText: {
    color: '#16A34A',
    fontSize: 24,
    fontWeight: '900',
  },
  pointsUnitText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    position: 'relative',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  progressLabelActive: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewSummaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  reviewSummaryCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  reviewSummaryLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  reviewSummaryValue: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
  },
  unlockGrayText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  missionProgressList: {
    backgroundColor: '#F9FAFB',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  missionProgressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionProgressTextGroup: {
    flex: 1,
    marginRight: spacing.md,
  },
  missionProgressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  missionProgressSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  addPhotoButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraIcon: {
    marginRight: 10,
  },
  addPhotoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finishButtonDisabled: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  finishButtonActive: {
    backgroundColor: '#14532D',
  },
  finishButtonTextDisabled: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finishButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 60,
    zIndex: 150,
  }
});
