import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../src/constants/theme';
import Card from '../../src/components/Card';

const mockActiveMissions = [
  { id: 'a1', title: 'Plastic Patrol', subtitle: 'Collect 5 plastic bottles', points: 50, current: 3, target: 5 },
  { id: 'a2', title: 'Trail Guardian', subtitle: 'Complete 3 routes this week', points: 150, current: 1, target: 3 },
  { id: 'a3', title: 'Big Haul', subtitle: 'Collect 30 trash items total', points: 200, current: 22, target: 30 },
];

const mockCompletedMissions = [
  { id: 'c1', title: 'First Steps', subtitle: 'Completed your first route', points: 100 },
  { id: 'c2', title: 'Paper Chase', subtitle: 'Collected 3 paper items', points: 30 },
];

export default function MissionsScreen() {
  const [activeTab, setActiveTab] = useState('Active'); // 'Active', 'Completed', 'All'

  const renderActiveMission = (mission) => {
    const progressPercent = (mission.current / mission.target) * 100;
    return (
      <Card key={mission.id} style={styles.missionCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircleLight}>
            <Feather name="target" size={20} color="#16A34A" />
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionSubtitle}>{mission.subtitle}</Text>
          </View>
          <View style={styles.pointsWrapper}>
            <Feather name="zap" size={14} color="#16A34A" />
            <Text style={styles.pointsText}>+{mission.points}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressFraction}>{mission.current}/{mission.target}</Text>
        </View>
      </Card>
    );
  };

  const renderCompletedMission = (mission) => {
    return (
      <Card key={mission.id} style={styles.missionCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.iconCircleSolid}>
            <Feather name="check" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.cardTextContent}>
            <Text style={styles.missionTitleCompleted}>{mission.title}</Text>
            <Text style={styles.missionSubtitleCompleted}>{mission.subtitle}</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Feather name="zap" size={12} color="#16A34A" />
            <Text style={styles.pointsBadgeText}>+{mission.points}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Missions</Text>
          <View style={styles.doneBadge}>
            <Feather name="check" size={14} color="#16A34A" />
            <Text style={styles.doneBadgeText}>{mockCompletedMissions.length} Done</Text>
          </View>
        </View>

        {/* Weekly Progress Card */}
        <View style={styles.weeklyProgressCard}>
          <View style={styles.weeklyHeaderRow}>
            <Text style={styles.weeklyTitle}>Weekly Progress</Text>
            <Text style={styles.weeklyPointsText}>380 / 500 pts</Text>
          </View>
          <View style={styles.weeklyProgressBarBg}>
            <View style={[styles.weeklyProgressBarFill, { width: '76%' }]} />
          </View>
          <Text style={styles.weeklyFooterText}>120 pts more to unlock weekly reward</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Active' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Active')}
          >
            <Text style={[styles.tabText, activeTab === 'Active' && styles.tabTextActive]}>Active ({mockActiveMissions.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Completed' && styles.tabButtonActive]}
            onPress={() => setActiveTab('Completed')}
          >
            <Text style={[styles.tabText, activeTab === 'Completed' && styles.tabTextActive]}>Completed ({mockCompletedMissions.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'All' && styles.tabButtonActive]}
            onPress={() => setActiveTab('All')}
          >
            <Text style={[styles.tabText, activeTab === 'All' && styles.tabTextActive]}>All</Text>
          </TouchableOpacity>
        </View>

        {/* Mission Lists */}
        <View style={styles.listContainer}>
          {(activeTab === 'Active' || activeTab === 'All') && (
            <View>
              {mockActiveMissions.map(renderActiveMission)}
            </View>
          )}

          {(activeTab === 'Completed' || activeTab === 'All') && (
            <View style={styles.completedSection}>
              {(activeTab === 'All' || activeTab === 'Completed') && (
                <Text style={styles.sectionTitle}>Completed</Text>
              )}
              {mockCompletedMissions.map(renderCompletedMission)}
            </View>
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
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  doneBadgeText: {
    color: '#16A34A',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
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
    color: '#9CA3AF',
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
  listContainer: {
    paddingHorizontal: spacing.lg,
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
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  missionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  missionTitleCompleted: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  missionSubtitleCompleted: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  pointsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    marginLeft: 2,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16A34A',
    marginLeft: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingLeft: 60, // Align with text start
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#16A34A',
    borderRadius: 3,
  },
  progressFraction: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  completedSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: spacing.md,
  }
});
