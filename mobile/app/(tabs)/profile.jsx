import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../src/constants/theme';
import Card from '../../src/components/Card';

const statsData = [
  { id: '1', title: 'Total Points', value: '2,480', icon: 'zap' },
  { id: '2', title: 'Trash Collected', value: '124', icon: 'trash-2' },
  { id: '3', title: 'Routes Done', value: '8', icon: 'map' },
  { id: '4', title: 'Missions Done', value: '5', icon: 'target' },
];

const achievementsData = [
  { id: '1', title: 'First Route', icon: 'star' },
  { id: '2', title: '100 Trash', icon: 'trash-2' },
  { id: '3', title: '5 Routes', icon: 'map' },
  { id: '4', title: 'Top 20', icon: 'award' },
  { id: '5', title: 'Water Hero', icon: 'droplet' },
  { id: '6', title: '7-Day Streak', icon: 'award' },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Activity'); // 'Activity', 'Competitions', 'Achievements'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconCircle}>
            <Feather name="user" size={18} color="#16A34A" />
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Feather name="settings" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabSelector}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Activity' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Activity')}
        >
          <Text style={[styles.tabText, activeTab === 'Activity' && styles.tabTextActive]}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Competitions' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Competitions')}
        >
          <Text style={[styles.tabText, activeTab === 'Competitions' && styles.tabTextActive]}>Competitions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'Achievements' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'Achievements' && styles.tabTextActive]}>Achievements</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* User Info Card */}
        <Card style={styles.userInfoCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Feather name="user" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lv.7</Text>
            </View>
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Alex Rivera</Text>
            <Text style={styles.userHandle}>@alexr_eco</Text>
            <View style={styles.userTagsRow}>
              <View style={styles.guardianPill}>
                <Text style={styles.guardianPillText}>Eco Guardian</Text>
              </View>
              <Text style={styles.rankText}>Rank #12</Text>
            </View>
          </View>
        </Card>

        {/* 2x2 Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat) => (
            <Card key={stat.id} style={styles.statCard}>
              <Feather name={stat.icon} size={20} color="#9CA3AF" style={styles.statIcon} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </Card>
          ))}
        </View>

        {/* Achievements Card */}
        <Card style={styles.achievementsCard}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.achievementsTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsGrid}>
            {achievementsData.map((item) => (
              <View key={item.id} style={styles.achievementItem}>
                <View style={styles.achievementCircle}>
                  <Feather name={item.icon} size={20} color="#374151" />
                </View>
                <Text style={styles.achievementText}>{item.title}</Text>
              </View>
            ))}
          </View>
        </Card>

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: spacing.lg,
  },
  tabButton: {
    paddingVertical: spacing.sm,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#111827',
  },
  mainScrollView: {
    backgroundColor: '#F9FAFB', // Light grey background
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#14532D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  userTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guardianPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  guardianPillText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rankText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statCard: {
    width: '48%',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  achievementsCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '30%', // Fits 3 in a row
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  achievementCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  }
});
