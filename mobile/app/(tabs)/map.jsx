import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { radius, spacing } from '../../src/constants/theme';
import Card from '../../src/components/Card';
import { getActiveRouteSession, getNearbyRoutes } from '../../src/services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_MARGIN = spacing.sm;

export default function MapScreen() {
  const [routes, setRoutes] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Routes');
  const mapRef = useRef(null);
  const router = useRouter();

  const loadMapData = useCallback(async () => {
    try {
      const [routesResponse, sessionResponse] = await Promise.all([
        getNearbyRoutes(),
        getActiveRouteSession(),
      ]);

      const nextRoutes = routesResponse.routes || [];

      setRoutes(nextRoutes);
      setActiveSession(sessionResponse.session || null);

      if (nextRoutes[0]?.coordinates?.length && mapRef.current) {
        const firstPoint = nextRoutes[0].coordinates[0];

        mapRef.current.animateToRegion(
          {
            latitude: firstPoint.latitude,
            longitude: firstPoint.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    } catch (error) {
      Alert.alert('Backend unavailable', 'Unable to load route data right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMapData();
    }, [loadMapData])
  );

  const filteredRoutes = useMemo(() => {
    if (activeFilter === 'All Routes') {
      return routes;
    }

    return routes.filter((route) => route.difficulty === activeFilter);
  }, [activeFilter, routes]);

  const initialRegion = {
    latitude: 14.6096,
    longitude: 120.9904,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  const centerMap = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  };

  const handleRouteAction = async (route) => {
    if (activeSession?.routeId === route.id) {
      router.push({ pathname: '/active-route', params: { id: route.id } });
      return;
    }

    if (activeSession) {
      return;
    }

    router.push({ pathname: '/route-details', params: { id: route.id } });
  };

  const getRouteActionLabel = (route) => {
    if (activeSession?.routeId === route.id) {
      return 'Open Route';
    }

    if (activeSession) {
      return 'Route Busy';
    }

    return 'View Details';
  };

  const isActionDisabled = (route) =>
    Boolean(activeSession && activeSession.routeId !== route.id);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsCompass={false}
      >
        {filteredRoutes.map((route) => (
          <React.Fragment key={route.id}>
            <Polyline
              coordinates={route.coordinates}
              strokeColor="#16A34A"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
            {route.markers.map((marker) => (
              <Marker key={marker.id} coordinate={marker.coordinate} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[styles.customMarker, { backgroundColor: marker.color }]}>
                  <Feather name="leaf" size={16} color="#FFFFFF" />
                </View>
                {marker.type === 'start' ? (
                  <View style={styles.markerLabelContainer}>
                    <Text style={styles.markerLabel}>{route.title.split(' ')[0]}</Text>
                  </View>
                ) : null}
              </Marker>
            ))}
          </React.Fragment>
        ))}
      </MapView>

      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.topContainer}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cleanup routes..."
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.filterButton}>
              <Feather name="filter" size={18} color="#16A34A" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.recenterButton} onPress={centerMap}>
            <Feather name="crosshair" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection} pointerEvents="box-none">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
            style={styles.filterScroll}
          >
            <View style={styles.filterPillsContainer}>
              {['All Routes', 'Easy', 'Medium', 'Hard'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    activeFilter === filter && styles.filterPillActive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Feather
                    name={
                      filter === 'All Routes'
                        ? 'map'
                        : filter === 'Easy'
                          ? 'wind'
                          : filter === 'Medium'
                            ? 'target'
                            : 'zap'
                    }
                    size={14}
                    color={activeFilter === filter ? '#FFFFFF' : '#6B7280'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.filterPillText,
                      activeFilter === filter && styles.filterPillTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
            decelerationRate="fast"
            contentContainerStyle={styles.cardsScrollContent}
          >
            {filteredRoutes.map((route) => (
              <Card key={route.id} style={styles.routeCard}>
                <View style={styles.routeHeaderRow}>
                  <Text style={styles.routeTitle}>{route.title}</Text>
                  <View
                    style={[
                      styles.badge,
                      route.difficulty === 'Easy' ? styles.badgeEasy : styles.badgeMedium,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        route.difficulty === 'Easy'
                          ? styles.badgeTextEasy
                          : styles.badgeTextMedium,
                      ]}
                    >
                      {route.difficulty}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeLocationRow}>
                  <Feather name="map-pin" size={14} color="#9CA3AF" />
                  <Text style={styles.routeLocationText}>{route.locationName}</Text>
                </View>

                <View style={styles.routeStatsRow}>
                  <View style={styles.routeStat}>
                    <Feather name="map" size={14} color="#9CA3AF" />
                    <Text style={styles.routeStatText}>{route.distance}</Text>
                  </View>
                  <View style={styles.routeStat}>
                    <Feather name="clock" size={14} color="#9CA3AF" />
                    <Text style={styles.routeStatText}>{route.duration}</Text>
                  </View>
                  <View style={styles.routeStat}>
                    <Feather name="trash-2" size={14} color="#9CA3AF" />
                    <Text style={styles.routeStatText}>{route.minTrash}</Text>
                  </View>
                </View>

                <View style={styles.routeFooterRow}>
                  <View style={styles.pointsEarned}>
                    <Feather name="zap" size={16} color="#16A34A" />
                    <Text style={styles.pointsEarnedText}>+{route.points} pts</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.viewDetailsButton,
                      isActionDisabled(route) && styles.viewDetailsButtonDisabled,
                    ]}
                    disabled={isActionDisabled(route)}
                    onPress={() => handleRouteAction(route)}
                  >
                    <Text
                      style={[
                        styles.viewDetailsText,
                        isActionDisabled(route) && styles.viewDetailsTextDisabled,
                      ]}
                    >
                      {getRouteActionLabel(route)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingChip}>
            <Text style={styles.loadingChipText}>Loading backend routes...</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginRight: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomSection: {
    paddingBottom: spacing.lg,
  },
  filterScroll: {
    maxHeight: 56,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.md,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  filterPillActive: {
    backgroundColor: '#16A34A',
  },
  filterPillText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  cardsScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  routeCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    gap: spacing.sm,
  },
  routeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  routeTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeEasy: {
    backgroundColor: '#DCFCE7',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextEasy: {
    color: '#15803D',
  },
  badgeTextMedium: {
    color: '#B45309',
  },
  routeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  routeLocationText: {
    color: '#6B7280',
    fontSize: 14,
  },
  routeStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  routeStatText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  },
  routeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsEarnedText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '800',
  },
  viewDetailsButton: {
    backgroundColor: '#14532D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  viewDetailsButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  viewDetailsTextDisabled: {
    color: '#9CA3AF',
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  markerLabelContainer: {
    marginTop: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  markerLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  loadingChip: {
    alignSelf: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: spacing.md,
  },
  loadingChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
