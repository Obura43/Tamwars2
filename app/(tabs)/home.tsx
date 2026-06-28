import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { getProfile } from '@/src/services/profileService';
import { getSideStats, SideStats } from '@/src/services/totalsService';
import { COLORS } from '@/lib/constants';
import { Zap, Trophy, Play } from 'lucide-react-native';
//import BannerAdvertisement from '@/components/BannerAd';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<SideStats[]>([]);
  const [userSide, setUserSide] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const [sideStats, profile] = await Promise.all([
      getSideStats(),
      user ? getProfile(user.id) : Promise.resolve(null),
    ]);

    setStats(sideStats);

    if (profile) {
      setUserSide(profile.preferred_side);
    } else {
      setUserSide('Guest');
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const wantamStats = stats.find(s => s.side === 'WANTAM');
  const tutamStats = stats.find(s => s.side === 'TUTAM');

  const formatNumber = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>TamWar</Text>
          <View style={styles.headerActions}>
            {!user && (
              <TouchableOpacity
                style={styles.signupLink}
                onPress={() => router.push('/signup')}
                activeOpacity={0.8}
              >
                <Text style={styles.signupLinkText}>Sign up</Text>
              </TouchableOpacity>
            )}
            <View style={styles.yourSideBadge}>
              <Text style={styles.yourSideLabel}>Your side:</Text>
              <Text
                style={[
                  styles.yourSideText,
                  {
                    color:
                      userSide === 'WANTAM'
                        ? COLORS.wantam
                        : userSide === 'TUTAM'
                        ? COLORS.tutam
                        : COLORS.white,
                  },
                ]}
              >
                {userSide}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.battleContainer}>
          <TouchableOpacity
            style={[styles.sideCard, { backgroundColor: COLORS.wantam }]}
            onPress={() => router.push('/battle/WANTAM')}
            activeOpacity={0.85}
          >
            <Text style={styles.sideName}>WANTAM</Text>
            <View style={styles.sideStatsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatNumber(wantamStats?.unique_supporters ?? 0)}</Text>
                <Text style={styles.statLabel}>Supporters</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatNumber(wantamStats?.total_taps ?? 0)}</Text>
                <Text style={styles.statLabel}>Total Taps</Text>
              </View>
            </View>
            <View style={styles.playRow}>
              <Play color={COLORS.white} size={20} fill={COLORS.white} />
              <Text style={styles.playText}>TAP FOR WANTAM</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <TouchableOpacity
            style={[styles.sideCard, { backgroundColor: COLORS.tutam }]}
            onPress={() => router.push('/battle/TUTAM')}
            activeOpacity={0.85}
          >
            <Text style={styles.sideName}>TUTAM</Text>
            <View style={styles.sideStatsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatNumber(tutamStats?.unique_supporters ?? 0)}</Text>
                <Text style={styles.statLabel}>Supporters</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatNumber(tutamStats?.total_taps ?? 0)}</Text>
                <Text style={styles.statLabel}>Total Taps</Text>
              </View>
            </View>
            <View style={styles.playRow}>
              <Play color={COLORS.white} size={20} fill={COLORS.white} />
              <Text style={styles.playText}>TAP FOR TUTAM</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/leaderboard')}>
            <Trophy color={COLORS.gold} size={20} />
            <Text style={styles.actionText}>Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/totals')}>
            <Zap color={COLORS.white} size={20} />
            <Text style={styles.actionText}>Live Totals</Text>
          </TouchableOpacity>
        </View>
         <View style={styles.bannerContainer}>
          {/* <BannerAdvertisement /> */}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontFamily: 'Inter-Black',
    fontSize: 28,
    color: COLORS.white,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  signupLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  signupLinkText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.gold,
  },
  yourSideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yourSideLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
  },
  yourSideText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  battleContainer: {
    gap: 0,
    marginBottom: 24,
  },
  sideCard: {
    borderRadius: 20,
    padding: 24,
  },
  sideName: {
    fontFamily: 'Inter-Black',
    fontSize: 32,
    color: COLORS.white,
    marginBottom: 16,
  },
  sideStatsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  statItem: {},
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: COLORS.white,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  playText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: -12,
    zIndex: 1,
  },
  vsText: {
    fontFamily: 'Inter-Black',
    fontSize: 20,
    color: COLORS.white,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
    bannerContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    },
});
