import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { spacing, radius } from '../src/constants/theme';
import Card from '../src/components/Card';

const { height: screenHeight } = Dimensions.get('window');

export default function RouteCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const routeName = params.routeName || 'Cleanup Route';
  const duration = params.duration || 'Route complete';
  const trashCollected = Number(params.trashCollected || 0);
  const requiredTrashCount = Number(params.requiredTrashCount || 0);
  const completedMissions = Number(params.completedMissions || 0);
  const totalMissions = Number(params.totalMissions || 0);
  const basePointsEarned = Number(params.basePointsEarned || 0);
  const trashPointsEarned = Number(params.trashPointsEarned || 0);
  const bonusPointsEarned = Number(params.bonusPointsEarned || 0);
  const achievementBonusEarned = Number(params.achievementBonusEarned || 0);
  const totalPointsEarned = Number(params.totalPointsEarned || 0);
  const bonusItemsCollected = Math.max(trashCollected - requiredTrashCount, 0);

  const checkmarkScale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    // Pop the checkmark with a bouncy spring
    checkmarkScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 150 }));
    // Fade and scale the glow rings
    ringScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    ringOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
  }, []);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }]
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value
  }));

  return (
    <View style={styles.container}>
      {/* Top Hero Section (Dark Green) */}
      <View style={[styles.heroSection, { paddingTop: insets.top + spacing.xl }]}>
        {/* Glowing Checkmark */}
        <Animated.View style={[styles.glowRingOuter, ringStyle]}>
          <View style={styles.glowRingInner}>
            <Animated.View style={[styles.checkCircle, checkmarkStyle]}>
              <Feather name="check" size={32} color="#16A34A" />
            </Animated.View>
          </View>
        </Animated.View>

        <Text style={styles.heroTitle}>Route Complete</Text>
        <Text style={styles.heroSubtitle}>{routeName} · {duration}</Text>
      </View>

      {/* Bottom Content Section */}
      <View style={styles.contentSection}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 180 }]}
        >
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Feather name="trash-2" size={24} color="#6B7280" style={styles.statIcon} />
              <Text style={styles.statValue}>{trashCollected}</Text>
              <Text style={styles.statLabel}>Trash</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Feather name="target" size={24} color="#6B7280" style={styles.statIcon} />
              <Text style={styles.statValue}>{completedMissions}/{totalMissions}</Text>
              <Text style={styles.statLabel}>Missions</Text>
            </Card>

            <Card style={styles.statCard}>
              <Feather name="clock" size={24} color="#6B7280" style={styles.statIcon} />
              <Text style={styles.statValue}>{duration.replace(' min', 'm')}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </Card>
          </View>

          {/* Milestone Card */}
          <Card style={styles.milestoneCard}>
            <View style={styles.milestoneRow}>
              <Text style={styles.milestoneLabel}>Minimum reached</Text>
              <View style={styles.milestoneValueGroup}>
                <Text style={styles.milestoneTarget}>{trashCollected} / {requiredTrashCount}</Text>
                <Feather name="check" size={16} color="#16A34A" />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.milestoneRow}>
              <Text style={styles.milestoneLabel}>Bonus items collected</Text>
              <Text style={styles.milestoneBonus}>+{bonusItemsCollected} extra</Text>
            </View>
          </Card>

          {/* Points Breakdown */}
          <Card style={styles.pointsCard}>
            <Text style={styles.pointsTitle}>Points Breakdown</Text>
            
            <View style={styles.pointsRow}>
              <View style={styles.pointsLabelGroup}>
                <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.pointsLabel}>Base Route</Text>
              </View>
              <Text style={styles.pointsValue}>+{basePointsEarned}</Text>
            </View>

            <View style={styles.pointsRow}>
              <View style={styles.pointsLabelGroup}>
                <View style={[styles.dot, { backgroundColor: '#16A34A' }]} />
                <Text style={styles.pointsLabel}>Trash Collected ({trashCollected}x)</Text>
              </View>
              <Text style={styles.pointsValue}>+{trashPointsEarned}</Text>
            </View>

            <View style={styles.pointsRow}>
              <View style={styles.pointsLabelGroup}>
                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.pointsLabel}>Mission Bonus</Text>
              </View>
              <Text style={styles.pointsValue}>+{achievementBonusEarned}</Text>
            </View>

            <View style={styles.pointsRow}>
              <View style={styles.pointsLabelGroup}>
                <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.pointsLabel}>Extra Trash Bonus</Text>
              </View>
              <Text style={styles.pointsValue}>+{bonusPointsEarned}</Text>
            </View>

            <View style={[styles.pointsRow, styles.pointsRowTotal]}>
              <Text style={styles.pointsTotalLabel}>Total Earned</Text>
              <Text style={styles.pointsTotalValue}>+{totalPointsEarned}</Text>
            </View>
          </Card>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)/store')}>
            <Text style={styles.primaryButtonText}>Visit Store</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16A34A', // Match primary green
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
  glowRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  glowRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF', // White check background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#86EFAC', // Light green
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white background like other pages
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    overflow: 'hidden',
    marginTop: -24, // Pull up to overlap hero
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F9FAFB',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  milestoneCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: spacing.md,
  },
  milestoneLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  milestoneValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneTarget: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  milestoneBonus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6', // Purple
  },
  pointsCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: spacing.lg,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pointsRowTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pointsLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  pointsLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  pointsValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  pointsTotalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  pointsTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#14532D',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6', 
  },
  primaryButton: {
    backgroundColor: '#16A34A', // Primary green
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
