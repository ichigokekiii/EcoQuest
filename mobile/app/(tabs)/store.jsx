import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../src/constants/theme';
import Card from '../../src/components/Card';

const { width } = Dimensions.get('window');

const mockStoreItems = [
  { id: '1', title: 'Eco Water Bottle', category: 'Gear', points: 500, affordable: true, icon: 'droplet' },
  { id: '2', title: 'Trail Snack Pack', category: 'Food', points: 300, affordable: true, icon: 'award' },
  { id: '3', title: 'Plant a Tree', category: 'Impact', points: 800, affordable: false, icon: 'globe' },
  { id: '4', title: 'Eco Tote Bag', category: 'Gear', points: 250, affordable: true, icon: 'shopping-bag' },
  { id: '5', title: 'Coffee Voucher', category: 'Food', points: 400, affordable: true, icon: 'star' },
  { id: '6', title: 'Campus Hoodie', category: 'Apparel', points: 1200, affordable: false, icon: 'award' },
];

const filters = ['All', 'Gear', 'Food', 'Impact', 'Apparel'];

export default function StoreScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Eco Store</Text>
        <View style={styles.pointsBadge}>
          <Feather name="zap" size={16} color="#16A34A" />
          <Text style={styles.pointsBadgeText}>2,480</Text>
          <Text style={styles.pointsBadgeUnit}>pts</Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity 
                key={filter} 
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>{filter}</Text>
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
        
        {/* Special Offer Banner */}
        <View style={styles.specialOfferContainer}>
          <View style={styles.offerIconWrapper}>
            <Feather name="award" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.offerTextContent}>
            <Text style={styles.offerTitle}>Special Offer</Text>
            <Text style={styles.offerSubtitle}>Plant-a-Tree: 20% off this weekend</Text>
          </View>
          <TouchableOpacity style={styles.offerButton}>
            <Text style={styles.offerButtonText}>View</Text>
          </TouchableOpacity>
        </View>

        {/* 2-Column Grid */}
        <View style={styles.gridContainer}>
          {mockStoreItems.map((item) => (
            <Card key={item.id} style={styles.itemCard}>
              <View style={styles.itemCardTop}>
                <View style={styles.itemIconCircle}>
                  <Feather name={item.icon} size={24} color="#111827" />
                </View>
              </View>
              
              <View style={styles.itemCardBottom}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                
                <View style={styles.itemFooter}>
                  <View style={styles.itemPointsWrapper}>
                    <Feather name="zap" size={14} color="#16A34A" />
                    <Text style={styles.itemPoints}>{item.points}</Text>
                  </View>
                  
                  {item.affordable ? (
                    <TouchableOpacity style={styles.redeemButton}>
                      <Text style={styles.redeemButtonText}>Redeem</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.needMoreButton}>
                      <Text style={styles.needMoreButtonText}>Need more</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))}
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
    backgroundColor: '#F9FAFB', // Light grey background behind grid
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
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
  offerButton: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: spacing.sm,
  },
  offerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    padding: 0, // Override default card padding
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
    shadowRadius: 4,
    elevation: 3,
  },
  itemCardBottom: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: spacing.md,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPointsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPoints: {
    fontSize: 14,
    fontWeight: '900',
    color: '#16A34A',
    marginLeft: 4,
  },
  redeemButton: {
    backgroundColor: '#14532D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  redeemButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  needMoreButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  needMoreButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
