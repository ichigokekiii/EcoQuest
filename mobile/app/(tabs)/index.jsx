import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import Card from '../../src/components/Card';
import RouteListCard from '../../src/components/RouteListCard';
import { colors, spacing } from '../../src/constants/theme';
import { getDashboard } from '../../src/services/api';

const QUICK_ACTIONS = [
  { id: 'map', label: 'Explore Map', icon: 'map', route: '/(tabs)/map' },
  { id: 'missions', label: 'Missions', icon: 'target', route: '/(tabs)/missions' },
  { id: 'store', label: 'Rewards', icon: 'shopping-bag', route: '/(tabs)/store' },
  { id: 'profile', label: 'Profile', icon: 'user', route: '/(tabs)/profile' },
];

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

function getInitial(profile) {
  return getDisplayName(profile).charAt(0).toUpperCase();
}

function DashboardQuickAction({ action, onPress }) {
  return (
    <TouchableOpacity style={styles.quickActionTile} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.quickActionIconWrap}>
        <Feather name={action.icon} size={22} color="#16A34A" />
      </View>
      <Text style={styles.quickActionLabel} numberOfLines={2}>
        {action.label}
      </Text>
    </TouchableOpacity>
  );
}

function StatTile({ icon, value, label }) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statTileIconWrap}>
        <Feather name={icon} size={18} color="#16A34A" />
      </View>
      <Text style={styles.statTileValue}>{value}</Text>
      <Text style={styles.statTileLabel}>{label}</Text>
    </View>
  );
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

  const activeProgressPercent = activeSession
    ? Math.min(
        ((activeSession.approvedTrashCount || 0) /
          Math.max(
            activeSession.visualMaxGoal || activeSession.requiredTrashCount || 1,
            1
          )) *
          100,
        100
      )
    : Math.min(
        ((activeMission?.currentCount || 0) / Math.max(activeMission?.requiredCount || 1, 1)) * 100,
        100
      );

  const handleHeroPress = () => {
    if (activeSession) {
      router.push({
        pathname: '/active-route',
        params: {
          id: activeSession.routeId,
          sessionId: activeSession.id,
        },
      });
      return;
    }

    router.replace('/(tabs)/map');
  };

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
              <View style={styles.greetingGroup}>
                <Text style={styles.greetingText}>Hello,</Text>
                <Text style={styles.userName}>{getDisplayName(profile)}</Text>
              </View>
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Text style={styles.avatarText}>{getInitial(profile)}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.searchBar}
              activeOpacity={0.9}
              onPress={() => router.push('/(tabs)/map')}
            >
              <Feather name="search" size={18} color="#9CA3AF" />
              <Text style={styles.searchPlaceholder}>Find a cleanup route near you...</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.bodySection}>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity style={styles.heroCard} activeOpacity={0.92} onPress={handleHeroPress}>
            {activeSession ? (
              <>
                <View style={styles.heroBadge}>
                  <Feather name="navigation" size={12} color="#FFFFFF" />
                  <Text style={styles.heroBadgeText}>Active Route</Text>
                </View>
                <Text style={styles.heroTitle}>{activeSession.routeName || 'Cleanup Route'}</Text>
                <Text style={styles.heroSubtitle}>
                  {activeSession.approvedTrashCount || 0} /{' '}
                  {activeSession.visualMaxGoal || activeSession.requiredTrashCount || 0} captured ·{' '}
                  {activeSession.trashCollected || 0} submitted
                </Text>
                <View style={styles.heroProgressBg}>
                  <View style={[styles.heroProgressFill, { width: `${activeProgressPercent}%` }]} />
                </View>
                <View style={styles.heroFooterRow}>
                  <Text style={styles.heroActionText}>Resume Route</Text>
                  <Feather name="arrow-right" size={18} color="#16A34A" />
                </View>
              </>
            ) : (
              <>
                <View style={styles.heroBadgeMuted}>
                  <Feather name="zap" size={12} color="#16A34A" />
                  <Text style={styles.heroBadgeTextMuted}>Your Impact</Text>
                </View>
                <Text style={styles.heroPointsValue}>
                  {Number(stats.points || 0).toLocaleString()}
                </Text>
                <Text style={styles.heroPointsLabel}>Total points earned</Text>
                <View style={styles.heroMetaRow}>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelPillText}>Lv. {profile.level || 1}</Text>
                  </View>
                  <Text style={styles.heroHint}>
                    {activeMission?.title
                      ? `Mission in progress: ${activeMission.title}`
                      : `${getGreeting()} — ready for your next cleanup?`}
                  </Text>
                </View>
                <View style={styles.heroFooterRow}>
                  <Text style={styles.heroActionText}>Find a Route</Text>
                  <Feather name="arrow-right" size={18} color="#16A34A" />
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.statTileRow}>
            <StatTile
              icon="trash-2"
              value={Number(stats.totalTrashCollected || 0).toLocaleString()}
              label="Captured"
            />
            <StatTile
              icon="map"
              value={Number(stats.routesCompleted || 0).toLocaleString()}
              label="Routes"
            />
            <StatTile
              icon="target"
              value={Number(stats.missionsCompleted || 0).toLocaleString()}
              label="Missions"
            />
          </View>

          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <DashboardQuickAction
                  key={action.id}
                  action={action}
                  onPress={() => router.push(action.route)}
                />
              ))}
            </View>
          </View>

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
              <RouteListCard
                key={route.id}
                onPress={() => router.push({ pathname: '/route-details', params: { id: route.id } })}
                route={route}
              />
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
                    <View style={styles.historyTextGroup}>
                      <Text style={styles.historyTitle}>{session.routeName || 'Cleanup Route'}</Text>
                      <Text style={styles.historySubtitle}>
                        {session.approvedTrashCount || 0} captured · +{session.totalPointsEarned || 0} pts
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    backgroundColor: '#14532D',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  greetingGroup: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.md,
  },
  greetingText: {
    color: '#86EFAC',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    gap: spacing.sm,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroBadgeMuted: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroBadgeTextMuted: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '500',
  },
  heroPointsValue: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: -1,
    marginTop: 2,
  },
  heroPointsLabel: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600',
  },
  heroMetaRow: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  levelPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  levelPillText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '800',
  },
  heroHint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    fontWeight: '500',
  },
  heroProgressBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 999,
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  heroActionText: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '800',
  },
  statTileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statTileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statTileValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textDark,
  },
  statTileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  quickActionsSection: {
    gap: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  quickActionTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: spacing.md,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  quickActionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textDark,
  },
  sectionAction: {
    color: '#16A34A',
    fontWeight: '700',
  },
  emptyStateText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  historyCard: {
    gap: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  historyTextGroup: {
    flex: 1,
    minWidth: 0,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  historySubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
});
