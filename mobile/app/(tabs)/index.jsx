import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../src/constants/theme';
import Card from '../../src/components/Card';

export default function HomeDashboardScreen() {
  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Section (Dark Green) */}
        <View style={styles.headerSection}>
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greetingText}>Good morning</Text>
                <Text style={styles.userName}>Alex Rivera</Text>
              </View>
              <TouchableOpacity style={styles.bellButton}>
                <Feather name="bell" size={20} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            {/* Total Points Card */}
            <View style={styles.pointsCard}>
              <View style={styles.pointsHeaderRow}>
                <View>
                  <Text style={styles.pointsLabel}>Total Points</Text>
                  <Text style={styles.pointsValue}>2,480</Text>
                </View>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>Rank #12</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Feather name="trash-2" size={20} color="#FFFFFF" style={styles.statIcon} />
                  <Text style={styles.statValue}>124</Text>
                  <Text style={styles.statLabel}>Trash</Text>
                </View>
                <View style={styles.statBox}>
                  <Feather name="map" size={20} color="#FFFFFF" style={styles.statIcon} />
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Routes</Text>
                </View>
                <View style={styles.statBox}>
                  <Feather name="target" size={20} color="#FFFFFF" style={styles.statIcon} />
                  <Text style={styles.statValue}>5</Text>
                  <Text style={styles.statLabel}>Missions</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Body Section (White) */}
        <View style={styles.bodySection}>
          
          {/* Active Mission */}
          <Card style={styles.activeMissionCard}>
            <View style={styles.missionHeader}>
              <View style={styles.missionIconWrapper}>
                <Feather name="target" size={24} color="#F59E0B" />
              </View>
              <View style={styles.missionTextContent}>
                <Text style={styles.missionTitle}>Active Mission</Text>
                <Text style={styles.missionSubtitle}>Collect 5 plastic bottles</Text>
              </View>
              <Text style={styles.missionProgressText}>
                <Text style={{color: '#16A34A'}}>3</Text> / 5
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '60%' }]} />
            </View>
          </Card>

          {/* Nearby Routes Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Routes</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Route Card 1 */}
          <Card style={styles.routeCard}>
            <View style={styles.routeHeaderRow}>
              <Text style={styles.routeTitle}>Riverside Cleanup</Text>
              <View style={styles.badgeEasy}>
                <Text style={styles.badgeEasyText}>Easy</Text>
              </View>
            </View>
            
            <View style={styles.routeLocationRow}>
              <Feather name="map-pin" size={14} color="#9CA3AF" />
              <Text style={styles.routeLocationText}>Marina District</Text>
            </View>

            <View style={styles.routeStatsRow}>
              <View style={styles.routeStat}>
                <Feather name="map" size={14} color="#9CA3AF" />
                <Text style={styles.routeStatText}>1.2 km</Text>
              </View>
              <View style={styles.routeStat}>
                <Feather name="clock" size={14} color="#9CA3AF" />
                <Text style={styles.routeStatText}>30 min</Text>
              </View>
              <View style={styles.routeStat}>
                <Feather name="trash-2" size={14} color="#9CA3AF" />
                <Text style={styles.routeStatText}>Min 10</Text>
              </View>
            </View>

            <View style={styles.routeFooterRow}>
              <View style={styles.pointsEarned}>
                <Feather name="zap" size={16} color="#16A34A" />
                <Text style={styles.pointsEarnedText}>+120 pts</Text>
              </View>
              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Route Card 2 */}
          <Card style={styles.routeCard}>
            <View style={styles.routeHeaderRow}>
              <Text style={styles.routeTitle}>Central Park Loop</Text>
              <View style={styles.badgeMedium}>
                <Text style={styles.badgeMediumText}>Medium</Text>
              </View>
            </View>
            
            <View style={styles.routeLocationRow}>
              <Feather name="map-pin" size={14} color="#9CA3AF" />
              <Text style={styles.routeLocationText}>SoMa</Text>
            </View>

            <View style={styles.routeStatsRow}>
              <View style={styles.routeStat}>
                <Feather name="map" size={14} color="#9CA3AF" />
                <Text style={styles.routeStatText}>2.5 km</Text>
              </View>
              <View style={styles.routeStat}>
                <Feather name="clock" size={14} color="#9CA3AF" />
                <Text style={styles.routeStatText}>55 min</Text>
              </View>
              <View style={styles.routeStat}>
                <Feather name="trash-2" size={14} color="#9CA3AF" />
                <Text style={styles.routeStatText}>Min 18</Text>
              </View>
            </View>

            <View style={styles.routeFooterRow}>
              <View style={styles.pointsEarned}>
                <Feather name="zap" size={16} color="#16A34A" />
                <Text style={styles.pointsEarnedText}>+250 pts</Text>
              </View>
              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </Card>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    backgroundColor: '#14532D',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  safeArea: {
    paddingTop: Platform.OS === 'android' ? spacing.md : 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  greetingText: {
    color: '#86EFAC', // Light green
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#14532D',
  },
  pointsCard: {
    backgroundColor: '#22C55E',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  pointsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  pointsLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  pointsValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
  },
  rankBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(20, 83, 45, 0.15)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  bodySection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.md, // Pull active mission card up slightly if we wanted, but mock says it's below the green section
    paddingTop: spacing.lg,
  },
  activeMissionCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  missionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7', // Light amber background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  missionTextContent: {
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
    color: '#6B7280',
  },
  missionProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    width: '100%',
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  routeCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
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
  badgeEasy: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeEasyText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeMediumText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: 'bold',
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
    backgroundColor: '#111827', // Dark navy
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
