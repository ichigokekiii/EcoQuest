import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import Card from '../../src/components/Card';
import { spacing, radius } from '../../src/constants/theme';
import { getMissionsData } from '../../src/services/api';

const tabs = ['Active', 'Completed', 'All'];

function getProgressPercent(mission) {
  if (!mission?.target) {
    return 0;
  }

  return Math.min(((mission.current || 0) / mission.target) * 100, 100);
}

export default function MissionsScreen() {
  const [activeTab, setActiveTab] = useState('Active');
  const [missionsData, setMissionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadMissions = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await getMissionsData();
      setMissionsData(response);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load missions right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, [loadMissions])
  );

  const activeMissions = missionsData?.active || [];
  const completedMissions = missionsData?.completed || [];
  const allMissions = missionsData?.all || [];
  const weeklyProgress = missionsData?.weeklyProgress || {};

  const visibleMissions = useMemo(() => {
    if (activeTab === 'Active') {
      return activeMissions;
    }

    if (activeTab === 'Completed') {
      return completedMissions;
    }

    return allMissions;
  }, [activeMissions, activeTab, allMissions, completedMissions]);

  const weeklyCompletionPercent =
    weeklyProgress.totalMissions > 0
      ? Math.min((weeklyProgress.completedMissions / weeklyProgress.totalMissions) * 100, 100)
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Missions</Text>
        </View>

        <View style={styles.weeklyProgressCard}>
          <View style={styles.weeklyHeaderRow}>
            <Text style={styles.weeklyTitle}>Weekly Progress</Text>
            <Text style={styles.weeklyPointsText}>
              {Number(weeklyProgress.totalPoints || 0).toLocaleString()} pts
            </Text>
          </View>
          <View style={styles.weeklyProgressBarBg}>
            <View style={[styles.weeklyProgressBarFill, { width: `${weeklyCompletionPercent}%` }]} />
          </View>
          <Text style={styles.weeklyFooterText}>
            {weeklyProgress.completedMissions || 0} of {weeklyProgress.totalMissions || 0} missions completed this week
          </Text>
          <Text style={styles.weeklyFooterText}>
            {weeklyProgress.approvedTrashCount || 0} approved items contributed so far
          </Text>
        </View>

        <View style={styles.tabSelector}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
                {tab === 'Active' ? ` (${activeMissions.length})` : ''}
                {tab === 'Completed' ? ` (${completedMissions.length})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#16A34A" />
            </View>
          ) : visibleMissions.length === 0 ? (
            <Card>
              <Text style={styles.emptyStateText}>No missions match this view yet.</Text>
            </Card>
          ) : (
            visibleMissions.map((mission) => {
              const isCompleted = Boolean(mission.isCompleted);
              const progressPercent = getProgressPercent(mission);

              return (
                <Card key={mission.id} style={styles.missionCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={isCompleted ? styles.iconCircleSolid : styles.iconCircleLight}>
                      <Feather
                        name={isCompleted ? 'check' : 'target'}
                        size={20}
                        color={isCompleted ? '#FFFFFF' : '#16A34A'}
                      />
                    </View>
                    <View style={styles.cardTextContent}>
                      <Text style={isCompleted ? styles.missionTitleCompleted : styles.missionTitle}>
                        {mission.title}
                      </Text>
                      <Text style={isCompleted ? styles.missionSubtitleCompleted : styles.missionSubtitle}>
                        {mission.subtitle}
                      </Text>
                      <Text style={styles.routeNameText}>{mission.routeName}</Text>
                    </View>
                    <View style={isCompleted ? styles.pointsBadge : styles.pointsWrapper}>
                      <Feather name="zap" size={14} color="#16A34A" />
                      <Text style={isCompleted ? styles.pointsBadgeText : styles.pointsText}>
                        +{mission.pointsReward || 0}
                      </Text>
                    </View>
                  </View>

                  {!isCompleted ? (
                    <View style={styles.progressRow}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                      </View>
                      <Text style={styles.progressFraction}>
                        {mission.current || 0}/{mission.target || 0}
                      </Text>
                    </View>
                  ) : null}
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  weeklyProgressCard: {
    backgroundColor: '#F7F8FA',
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  weeklyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  weeklyTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  weeklyPointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  weeklyProgressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: spacing.sm,
    width: '100%',
  },
  weeklyProgressBarFill: {
    height: 8,
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  weeklyFooterText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  tabSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  errorText: {
    color: '#EF4444',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  missionCard: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
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
  iconCircleSolid: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTextContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  missionTitleCompleted: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  missionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  missionSubtitleCompleted: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  routeNameText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  pointsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
    marginLeft: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pointsBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
    marginLeft: 4,
  },
  progressRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  progressFraction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    minWidth: 44,
    textAlign: 'right',
  },
});
