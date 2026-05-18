import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { spacing } from '../constants/theme';
import EcoQuestChatBubble from './EcoQuestChatBubble';

export default function CategorySuggestionCard({
  suggestion,
  loading,
  error,
  feedback,
  analysisSource,
  onCorrect,
  onWrong,
  onAction,
  onAccept,
}) {
  const handleCorrect = onCorrect || onAction || onAccept;

  if (loading) {
    return (
      <EcoQuestChatBubble
        loading
        headline="Checking your photo..."
      />
    );
  }

  if (error) {
    return (
      <EcoQuestChatBubble
        headline="I couldn't analyze this photo right now."
        body="Pick a category below and I'll learn from your choice."
        showAction={false}
      />
    );
  }

  if (!suggestion?.suggestedCategoryId) {
    return (
      <EcoQuestChatBubble
        headline="I couldn't suggest a category yet."
        body="Pick one below and I'll learn from your choice."
        showAction={false}
      />
    );
  }

  const confidence = Math.round((suggestion.confidence || 0) * 100);
  const needsReview = Boolean(suggestion.needsReview);

  const bodyText = needsReview
    ? `I'm not fully sure — please confirm. ${confidence}% confident. ${suggestion.reason || ''}`
    : `${confidence}% confident. ${suggestion.reason || ''}`;

  const correctIsInactive = feedback === 'wrong';
  const wrongIsInactive = feedback === 'correct';

  const feedbackActions = (
    <View style={styles.actionsRow}>
      <TouchableOpacity
        style={[
          styles.feedbackButton,
          correctIsInactive ? styles.inactiveButton : styles.correctButton,
        ]}
        onPress={handleCorrect}
        activeOpacity={0.8}
      >
        <Feather
          name="check"
          size={16}
          color={correctIsInactive ? '#9CA3AF' : '#FFFFFF'}
        />
        <Text
          style={[
            styles.feedbackText,
            correctIsInactive ? styles.inactiveText : styles.feedbackTextActive,
          ]}
        >
          Correct
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.feedbackButton,
          wrongIsInactive ? styles.inactiveButton : styles.wrongButton,
        ]}
        onPress={onWrong}
        activeOpacity={0.8}
      >
        <Feather
          name="x"
          size={16}
          color={wrongIsInactive ? '#9CA3AF' : '#FFFFFF'}
        />
        <Text
          style={[
            styles.feedbackText,
            wrongIsInactive ? styles.inactiveText : styles.feedbackTextActive,
          ]}
        >
          Wrong
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <EcoQuestChatBubble
        headline={
          <Text style={{ color: '#111827', fontSize: 16, lineHeight: 22 }}>
            <Text style={{ fontWeight: '600' }}>
              {needsReview ? 'This might be ' : 'I think this looks like '}
            </Text>
            <Text style={{ fontWeight: '900' }}>{suggestion.suggestedCategoryName}</Text>
          </Text>
        }
        body={
          feedback === 'wrong'
            ? `${bodyText.trim()} Pick the right category below — I'll learn from your correction.`
            : bodyText.trim()
        }
        actions={feedbackActions}
        showAction={false}
      />
      {__DEV__ && analysisSource ? (
        <Text style={styles.devSourceLabel}>Analysis source: {analysisSource}</Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
  },
  correctButton: {
    borderColor: '#16A34A',
    backgroundColor: '#16A34A',
  },
  wrongButton: {
    borderColor: '#EF4444',
    backgroundColor: '#EF4444',
  },
  inactiveButton: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '800',
  },
  feedbackTextActive: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#9CA3AF',
  },
  devSourceLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
    marginLeft: 56,
  },
});
