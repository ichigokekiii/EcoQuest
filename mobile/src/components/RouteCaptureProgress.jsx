import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { spacing } from '../constants/theme';

export default function RouteCaptureProgress({
  capturedCount = 0,
  visualProgressTarget = 0,
  pointsPreview = 0,
}) {
  const progressPercent =
    visualProgressTarget > 0
      ? Math.min((capturedCount / visualProgressTarget) * 100, 100)
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.countGroup}>
          <Text style={styles.sheetSubtitle}>CAPTURED TRASH</Text>
          <View style={styles.countRow}>
            <Text style={styles.largeCount}>{capturedCount}</Text>
            <Text style={styles.subCount}>/ {visualProgressTarget}</Text>
          </View>
        </View>
        <View style={styles.pointsRow}>
          <Feather name="zap" size={16} color="#16A34A" />
          <Text style={styles.pointsText}>+{pointsPreview} pts</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelText}>Captured: {capturedCount}</Text>
          <Text style={styles.progressLabelActive}>Goal: {visualProgressTarget}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  countGroup: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  sheetSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  largeCount: {
    color: '#111827',
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 56,
  },
  subCount: {
    color: '#9CA3AF',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '600',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  pointsText: {
    color: '#16A34A',
    fontSize: 18,
    fontWeight: '800',
  },
  progressContainer: {
    marginBottom: 0,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  progressLabelActive: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },
});
