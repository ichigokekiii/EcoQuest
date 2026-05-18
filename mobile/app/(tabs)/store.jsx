import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Card from '../../src/components/Card';
import { radius, spacing } from '../../src/constants/theme';
import { getStoreData } from '../../src/services/api';

export default function StoreScreen() {
  const [storeData, setStoreData] = useState({ pointsBalance: 0, rewards: [] });

  const loadStore = useCallback(async () => {
    try {
      const data = await getStoreData();
      setStoreData(data);
    } catch (error) {
      setStoreData({ pointsBalance: 0, rewards: [] });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStore();
    }, [loadStore])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Points</Text>
          <Text style={styles.balanceValue}>{storeData.pointsBalance.toLocaleString()}</Text>
          <Text style={styles.balanceHint}>Rewards below are powered by the backend mock API.</Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reward Store</Text>
          <Text style={styles.sectionMeta}>{storeData.rewards.length} items</Text>
        </View>

        {storeData.rewards.map((reward) => {
          const canAfford = storeData.pointsBalance >= reward.pointsCost;

          return (
            <Card key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardHeader}>
                <View style={styles.rewardIcon}>
                  <Feather name="gift" size={18} color="#14532D" />
                </View>
                <View style={styles.rewardCopy}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardDescription}>{reward.description}</Text>
                </View>
              </View>

              <View style={styles.rewardFooter}>
                <View>
                  <Text style={styles.rewardCost}>{reward.pointsCost} pts</Text>
                  <Text style={styles.rewardStock}>Stock: {reward.stock}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.claimButton, !canAfford && styles.claimButtonDisabled]}
                  disabled={!canAfford}
                >
                  <Text
                    style={[
                      styles.claimButtonText,
                      !canAfford && styles.claimButtonTextDisabled,
                    ]}
                  >
                    {canAfford ? 'Redeem Later' : 'Need More Points'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
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
  balanceCard: {
    backgroundColor: '#14532D',
    gap: spacing.xs,
  },
  balanceLabel: {
    color: '#86EFAC',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  balanceHint: {
    color: '#DCFCE7',
    fontSize: 13,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
  },
  sectionMeta: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
  rewardCard: {
    gap: spacing.md,
  },
  rewardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardCopy: {
    flex: 1,
  },
  rewardName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  rewardDescription: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rewardCost: {
    color: '#14532D',
    fontSize: 18,
    fontWeight: '900',
  },
  rewardStock: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  claimButton: {
    backgroundColor: '#14532D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  claimButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  claimButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
