import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { colors, spacing, radius } from '../src/constants/theme';
import Card from '../src/components/Card';
import RouteCaptureProgress from '../src/components/RouteCaptureProgress';
import RouteMissionProgressRow from '../src/components/RouteMissionProgressRow';
import { cancelRouteSession, getActiveRouteSession, getRouteById, getRouteMissions, startRouteSession } from '../src/services/api';

const { width, height } = Dimensions.get('window');

const GOOGLE_DIRECTIONS_APIKEY =
  process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_API_KEY ||
  (Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
    : process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY);

function getDifficultyLabel(difficulty) {
  if (!difficulty) return 'Easy';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
}

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
    visualMaxGoal:
      route.visualMaxGoal || route.targetTrash || route.minimumTrashRequired || 0,
  };
}

export default function RouteDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState([]);
  const [selectedMissionIds, setSelectedMissionIds] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [starting, setStarting] = useState(false);

  const SNAP_TOP = 0;
  const SNAP_BOTTOM = height * 0.4; // Expose more of the map

  const translateY = useSharedValue(SNAP_BOTTOM);
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
      translateY.value = withSpring(targetY, { damping: 20, stiffness: 250, mass: 0.5 });
    });

  const bottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: Math.max(translateY.value, -10) }]
    };
  });

  useEffect(() => {
    if (id) fetchRouteDetails();
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      const [routeResponse, missionResponse] = await Promise.all([
        getRouteById(id),
        getRouteMissions(id),
      ]);

      setRoute(normalizeRoute(routeResponse.route || routeResponse));
      setMissions(missionResponse.missions || []);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching route details:', error);
      setLoading(false);
    }
  };

  const openActiveRoute = (nextRouteId, nextSessionId) => {
    router.push({
      pathname: '/active-route',
      params: { id: nextRouteId, sessionId: nextSessionId },
    });
  };

  const toggleMissionSelection = (missionId) => {
    setSelectedMissionIds((current) =>
      current.includes(missionId)
        ? current.filter((id) => id !== missionId)
        : [...current, missionId]
    );
  };

  const beginRouteSession = async (missionIds) => {
    const response = await startRouteSession(route.id, { missionIds });
    openActiveRoute(route.id, response.session?.id);
  };

  const handleStartRoute = async () => {
    const missionIds = [...selectedMissionIds];

    const startSession = async () => {
      try {
        setStarting(true);
        await beginRouteSession(missionIds);
      } catch (error) {
        console.log('Error starting route session:', error);

        if (error.response?.status === 409) {
          const existingSession =
            error.response?.data?.session || (await getActiveRouteSession()).session;

          if (!existingSession?.id) {
            Alert.alert('Active route found', 'Unable to load your active route session. Please try again.');
            return;
          }

          const isSameRoute = existingSession.routeId === route.id;
          const routeLabel = existingSession.routeName || 'another route';

          Alert.alert(
            'Active route in progress',
            isSameRoute
              ? `You already have an active session on this route (${existingSession.approvedTrashCount || 0} captured, ${existingSession.trashCollected || 0} submitted).`
              : `You already have an active session on "${routeLabel}" (${existingSession.approvedTrashCount || 0} captured, ${existingSession.trashCollected || 0} submitted).`,
            [
              { text: 'Not now', style: 'cancel' },
              {
                text: 'Resume',
                onPress: () => openActiveRoute(existingSession.routeId || route.id, existingSession.id),
              },
              {
                text: isSameRoute ? 'Restart Route' : 'End & Start Here',
                style: 'destructive',
                onPress: async () => {
                  try {
                    setStarting(true);
                    await cancelRouteSession(existingSession.id);
                    await beginRouteSession(missionIds);
                  } catch (restartError) {
                    console.log('Error restarting route session:', restartError);
                    Alert.alert(
                      'Unable to start route',
                      restartError.response?.data?.message || 'Please try again in a moment.'
                    );
                  } finally {
                    setStarting(false);
                  }
                },
              },
            ]
          );
          return;
        }

        Alert.alert(
          'Unable to start route',
          error.response?.data?.message || 'Please try again in a moment.'
        );
      } finally {
        setStarting(false);
      }
    };

    if (missions.length > 0 && missionIds.length === 0) {
      Alert.alert(
        'No missions selected',
        'You can start without missions, or select optional missions now to earn bonus points along the route.',
        [
          { text: 'Choose Missions', style: 'cancel' },
          { text: 'Start Anyway', onPress: startSession },
        ]
      );
      return;
    }

    await startSession();
  };

  if (loading || !route) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={route.centerRegion}
          showsCompass={false}
          showsUserLocation={false}
          scrollEnabled={true}
          zoomEnabled={true}
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
                strokeColor="#22c55e"
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
          {route.markers.map(marker => (
            <Marker key={marker.id} coordinate={marker.coordinate}>
              <View style={marker.type === 'start' ? styles.startMarker : marker.type === 'checkpoint' ? styles.checkpointMarker : styles.endMarker} />
            </Marker>
          ))}
        </MapView>

        {/* Map Overlays */}
        <SafeAreaView edges={['top']} style={styles.mapOverlays}>
          <View style={styles.mapHeaderRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="heart" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Bottom Sheet Content */}
      <Animated.View style={[styles.sheetContainer, bottomSheetStyle]}>
        <GestureDetector gesture={gesture}>
          <View style={styles.dragArea}>
            <View style={styles.sheetHandle} />
          </View>
        </GestureDetector>

        <ScrollView
          contentContainerStyle={[styles.sheetContent, { paddingBottom: 150 + SNAP_BOTTOM }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text style={styles.title}>{route.title}</Text>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={16} color="#9CA3AF" />
          <Text style={styles.locationText}>{route.locationName}</Text>
        </View>

        {/* 3 Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Feather name="git-branch" size={18} color="#6B7280" style={styles.statIcon} />
            <Text style={styles.statValue}>{route.distance}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statBox}>
            <Feather name="clock" size={18} color="#6B7280" style={styles.statIcon} />
            <Text style={styles.statValue}>{route.duration}</Text>
            <Text style={styles.statLabel}>Est. Time</Text>
          </View>
          <View style={styles.statBox}>
            <Feather name="star" size={18} color="#6B7280" style={styles.statIcon} />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <Text style={styles.description}>
          {route.description}
        </Text>

        {/* Trash Goal */}
        <Text style={styles.sectionTitle}>Trash Goal</Text>
        <RouteCaptureProgress
          capturedCount={0}
          pointsPreview={0}
          visualProgressTarget={
            route.visualMaxGoal || route.targetTrash || route.minimumTrashRequired || 0
          }
        />

        {/* Available Missions */}
        <Text style={styles.sectionTitle}>Optional Missions</Text>
        <Text style={styles.sectionHint}>
          Tap missions to include them before starting. Selected missions track progress with mini bars during your route.
        </Text>
        {missions.length > 0 ? (
          missions.map((mission) => {
            const missionId = mission.id || mission.missionId;
            const isSelected = selectedMissionIds.includes(missionId);

            return (
              <Card
                key={missionId}
                style={[styles.missionCard, isSelected && styles.missionCardSelected]}
              >
                <RouteMissionProgressRow
                  title={mission.title}
                  currentCount={0}
                  requiredCount={mission.requiredTrashCount || mission.requiredCount || 0}
                  trashCategoryName={mission.trashCategoryName}
                  pointsReward={mission.pointsReward || 0}
                  selectable
                  selected={isSelected}
                  onPress={() => toggleMissionSelection(missionId)}
                />
              </Card>
            );
          })
        ) : (
          <Card style={styles.missionCard}>
            <Text style={styles.emptyMissionsText}>No active missions are linked to this route yet.</Text>
          </Card>
        )}
        </ScrollView>
      </Animated.View>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomActionContainer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <TouchableOpacity 
          style={[styles.startButton, starting && styles.startButtonDisabled]}
          disabled={starting}
          onPress={handleStartRoute}
        >
          <Text style={styles.startButtonText}>{starting ? 'Starting...' : 'Start Route'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  startMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkpointMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D97706',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  endMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapOverlays: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  easyBadge: {
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  easyBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mediumBadge: {
    backgroundColor: '#FEF3C7',
  },
  mediumBadgeText: {
    color: '#D97706',
  },
  hardBadge: {
    backgroundColor: '#FEE2E2',
  },
  hardBadgeText: {
    color: '#EF4444',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 40,
    right: spacing.lg,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  distanceBadgeText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.85, // Takes up 85% of screen when fully expanded
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 50,
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
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 150, // Space for fixed button
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  locationText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statBox: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: spacing.md,
  },
  sectionHint: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  missionCard: {
    marginBottom: spacing.lg,
  },
  missionCardSelected: {
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  emptyMissionsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
