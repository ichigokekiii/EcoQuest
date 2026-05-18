import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { radius, spacing } from '../../src/constants/theme';
import Card from '../../src/components/Card';
import { getDashboard } from '../../src/services/api';

function getProgressWidth(current, target) {
  if (!target) {
    return '0%';
  }

  return `${Math.min((current / target) * 100, 100)}%`;
}

export default function HomeDashboardScreen() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setError('');
      const data = await getDashboard();
      setDashboard(data);
    } catch (loadError) {
      setError('Unable to load dashboard right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const user = dashboard?.user;
  const stats = dashboard?.stats;
  const activeSession = dashboard?.activeSession;
  const activeMission = activeSession?.missionProgress?.[0] || null;
  const nearbyRoutes = dashboard?.nearbyRoutes || [];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerSection}>
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greetingText}>{user?.greeting || 'Welcome back'}</Text>
                <Text style={styles.userName}>{user?.name || 'Eco Quest User'}</Text>
              </View>
              <TouchableOpacity style={styles.bellButton}>
                <Feather name="bell" size={20} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            <View style={styles.pointsCard}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.pointsHeaderRow}>
                    <View>
                      <Text style={styles.pointsLabel}>Total Points</Text>
                      <Text style={styles.pointsValue}>
                        {user?.points?.toLocaleString?.() || '0'}
                      </Text>
                    </View>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>Rank #{user?.rank || '--'}</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Feather name="trash-2" size={20} color="#FFFFFF" style={styles.statIcon} />
                      <Text style={styles.statValue}>{stats?.totalTrashCollected || 0}</Text>
                      <Text style={styles.statLabel}>Trash</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Feather name="map" size={20} color="#FFFFFF" style={styles.statIcon} />
                      <Text style={styles.statValue}>{stats?.routesCompleted || 0}</Text>
                      <Text style={styles.statLabel}>Routes</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Feather name="target" size={20} color="#FFFFFF" style={styles.statIcon} />
                      <Text style={styles.statValue}>{stats?.missionsCompleted || 0}</Text>
                      <Text style={styles.statLabel}>Missions</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.bodySection}>
          <Card style={styles.activeMissionCard}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {activeSession && activeMission ? (
              <>
                <View style={styles.missionHeader}>
                  <View style={styles.missionIconWrapper}>
                    <Feather name="target" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.missionTextContent}>
                    <Text style={styles.missionTitle}>Active Mission</Text>
                    <Text style={styles.missionSubtitle}>{activeMission.title}</Text>
                  </View>
                  <Text style={styles.missionProgressText}>
                    <Text style={{ color: '#16A34A' }}>{activeMission.currentCount}</Text> /{' '}
                    {activeMission.requiredCount}
                  </Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: getProgressWidth(
                          activeMission.currentCount,
                          activeMission.requiredCount
                        ),
                      },
                    ]}
                  />
                </View>
                <View style={styles.sessionFooter}>
                  <Text style={styles.sessionFooterText}>
                    Route progress: {activeSession.approvedTrashCount} /{' '}
                    {activeSession.requiredTrashCount} required
                  </Text>
                  <Text style={styles.sessionFooterText}>
                    Visual goal: {activeSession.visualMaxGoal}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.missionTitle}>No active route yet</Text>
                <Text style={styles.missionSubtitle}>
                  Start one from the Map or Missions tab to begin tracking progress.
                </Text>
              </>
            )}
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Routes</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Live from backend</Text>
            </TouchableOpacity>
          </View>

          {nearbyRoutes.map((route) => (
            <Card key={route.id} style={styles.routeCard}>
              <View style={styles.routeHeaderRow}>
                <Text style={styles.routeTitle}>{route.title}</Text>
                <View style={route.difficulty === 'Easy' ? styles.badgeEasy : styles.badgeMedium}>
                  <Text
                    style={
                      route.difficulty === 'Easy'
                        ? styles.badgeEasyText
                        : styles.badgeMediumText
                    }
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
                <Text style={styles.backendLabel}>Mock API ready</Text>
              </View>
            </Card>
          ))}
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
    paddingTop: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  greetingText: {
    color: '#86EFAC',
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
    minHeight: 196,
    justifyContent: 'center',
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
    paddingVertical: 8,
    borderRadius: 999,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.xs,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#DCFCE7',
    fontSize: 12,
    fontWeight: '600',
  },
  bodySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  activeMissionCard: {
    gap: spacing.sm,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  missionTextContent: {
    flex: 1,
  },
  missionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  missionSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  missionProgressText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 999,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sessionFooterText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionAction: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '700',
  },
  routeCard: {
    gap: spacing.sm,
  },
  routeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  badgeEasy: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeEasyText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeMediumText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
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
  backendLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
});
