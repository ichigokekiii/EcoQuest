import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

import { radius, spacing } from '../constants/theme';

export default function EcoQuestChatBubble({
  loading = false,
  headline,
  body,
  footer,
  actionLabel,
  onAction,
  showAction = true,
  style,
}) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.avatarWrap}>
        <Image
          source={require('../../assets/ecoquest/ecoquest.svg')}
          style={styles.avatar}
          contentFit="contain"
        />
      </View>
      <View style={styles.bubble}>
        <Text style={styles.senderName}>Eco Quest</Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#16A34A" />
            <Text style={styles.headline}>{headline || 'Analyzing your photo...'}</Text>
          </View>
        ) : (
          <>
            {headline ? (
              typeof headline === 'string' ? (
                <Text style={styles.headline}>{headline}</Text>
              ) : (
                <View style={styles.headlineWrap}>{headline}</View>
              )
            ) : null}
            {body ? (
              typeof body === 'string' ? (
                <Text style={styles.body}>{body}</Text>
              ) : (
                <View style={styles.bodyWrap}>{body}</View>
              )
            ) : null}
            {footer ? <View style={styles.footer}>{footer}</View> : null}
            {showAction && actionLabel && onAction ? (
              <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.8}>
                <Text style={styles.actionText}>{actionLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  avatar: {
    width: 28,
    height: 28,
  },
  bubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    padding: spacing.md,
  },
  senderName: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headline: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  headlineWrap: {
    marginBottom: 0,
  },
  bodyWrap: {
    marginTop: spacing.xs,
  },
  body: {
    color: '#4B5563',
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  actionText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '800',
  },
});
