import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import Card from '../../src/components/Card';
import { colors, spacing, radius } from '../../src/constants/theme';
import { getProfileData } from '../../src/services/api';

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatTimestamp(value) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(value) {
  return (value || 'Eco Quest')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getHandle(profile) {
  const username = profile?.username || profile?.email?.split('@')[0] || profile?.id?.slice(0, 8) || 'eco-user';
  return `@${username}`;
}

function buildActivityItems(profileData) {
  const sessionItems = (profileData?.recentSessions || []).map((session) => ({
    id: `session-${session.id}`,
    title: session.routeName || 'Completed route',
    subtitle: `${Number(session.approvedTrashCount || 0)} approved · ${Number(session.trashCollected || 0)} submitted`,
    meta: formatTimestamp(session.completedAt || session.updatedAt || session.createdAt),
    sortValue: session.completedAt || session.updatedAt || session.createdAt || '',
    icon: 'map',
  }));

  const submissionItems = (profileData?.recentSubmissions || []).map((submission) => ({
    id: `submission-${submission.id}`,
    title: submission.finalCategoryName || submission.trashCategoryName || 'Trash submission',
    subtitle: `${Number(submission.quantity || 1)} item${Number(submission.quantity || 1) === 1 ? '' : 's'} · ${submission.status || 'pending'}`,
    meta: formatTimestamp(submission.createdAt || submission.updatedAt),
    sortValue: submission.createdAt || submission.updatedAt || '',
    icon: 'camera',
  }));

  return [...sessionItems, ...submissionItems]
    .sort((first, second) => new Date(second.sortValue || 0) - new Date(first.sortValue || 0))
    .slice(0, 8);
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Activity');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await getProfileData();
      setProfileData(response);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load your profile right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const profile = profileData?.profile || {};
  const stats = profileData?.stats || {};
  const achievements = profileData?.achievementsSummary || [];
  const recentRedemptions = profileData?.recentRedemptions || [];
  const recentSubmissions = profileData?.recentSubmissions || [];
  const activityItems = useMemo(() => buildActivityItems(profileData), [profileData]);

  const statsData = [
    { id: 'points', title: 'Total Points', value: formatNumber(stats.points), icon: 'zap' },
    { id: 'trash', title: 'Trash Collected', value: formatNumber(stats.totalTrashCollected), icon: 'trash-2' },
    { id: 'routes', title: 'Routes Done', value: formatNumber(stats.routesCompleted), icon: 'map' },
    { id: 'missions', title: 'Missions Done', value: formatNumber(stats.missionsCompleted), icon: 'target' },
  ];

  const visibleItems =
    activeTab === 'Rewards'
      ? recentRedemptions.map((redemption) => ({
          id: redemption.id,
          title: redemption.rewardName || 'Reward redemption',
          subtitle: `${formatNumber(redemption.pointsCost)} pts · ${redemption.status || 'pending'}`,
          meta: formatTimestamp(redemption.redeemedAt || redemption.createdAt || redemption.updatedAt),
          icon: 'gift',
        }))
      : activeTab === 'Submissions'
        ? recentSubmissions.map((submission) => ({
            id: submission.id,
            title: submission.finalCategoryName || submission.trashCategoryName || 'Trash submission',
            subtitle: `${Number(submission.quantity || 1)} item${Number(submission.quantity || 1) === 1 ? '' : 's'} · ${submission.status || 'pending'}`,
            meta: formatTimestamp(submission.createdAt || submission.updatedAt),
            icon: 'camera',
          }))
        : activityItems;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconCircle}>
            <Feather name="user" size={18} color="#16A34A" />
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </View>

      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Activity' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Activity')}
        >
          <Text style={[styles.tabText, activeTab === 'Activity' && styles.tabTextActive]}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Submissions' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Submissions')}
        >
          <Text style={[styles.tabText, activeTab === 'Submissions' && styles.tabTextActive]}>Submissions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Rewards' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Rewards')}
        >
          <Text style={[styles.tabText, activeTab === 'Rewards' && styles.tabTextActive]}>Rewards</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#16A34A" />
          </View>
        ) : (
          <>
            <Card style={styles.userInfoCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{getInitials(profile.fullName || profile.username || profile.email)}</Text>
                </View>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Lv.{profile.level || 1}</Text>
                </View>
              </View>

              <View style={styles.userDetails}>
                <Text style={styles.userName}>{profile.fullName || 'Eco Quest User'}</Text>
                <Text style={styles.userHandle}>{getHandle(profile)}</Text>
                <View style={styles.userTagsRow}>
                  <View style={styles.guardianPill}>
                    <Text style={styles.guardianPillText}>{profile.status || 'active'}</Text>
                  </View>
                  <Text style={styles.rankText}>{profile.role || 'user'}</Text>
                </View>
              </View>
            </Card>

            <View style={styles.statsGrid}>
              {statsData.map((stat) => (
                <Card key={stat.id} style={styles.statCard}>
                  <Feather name={stat.icon} size={20} color="#9CA3AF" style={styles.statIcon} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </Card>
              ))}
            </View>

            <Card style={styles.achievementsCard}>
              <View style={styles.achievementsHeader}>
                <Text style={styles.achievementsTitle}>Verified Progress</Text>
                <Text style={styles.viewAllText}>{achievements.length} live stats</Text>
              </View>

              <View style={styles.achievementsGrid}>
                {achievements.map((item) => (
                  <View key={item.id} style={styles.achievementItem}>
                    <View style={styles.achievementCircle}>
                      <Feather name={item.icon} size={20} color="#374151" />
                    </View>
                    <Text style={styles.achievementValue}>{formatNumber(item.value)}</Text>
                    <Text style={styles.achievementText}>{item.title}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.activityCard}>
              <View style={styles.achievementsHeader}>
                <Text style={styles.achievementsTitle}>
                  {activeTab === 'Rewards'
                    ? 'Recent Redemptions'
                    : activeTab === 'Submissions'
                      ? 'Recent Submissions'
                      : 'Recent Activity'}
                </Text>
                <Text style={styles.viewAllText}>{visibleItems.length} items</Text>
              </View>

              {visibleItems.length === 0 ? (
                <Text style={styles.emptyStateText}>No live data for this section yet.</Text>
              ) : (
                visibleItems.map((item) => (
                  <View key={item.id} style={styles.activityRow}>
                    <View style={styles.activityIconCircle}>
                      <Feather name={item.icon} size={18} color="#16A34A" />
                    </View>
                    <View style={styles.activityTextGroup}>
                      <Text style={styles.activityTitle}>{item.title}</Text>
                      <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                    </View>
                    <Text style={styles.activityMeta}>{item.meta}</Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  tabSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: spacing.lg,
  },
  tabButton: {
    paddingVertical: spacing.sm,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#111827',
  },
  mainScrollView: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#14532D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guardianPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  guardianPillText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  rankText: {
    color: '#9CA3AF',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statCard: {
    width: '48%',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  achievementsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  achievementCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  activityCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityTextGroup: {
    flex: 1,
    marginRight: spacing.sm,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  activityMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
});
