import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import axios from 'axios';
import { colors, spacing, radius } from '../src/constants/theme';
import Card from '../src/components/Card';

const { width, height } = Dimensions.get('window');
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

export default function RouteDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchRouteDetails();
  }, [id]);

  const fetchRouteDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/routes/${id}`);
      setRoute(response.data);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching route details:', error);
      setLoading(false);
    }
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
          <Polyline
            coordinates={route.coordinates}
            strokeColor="#16A34A"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
            lineCap="round"
            lineJoin="round"
          />
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

        {/* Floating Badges */}
        <View style={[styles.easyBadge, route.difficulty === 'Medium' && styles.mediumBadge, route.difficulty === 'Hard' && styles.hardBadge]}>
          <Text style={[styles.easyBadgeText, route.difficulty === 'Medium' && styles.mediumBadgeText, route.difficulty === 'Hard' && styles.hardBadgeText]}>{route.difficulty}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceBadgeText}>{route.distance}</Text>
        </View>
      </View>

      {/* Bottom Sheet Content */}
      <ScrollView
        style={styles.sheetContainer}
        contentContainerStyle={styles.sheetContent}
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
        <Card style={styles.trashGoalCard}>
          <View style={styles.trashGoalHeader}>
            <Text style={styles.trashGoalLabel}>Goal target</Text>
            <Text style={styles.trashGoalTarget}>{route.targetTrash} items</Text>
          </View>
          <View style={styles.goalProgressBarBg}>
            <View style={[styles.goalProgressBarFill, { width: '50%' }]} />
          </View>
          <View style={styles.goalProgressLabels}>
            <Text style={styles.goalProgressSubtext}>0</Text>
            <Text style={styles.goalProgressActive}>Goal: {route.targetTrash}</Text>
          </View>
        </Card>

        {/* Available Missions */}
        <Text style={styles.sectionTitle}>Available Missions</Text>
        <Card style={styles.missionCard}>
          <View style={styles.missionHeaderRow}>
            <View style={styles.iconCircleLight}>
              <Feather name="target" size={20} color="#16A34A" />
            </View>
            <View style={styles.cardTextContent}>
              <Text style={styles.missionTitle}>Plastic Patrol</Text>
              <Text style={styles.missionSubtitle}>Collect 5 plastic bottles</Text>
            </View>
            <View style={styles.pointsWrapper}>
              <Feather name="zap" size={14} color="#16A34A" />
              <Text style={styles.pointsText}>+50</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomActionContainer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push({ pathname: '/active-route', params: { id: route.id } })}
        >
          <Text style={styles.startButtonText}>Start Route</Text>
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
    height: height * 0.4,
    position: 'relative',
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
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
  },
  sheetContent: {
    padding: spacing.xl,
    paddingBottom: 100,
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
  trashGoalCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  trashGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  trashGoalLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  trashGoalTarget: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  goalProgressBarBg: {
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  goalProgressBarFill: {
    height: 8,
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  goalProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalProgressSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  goalProgressActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  missionCard: {
    marginBottom: spacing.lg,
  },
  missionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleLight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTextContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  missionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  pointsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    marginLeft: 2,
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
