import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { getProfile, Profile } from '@/src/services/profileService';
import { getUserStats } from '@/src/services/gameService';
import { signOut } from '@/src/services/authService';
import { COLORS } from '@/lib/constants';
import { LogOut, User, Settings } from 'lucide-react-native';

interface UserStats {
  bestScore: number;
  totalGames: number;
  totalTaps: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats>({ bestScore: 0, totalGames: 0, totalTaps: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const [profileData, userStats] = await Promise.all([
      getProfile(user.id),
      getUserStats(user.id),
    ]);

    if (profileData) setProfile(profileData);
    setStats(userStats);
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.replace('/signup');
      return;
    }

    fetchProfile();
  }, [fetchProfile, router, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const sideColor = profile.preferred_side === 'WANTAM' ? COLORS.wantam : COLORS.tutam;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <User color={COLORS.white} size={24} />
            <Text style={styles.title}>Profile</Text>
          </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings' as any)}
          activeOpacity={0.8}
        >
          <Settings color={COLORS.white} size={22} />
        </TouchableOpacity>
      </View>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { borderColor: sideColor }]}>
            <Text style={styles.avatarText}>{profile.username.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{profile.username}</Text>
          <View style={[styles.sidePill, { backgroundColor: sideColor }]}>
            <Text style={styles.sidePillText}>{profile.preferred_side}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>County</Text>
            <Text style={styles.infoValue}>{profile.county}</Text>
          </View>
          {profile.university && (
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>University</Text>
              <Text style={styles.infoValue}>{profile.university}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.bestScore.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalGames}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalTaps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Taps</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut color={COLORS.error} size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginTop: '50%',
},
header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 24,
  paddingTop: 8,
},

headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},

settingsButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: COLORS.surface,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: COLORS.border,
},
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: 'Inter-Black',
    fontSize: 32,
    color: COLORS.white,
  },
  username: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: COLORS.white,
    marginBottom: 8,
  },
  sidePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sidePillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.white,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.error,
  },
});
