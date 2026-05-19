import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { spacing, radius } from '../constants/theme';

export default function RouteMissionProgressRow({
  title,
  currentCount = 0,
  requiredCount = 0,
  pointsReward = 0,
  trashCategoryName,
  isCompleted = false,
  selectable = false,
  selected = false,
  onPress,
}) {
  const progressPercent =
    requiredCount > 0 ? Math.min((currentCount / requiredCount) * 100, 100) : 0;
  const categoryLabel = trashCategoryName || 'items';

  const content = (
    <>
      <View style={styles.headerRow}>
        {selectable ? (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected ? <Feather name="check" size={12} color="#FFFFFF" /> : null}
          </View>
        ) : (
          <View style={styles.iconCircleLight}>
            <Feather name="target" size={16} color="#16A34A" />
          </View>
        )}

        <View style={styles.textGroup}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            {currentCount} / {requiredCount} {categoryLabel}
          </Text>
        </View>

        <View style={styles.pointsRow}>
          <Feather name="zap" size={14} color="#16A34A" />
          <Text style={styles.pointsText}>+{pointsReward} pts</Text>
        </View>

        {!selectable && isCompleted ? (
          <Feather name="check-circle" size={18} color="#16A34A" style={styles.completedIcon} />
        ) : null}
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>
    </>
  );

  if (selectable && onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, selected && styles.containerSelected]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  containerSelected: {
    borderRadius: radius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  iconCircleLight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  pointsText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '800',
  },
  completedIcon: {
    marginLeft: 2,
    flexShrink: 0,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#16A34A',
    borderRadius: 3,
  },
});
