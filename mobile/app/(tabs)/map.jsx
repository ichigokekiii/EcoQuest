import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, radius } from '../../src/constants/theme';
import RouteListCard from '../../src/components/RouteListCard';
import { getNearbyRoutes } from '../../src/services/api';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.8;
const CARD_MARGIN = spacing.sm;

function getDifficultyLabel(difficulty) {
  if (!difficulty) return 'Easy';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
}

export default function MapScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('All Routes');
  const visibleRoutes =
    activeFilter === 'All Routes'
      ? routes
      : routes.filter((route) => getDifficultyLabel(route.difficulty) === activeFilter);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await getNearbyRoutes();
      setRoutes(data.routes || []);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching routes:', error);
      setLoading(false);
    }
  };

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
        {visibleRoutes.map((route) => (
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
            {visibleRoutes.map((route) => (
              <RouteListCard
                key={route.id}
                onPress={() => router.push({ pathname: '/route-details', params: { id: route.id } })}
                route={route}
                style={styles.routeCard}
              />
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
    marginBottom: spacing.xs,
  },
});
