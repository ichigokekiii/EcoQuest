import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import Card from '../../src/components/Card';
import { colors, spacing, radius } from '../../src/constants/theme';
import { getDashboard } from '../../src/services/api';

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 18) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

function getDisplayName(profile) {
  if (!profile?.fullName) {
    return 'Eco Hero';
  }

  return profile.fullName.split(' ')[0];
}

export default function HomeDashboardScreen() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await getDashboard();
      setDashboard(response);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load your dashboard right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const profile = dashboard?.profile || {};
  const stats = dashboard?.stats || {};
  const nearbyRoutes = dashboard?.nearbyRoutes || [];
  const activeMission = dashboard?.activeMission || null;
  const activeSession = dashboard?.activeSession || null;
  const recentSessions = dashboard?.recentSessions || [];

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
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.userName}>{getDisplayName(profile)}</Text>
              </View>
              <TouchableOpacity style={styles.bellButton} onPress={loadDashboard}>
                <Feather name="refresh-cw" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.pointsCard}>
              <View style={styles.pointsHeaderRow}>
                <View>
                  <Text style={styles.pointsLabel}>Total Points</Text>
                  <Text style={styles.pointsValue}>
                    {Number(stats.points || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>Lv. {profile.level || 1}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Feather name="trash-2" size={20} color="#FFFFFF" style={styles.statIcon} />
                  <Text style={styles.statValue}>
                    {Number(stats.totalTrashCollected || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Approved</Text>
                </View>
                <View style={styles.statBox}>
                  <Feather name="map" size={20} color="#FFFFFF" style={styles.statIcon} />
                  <Text style={styles.statValue}>{Number(stats.routesCompleted || 0)}</Text>
                  <Text style={styles.statLabel}>Routes</Text>
                </View>
                <View style={styles.statBox}>
                  <Feather name="target" size={20} color="#FFFFFF" style={styles.statIcon} />
                  <Text style={styles.statValue}>{Number(stats.missionsCompleted || 0)}</Text>
                  <Text style={styles.statLabel}>Missions</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.bodySection}>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Card style={styles.activeMissionCard}>
            <View style={styles.missionHeader}>
              <View style={styles.missionIconWrapper}>
                <Feather
                  name={activeSession ? 'map-pin' : 'target'}
                  size={24}
                  color={activeSession ? colors.primary : colors.warning}
                />
              </View>
              <View style={styles.missionTextContent}>
                <Text style={styles.missionTitle}>
                  {activeSession ? 'Active Route Session' : 'Active Mission'}
                </Text>
                <Text style={styles.missionSubtitle}>
                  {activeSession
                    ? `${activeSession.routeName || 'Cleanup Route'} · ${activeSession.approvedTrashCount || 0}/${activeSession.requiredTrashCount || 0} approved`
                    : activeMission?.title || 'No active mission yet'}
                </Text>
              </View>
              <Text style={styles.missionProgressText}>
                {activeSession
                  ? `${activeSession.trashCollected || 0} submitted`
                  : `${activeMission?.currentCount || 0} / ${activeMission?.requiredCount || 0}`}
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${
                      activeSession
                        ? Math.min(
                            ((activeSession.approvedTrashCount || 0) /
                              Math.max(
                                activeSession.visualMaxGoal ||
                                  activeSession.requiredTrashCount ||
                                  1,
                                1
                              )) *
                              100,
                            100
                          )
                        : Math.min(
                            ((activeMission?.currentCount || 0) /
                              Math.max(activeMission?.requiredCount || 1, 1)) *
                              100,
                            100
                          )
                    }%`,
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.inlineActionButton}
              onPress={() =>
                activeSession
                  ? router.push({
                      pathname: '/active-route',
                      params: {
                        id: activeSession.routeId,
                        sessionId: activeSession.id,
                      },
                    })
                  : router.replace('/(tabs)/map')
              }
            >
              <Text style={styles.inlineActionText}>
                {activeSession ? 'Resume Route' : 'Find a Route'}
              </Text>
            </TouchableOpacity>
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Routes</Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/map')}>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>

          {nearbyRoutes.length === 0 ? (
            <Card>
              <Text style={styles.emptyStateText}>No active routes are available yet.</Text>
            </Card>
          ) : (
            nearbyRoutes.slice(0, 3).map((route) => (
              <Card key={route.id} style={styles.routeCard}>
                <View style={styles.routeHeaderRow}>
                  <Text style={styles.routeTitle}>{route.title}</Text>
                  <View style={styles.badgeEasy}>
                    <Text style={styles.badgeEasyText}>
                      {route.difficulty ? route.difficulty[0].toUpperCase() + route.difficulty.slice(1) : 'Easy'}
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
                    <Text style={styles.routeStatText}>Goal {route.targetTrash || 0}</Text>
                  </View>
                </View>

                <View style={styles.routeFooterRow}>
                  <View style={styles.pointsEarned}>
                    <Feather name="zap" size={16} color="#16A34A" />
                    <Text style={styles.pointsEarnedText}>+{route.points || 0} pts</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => router.push({ pathname: '/route-details', params: { id: route.id } })}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}

          {recentSessions.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Routes</Text>
              </View>
              <Card style={styles.historyCard}>
                {recentSessions.map((session) => (
                  <View key={session.id} style={styles.historyRow}>
                    <View>
                      <Text style={styles.historyTitle}>{session.routeName || 'Cleanup Route'}</Text>
                      <Text style={styles.historySubtitle}>
                        {session.approvedTrashCount || 0} approved · +{session.totalPointsEarned || 0} pts
                      </Text>
                    </View>
                    <Feather name="check-circle" size={18} color={colors.primary} />
                  </View>
                ))}
              </Card>
            </>
          ) : null}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 8,
    borderRadius: 16,
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#DCFCE7',
    fontSize: 12,
    marginTop: 2,
  },
  bodySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  activeMissionCard: {
    gap: spacing.md,
  },
  missionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  missionTextContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  missionSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  missionProgressText: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 13,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 999,
  },
  inlineActionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  inlineActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  sectionAction: {
    color: '#16A34A',
    fontWeight: '700',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  routeCard: {
    gap: spacing.md,
  },
  routeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: spacing.sm,
  },
  badgeEasy: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeEasyText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  routeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeLocationText: {
    color: '#6B7280',
    marginLeft: 6,
    fontSize: 13,
  },
  routeStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatText: {
    color: '#374151',
    marginLeft: 6,
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
  },
  pointsEarnedText: {
    color: '#16A34A',
    fontWeight: '800',
    marginLeft: 6,
  },
  viewDetailsButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  historyCard: {
    gap: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  historySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
