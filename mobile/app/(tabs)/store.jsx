import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import Card from '../../src/components/Card';
import { spacing, radius } from '../../src/constants/theme';
import { getStoreData, redeemReward } from '../../src/services/api';

const { width } = Dimensions.get('window');

function getRewardIcon(category) {
  switch ((category || '').toLowerCase()) {
    case 'gear':
      return 'shopping-bag';
    case 'food':
      return 'coffee';
    case 'impact':
      return 'globe';
    case 'apparel':
      return 'award';
    default:
      return 'gift';
  }
}

export default function StoreScreen() {
  const [storeData, setStoreData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [redeemingId, setRedeemingId] = useState(null);

  const loadStore = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await getStoreData();
      setStoreData(response);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to load store items right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStore();
    }, [loadStore])
  );

  const pointsBalance = Number(storeData?.pointsBalance || 0);
  const rewards = storeData?.rewards || [];
  const recentRedemptions = storeData?.recentRedemptions || [];
  const filters = useMemo(() => {
    const categories = Array.from(new Set(rewards.map((reward) => reward.category).filter(Boolean)));
    return ['All', ...categories];
  }, [rewards]);
  const filteredRewards = rewards.filter(
    (reward) => activeFilter === 'All' || reward.category === activeFilter
  );

  async function handleRedeem(reward) {
    try {
      setRedeemingId(reward.id);
      const response = await redeemReward(reward.id);
      Alert.alert(
        'Reward redeemed',
        `${reward.name} is now pending fulfillment. Remaining points: ${Number(response.points || 0).toLocaleString()}`
      );
      await loadStore();
    } catch (error) {
      Alert.alert(
        'Redeem failed',
        error.response?.data?.message || 'Unable to redeem this reward right now.'
      );
    } finally {
      setRedeemingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eco Store</Text>
        <View style={styles.pointsBadge}>
          <Feather name="zap" size={16} color="#16A34A" />
          <Text style={styles.pointsBadgeText}>{pointsBalance.toLocaleString()}</Text>
          <Text style={styles.pointsBadgeUnit}>pts</Text>
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.mainScrollView}
      >
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.specialOfferContainer}>
          <View style={styles.offerIconWrapper}>
            <Feather name="gift" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.offerTextContent}>
            <Text style={styles.offerTitle}>Recent redemption activity</Text>
            <Text style={styles.offerSubtitle}>
              {recentRedemptions[0]
                ? `${recentRedemptions[0].rewardName} · ${recentRedemptions[0].status || 'pending'}`
                : 'Redeem rewards here using your live Firebase points balance.'}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#16A34A" />
          </View>
        ) : filteredRewards.length === 0 ? (
          <Card>
            <Text style={styles.emptyStateText}>No rewards match this category yet.</Text>
          </Card>
        ) : (
          <View style={styles.gridContainer}>
            {filteredRewards.map((item) => {
              const pointsCost = Number(item.pointsCost || 0);
              const stock = Number(item.stock || 0);
              const affordable = pointsBalance >= pointsCost;
              const canRedeem = affordable && stock > 0 && item.status === 'active';

              return (
                <Card key={item.id} style={styles.itemCard}>
                  <View style={styles.itemCardTop}>
                    <View style={styles.itemIconCircle}>
                      <Feather name={getRewardIcon(item.category)} size={24} color="#111827" />
                    </View>
                  </View>

                  <View style={styles.itemCardBottom}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category || 'Reward'}</Text>
                    <Text style={styles.stockText}>
                      {stock > 0 ? `${stock} left` : 'Out of stock'}
                      {item.redeemedCount ? ` · ${item.redeemedCount} redeemed` : ''}
                    </Text>

                    <View style={styles.itemFooter}>
                      <View style={styles.itemPointsWrapper}>
                        <Feather name="zap" size={14} color="#16A34A" />
                        <Text style={styles.itemPoints}>{pointsCost}</Text>
                      </View>

                      {canRedeem ? (
                        <TouchableOpacity
                          style={styles.redeemButton}
                          disabled={redeemingId === item.id}
                          onPress={() => handleRedeem(item)}
                        >
                          <Text style={styles.redeemButtonText}>
                            {redeemingId === item.id ? '...' : 'Redeem'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.needMoreButton}>
                          <Text style={styles.needMoreButtonText}>
                            {stock <= 0 ? 'Sold out' : 'Need more'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsBadgeText: {
    color: '#16A34A',
    fontWeight: '900',
    fontSize: 16,
    marginLeft: 4,
  },
  pointsBadgeUnit: {
    color: '#9CA3AF',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 4,
  },
  filterWrapper: {
    paddingBottom: spacing.sm,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.lg,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: spacing.sm,
  },
  filterPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  mainScrollView: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: spacing.md,
  },
  specialOfferContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14532D',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  offerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  offerTextContent: {
    flex: 1,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offerSubtitle: {
    color: '#DCFCE7',
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  itemCardTop: {
    height: 110,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  itemCardBottom: {
    padding: spacing.md,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  stockText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  itemPointsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPoints: {
    marginLeft: 4,
    fontWeight: '800',
    color: '#16A34A',
  },
  redeemButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  needMoreButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  needMoreButtonText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
});
