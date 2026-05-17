import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import axios from 'axios';
import { colors, spacing, radius } from '../../src/constants/theme';
import Card from '../../src/components/Card';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.8;
const CARD_MARGIN = spacing.sm;

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

export default function MapScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('All Routes');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/routes/nearby`);
      setRoutes(response.data.routes);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching routes:', error);
      setLoading(false);
    }
  };

  const initialRegion = {
    latitude: 37.79,
    longitude: -122.42,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const centerMap = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsCompass={false}
      >
        {routes.map((route) => (
          <React.Fragment key={route.id}>
            {/* Draw Path */}
            <Polyline
              coordinates={route.coordinates}
              strokeColor="#16A34A"
              strokeWidth={4}
              lineDashPattern={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
            {/* Draw Markers */}
            {route.markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={[styles.customMarker, { backgroundColor: marker.color }]}>
                  <Feather name="wind" size={16} color="#FFFFFF" />
                </View>
                {marker.type === 'start' && (
                  <View style={styles.markerLabelContainer}>
                    <Text style={styles.markerLabel}>{route.title.split(' ')[0]}</Text>
                  </View>
                )}
              </Marker>
            ))}
          </React.Fragment>
        ))}
      </MapView>

      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top Search Bar */}
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

        {/* Bottom Section: Filters and Cards */}
        <View style={styles.bottomSection} pointerEvents="box-none">

          {/* Floating Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
            style={styles.filterScroll}
          >
            <View style={styles.filterPillsContainer}>
              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'All Routes' && styles.filterPillActive]}
                onPress={() => setActiveFilter('All Routes')}
              >
                <Feather name="map" size={14} color={activeFilter === 'All Routes' ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 6 }} />
                <Text style={[styles.filterPillText, activeFilter === 'All Routes' && styles.filterPillTextActive]}>All Routes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'Easy' && styles.filterPillActive]}
                onPress={() => setActiveFilter('Easy')}
              >
                <Feather name="wind" size={14} color={activeFilter === 'Easy' ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 6 }} />
                <Text style={[styles.filterPillText, activeFilter === 'Easy' && styles.filterPillTextActive]}>Easy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'Medium' && styles.filterPillActive]}
                onPress={() => setActiveFilter('Medium')}
              >
                <Feather name="target" size={14} color={activeFilter === 'Medium' ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 6 }} />
                <Text style={[styles.filterPillText, activeFilter === 'Medium' && styles.filterPillTextActive]}>Medium</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeFilter === 'Hard' && styles.filterPillActive]}
                onPress={() => setActiveFilter('Hard')}
              >
                <Feather name="zap" size={14} color={activeFilter === 'Hard' ? '#FFFFFF' : '#6B7280'} style={{ marginRight: 6 }} />
                <Text style={[styles.filterPillText, activeFilter === 'Hard' && styles.filterPillTextActive]}>Hard</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Horizontal Route Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
            decelerationRate="fast"
            contentContainerStyle={styles.cardsScrollContent}
          >
            {routes.map((route) => (
              <Card key={route.id} style={styles.routeCard}>
                <View style={styles.routeHeaderRow}>
                  <Text style={styles.routeTitle}>{route.title}</Text>
                  <View style={[
                    styles.badge,
                    route.difficulty === 'Easy' ? styles.badgeEasy : styles.badgeMedium
                  ]}>
                    <Text style={[
                      styles.badgeText,
                      route.difficulty === 'Easy' ? styles.badgeTextEasy : styles.badgeTextMedium
                    ]}>{route.difficulty}</Text>
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
                  <View style={styles.routeStatItem}>
                    <Feather name="trash-2" size={14} color="#6B7280" style={styles.routeStatIcon} />
                    <Text style={styles.routeStatText}>Goal: {route.targetTrash}</Text>
                  </View>
                </View>

                <View style={styles.routeFooterRow}>
                  <View style={styles.pointsEarned}>
                    <Feather name="zap" size={16} color="#16A34A" />
                    <Text style={styles.pointsEarnedText}>+{route.points} pts</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => router.push({ pathname: '/route-details', params: { id: route.id } })}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>
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
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  recenterButton: {
    width: 52,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerLabelContainer: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  markerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  bottomSection: {
    paddingBottom: spacing.sm,
  },
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.md,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  filterPillActive: {
    backgroundColor: '#14532D', // Dark green for active state per mockup
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  cardsScrollContent: {
    paddingHorizontal: spacing.xs,
  },
  routeCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    marginBottom: spacing.xs, // Shadow clearance
    borderWidth: 2,
    borderColor: 'transparent', // The active one is green in mock, setting up foundation
  },
  routeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEasy: {
    backgroundColor: '#DCFCE7',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextEasy: {
    color: '#16A34A',
  },
  badgeTextMedium: {
    color: '#D97706',
  },
  routeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  routeLocationText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 6,
  },
  routeStatsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  routeStatText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginLeft: 6,
  },
  routeFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsEarnedText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  viewDetailsButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
