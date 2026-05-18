import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Card from '../../src/components/Card';
import { radius, spacing } from '../../src/constants/theme';
import {
  confirmTrash,
  finishRouteSession,
  getMissionsData,
  resetDemoState,
  startRouteSession,
} from '../../src/services/api';

function getProgressWidth(current, target) {
  if (!target) {
    return '0%';
  }

  return `${Math.min((current / target) * 100, 100)}%`;
}

export default function MissionsScreen() {
  const router = useRouter();
  const [missionsData, setMissionsData] = useState(null);
  const [loadingAction, setLoadingAction] = useState('');

  const loadMissions = useCallback(async () => {
    try {
      const data = await getMissionsData();
      setMissionsData(data);
    } catch (error) {
      Alert.alert('Backend unavailable', 'Unable to load mission data right now.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, [loadMissions])
  );

  const activeSession = missionsData?.activeSession || null;
  const availableRoutes = missionsData?.availableRoutes || [];
  const history = missionsData?.history || [];
  const canFinish = missionsData?.canFinish || false;

  const handleStartRoute = async (routeId) => {
    try {
      setLoadingAction(`start-${routeId}`);
      await startRouteSession(routeId);
      await loadMissions();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to start that route right now.';
      Alert.alert('Route not started', message);
    } finally {
      setLoadingAction('');
    }
  };

  const handleConfirmTrash = async () => {
    if (!activeSession) {
      return;
    }

    try {
      setLoadingAction('confirm');
      const response = await confirmTrash(activeSession.id);
      await loadMissions();

      const activeMission = response.session.missionProgress[0];
      Alert.alert(
        'Trash confirmed',
        `${response.session.approvedTrashCount} items counted. ${activeMission.currentCount}/${activeMission.requiredCount} for the active mission.`
      );
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to confirm trash right now.';
      Alert.alert('Confirmation failed', message);
    } finally {
      setLoadingAction('');
    }
  };

  const handleFinishRoute = async () => {
    if (!activeSession) {
      return;
    }

    try {
      setLoadingAction('finish');
      const response = await finishRouteSession(activeSession.id);
      await loadMissions();

      Alert.alert(
        'Route completed',
        `You earned ${response.summary.totalPointsEarned} points for this run.`
      );
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to finish the route right now.';
      Alert.alert('Finish failed', message);
    } finally {
      setLoadingAction('');
    }
  };

  const handleResetDemo = async () => {
    try {
      setLoadingAction('reset');
      await resetDemoState();
      await loadMissions();
    } catch (error) {
      Alert.alert('Reset failed', 'Unable to reset the demo state right now.');
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mission Control</Text>
          <Text style={styles.subtitle}>
            This tab now runs from the backend mock API instead of a placeholder screen.
          </Text>
        </View>

        {activeSession ? (
          <>
            <Card style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View>
                  <Text style={styles.heroLabel}>Active Route</Text>
                  <Text style={styles.heroTitle}>{activeSession.routeName}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{activeSession.status}</Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{activeSession.approvedTrashCount}</Text>
                  <Text style={styles.metricLabel}>Confirmed Trash</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{activeSession.requiredTrashCount}</Text>
                  <Text style={styles.metricLabel}>Required Trash</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{activeSession.visualMaxGoal}</Text>
                  <Text style={styles.metricLabel}>Visual Goal</Text>
                </View>
              </View>

              <View style={styles.progressBlock}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Route progress</Text>
                  <Text style={styles.progressValue}>
                    {activeSession.approvedTrashCount} / {activeSession.visualMaxGoal}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: getProgressWidth(
                          activeSession.approvedTrashCount,
                          activeSession.visualMaxGoal
                        ),
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() =>
                    router.push({
                      pathname: '/active-route',
                      params: { id: activeSession.routeId },
                    })
                  }
                >
                  <Feather name="map" size={16} color="#14532D" />
                  <Text style={styles.secondaryButtonText}>Open Active Route Map</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleConfirmTrash}
                  disabled={loadingAction === 'confirm'}
                >
                  <Feather name="trash-2" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    {loadingAction === 'confirm' ? 'Confirming...' : 'Confirm Trash +1'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, !canFinish && styles.secondaryButtonDisabled]}
                  onPress={handleFinishRoute}
                  disabled={!canFinish || loadingAction === 'finish'}
                >
                  <Feather
                    name="check-circle"
                    size={16}
                    color={!canFinish ? '#9CA3AF' : '#14532D'}
                  />
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      !canFinish && styles.secondaryButtonTextDisabled,
                    ]}
                  >
                    {loadingAction === 'finish' ? 'Finishing...' : 'Finish Route'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mission Progress</Text>
              <TouchableOpacity onPress={handleResetDemo}>
                <Text style={styles.sectionAction}>
                  {loadingAction === 'reset' ? 'Resetting...' : 'Reset Demo'}
                </Text>
              </TouchableOpacity>
            </View>

            {activeSession.missionProgress.map((mission) => (
              <Card key={mission.missionId} style={styles.missionCard}>
                <View style={styles.missionRow}>
                  <View style={styles.missionIconWrap}>
                    <Feather
                      name={mission.isCompleted ? 'award' : 'target'}
                      size={18}
                      color={mission.isCompleted ? '#FFFFFF' : '#14532D'}
                    />
                  </View>
                  <View style={styles.missionCopy}>
                    <Text style={styles.missionName}>{mission.title}</Text>
                    <Text style={styles.missionMeta}>
                      Category: {mission.trashCategoryName || 'Any trash'}
                    </Text>
                  </View>
                  <Text style={styles.missionCount}>
                    {mission.currentCount}/{mission.requiredCount}
                  </Text>
                </View>
                <View style={styles.missionTrack}>
                  <View
                    style={[
                      styles.missionFill,
                      {
                        width: getProgressWidth(mission.currentCount, mission.requiredCount),
                        backgroundColor: mission.isCompleted ? '#16A34A' : '#14532D',
                      },
                    ]}
                  />
                </View>
              </Card>
            ))}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Start a Route</Text>
              <TouchableOpacity onPress={handleResetDemo}>
                <Text style={styles.sectionAction}>
                  {loadingAction === 'reset' ? 'Resetting...' : 'Reset Demo'}
                </Text>
              </TouchableOpacity>
            </View>

            {availableRoutes.map((route) => (
              <Card key={route.id} style={styles.availableRouteCard}>
                <View style={styles.availableRouteHeader}>
                  <View>
                    <Text style={styles.availableRouteTitle}>{route.title}</Text>
                    <Text style={styles.availableRouteMeta}>
                      {route.locationName} • {route.minTrash}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartRoute(route.id)}
                    disabled={loadingAction === `start-${route.id}`}
                  >
                    <Text style={styles.startButtonText}>
                      {loadingAction === `start-${route.id}` ? 'Starting...' : 'Start Route'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Route History</Text>
          <Text style={styles.historyHint}>Mock session records</Text>
        </View>

        {history.map((session) => (
          <Card key={session.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>{session.routeName}</Text>
              <Text style={styles.historyStatus}>{session.status}</Text>
            </View>
            <Text style={styles.historyMeta}>
              Trash collected: {session.approvedTrashCount} • Points earned:{' '}
              {session.totalPointsEarned}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
  },
  heroCard: {
    gap: spacing.md,
    backgroundColor: '#14532D',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  heroLabel: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#DCFCE7',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressValue: {
    color: '#DCFCE7',
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#22C55E',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  secondaryButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#14532D',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButtonTextDisabled: {
    color: '#9CA3AF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
  },
  sectionAction: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '700',
  },
  missionCard: {
    gap: spacing.sm,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  missionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionCopy: {
    flex: 1,
  },
  missionName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  missionMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  missionCount: {
    color: '#14532D',
    fontSize: 14,
    fontWeight: '800',
  },
  missionTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  missionFill: {
    height: '100%',
    borderRadius: 999,
  },
  availableRouteCard: {
    gap: spacing.sm,
  },
  availableRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  availableRouteTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  availableRouteMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  startButton: {
    backgroundColor: '#14532D',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  historyHint: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  historyCard: {
    gap: spacing.xs,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  historyStatus: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  historyMeta: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
  },
});
