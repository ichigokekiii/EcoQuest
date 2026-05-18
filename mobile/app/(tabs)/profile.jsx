import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Card from '../../src/components/Card';
import { spacing } from '../../src/constants/theme';
import { getProfileData } from '../../src/services/api';

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState({
    user: null,
    activeSession: null,
    recentSessions: [],
  });

  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfileData();
      setProfileData(data);
    } catch (error) {
      setProfileData({ user: null, activeSession: null, recentSessions: [] });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const user = profileData.user;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={28} color="#14532D" />
          </View>
          <Text style={styles.name}>{user?.name || 'Eco Quest User'}</Text>
          <Text style={styles.level}>{user?.level || 'Green Ranger'}</Text>
          <Text style={styles.email}>{user?.email || 'Not connected yet'}</Text>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{user?.points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{user?.totalTrashCollected || 0}</Text>
            <Text style={styles.statLabel}>Trash Collected</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{user?.routesCompleted || 0}</Text>
            <Text style={styles.statLabel}>Routes Completed</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{user?.missionsCompleted || 0}</Text>
            <Text style={styles.statLabel}>Missions Won</Text>
          </Card>
        </View>

        {profileData.activeSession ? (
          <Card style={styles.activeSessionCard}>
            <Text style={styles.sectionTitle}>Current Active Route</Text>
            <Text style={styles.activeRouteName}>{profileData.activeSession.routeName}</Text>
            <Text style={styles.activeRouteMeta}>
              {profileData.activeSession.approvedTrashCount}/
              {profileData.activeSession.requiredTrashCount} required trash confirmed
            </Text>
          </Card>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <Text style={styles.sectionMeta}>From backend history</Text>
        </View>

        {profileData.recentSessions.map((session) => (
          <Card key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>{session.routeName}</Text>
              <Text style={styles.sessionStatus}>{session.status}</Text>
            </View>
            <Text style={styles.sessionMeta}>
              Trash: {session.approvedTrashCount} • Points: {session.totalPointsEarned}
            </Text>
          </Card>
        ))}
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
  heroCard: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
  },
  level: {
    color: '#16A34A',
    fontSize: 15,
    fontWeight: '700',
  },
  email: {
    color: '#6B7280',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    gap: spacing.xs,
  },
  statValue: {
    color: '#14532D',
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activeSessionCard: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
  },
  sectionMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  activeRouteName: {
    color: '#14532D',
    fontSize: 18,
    fontWeight: '800',
  },
  activeRouteMeta: {
    color: '#6B7280',
    fontSize: 13,
  },
  sessionCard: {
    gap: spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  sessionStatus: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sessionMeta: {
    color: '#6B7280',
    fontSize: 13,
  },
});
