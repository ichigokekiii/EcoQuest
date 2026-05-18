import React from 'react';
import { Text } from 'react-native';

import EcoQuestChatBubble from './EcoQuestChatBubble';

export default function CategorySuggestionCard({ suggestion, loading, onAccept }) {
  if (loading) {
    return (
      <EcoQuestChatBubble
        loading
        headline="Checking your photo..."
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

  return (
    <EcoQuestChatBubble
      headline={
        <Text style={{ color: '#111827', fontSize: 16, lineHeight: 22 }}>
          <Text style={{ fontWeight: '600' }}>I think this looks like </Text>
          <Text style={{ fontWeight: '900' }}>{suggestion.suggestedCategoryName}</Text>
        </Text>
      }
      body={`${confidence}% confident. ${suggestion.reason || ''}`}
      actionLabel="Use suggestion"
      onAccept={onAccept}
    />
  );
}
