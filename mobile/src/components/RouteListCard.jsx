import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Card from './Card';
import { spacing } from '../constants/theme';

function getDifficultyLabel(difficulty) {
  if (!difficulty) {
    return 'Easy';
  }

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
}

function getDifficultyBadgeStyles(difficulty) {
  const label = getDifficultyLabel(difficulty);

  if (label === 'Hard') {
    return {
      badge: styles.badgeHard,
      text: styles.badgeTextHard,
    };
  }

  if (label === 'Medium') {
    return {
      badge: styles.badgeMedium,
      text: styles.badgeTextMedium,
    };
  }

  return {
    badge: styles.badgeEasy,
    text: styles.badgeTextEasy,
  };
}

function RouteStat({ icon, label }) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon} size={14} color="#9CA3AF" />
      <Text style={styles.statText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function RouteListCard({ route, onPress, style }) {
  const difficultyStyles = getDifficultyBadgeStyles(route.difficulty);
  const trashGoal = route.targetTrash || route.minimumTrashRequired || 0;
  const points = route.points || route.basePoints || 0;

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {route.title}
        </Text>
        <View style={[styles.badge, difficultyStyles.badge]}>
          <Text style={[styles.badgeText, difficultyStyles.text]}>
            {getDifficultyLabel(route.difficulty)}
          </Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Feather name="map-pin" size={14} color="#9CA3AF" />
        <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
          {route.locationName || 'Route start'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <RouteStat icon="map" label={route.distance || '—'} />
        <RouteStat icon="clock" label={route.duration || '—'} />
        <RouteStat icon="trash-2" label={`Goal ${trashGoal}`} />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.pointsRow}>
          <Feather name="zap" size={14} color="#16A34A" />
          <Text style={styles.pointsText}>+{points} pts</Text>
        </View>
        <TouchableOpacity style={styles.detailsButton} activeOpacity={0.85} onPress={onPress}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeEasy: {
    backgroundColor: '#DCFCE7',
  },
  badgeMedium: {
    backgroundColor: '#FEF3C7',
  },
  badgeHard: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextEasy: {
    color: '#166534',
  },
  badgeTextMedium: {
    color: '#B45309',
  },
  badgeTextHard: {
    color: '#B91C1C',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  locationText: {
    flex: 1,
    minWidth: 0,
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    gap: 4,
  },
  statText: {
    flexShrink: 1,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    minWidth: 0,
  },
  pointsText: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '800',
  },
  detailsButton: {
    flexShrink: 0,
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
