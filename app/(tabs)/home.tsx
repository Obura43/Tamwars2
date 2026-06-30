import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { getProfile } from '@/src/services/profileService';
import { getSideStats, SideStats } from '@/src/services/totalsService';
import { getTwsBalance } from '@/src/services/walletService';
import { COLORS } from '@/lib/constants';
import { Building2, Car, Coins, Zap, Trophy, Play } from 'lucide-react-native';
import BannerAdvertisement from '@/components/BannerAd';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<SideStats[]>([]);
  const [userSide, setUserSide] = useState<string>('');
  const [twsBalance, setTwsBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const [sideStats, profile, balance] = await Promise.all([
      getSideStats(),
      user ? getProfile(user.id) : Promise.resolve(null),
      user ? getTwsBalance(user.id) : Promise.resolve(0),
    ]);

    setStats(sideStats);
    setTwsBalance(balance);

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
          <Text style={styles.logo} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            TamWar
          </Text>
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
            {user && (
              <TouchableOpacity
                style={styles.balancePill}
                onPress={() => router.push('/marketplace' as any)}
                activeOpacity={0.8}
              >
                <Coins color={COLORS.gold} size={15} />
                <Text style={styles.balancePillText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                  {formatNumber(twsBalance)} Coins
                </Text>
              </TouchableOpacity>
            )}
            <View style={styles.yourSideBadge}>
              <Text style={styles.yourSideLabel} numberOfLines={1}>Side:</Text>
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
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {userSide === 'WANTAM' ? 'WAN' : userSide === 'TUTAM' ? 'TUT' : userSide}
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
                <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  Supporters
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatNumber(wantamStats?.total_taps ?? 0)}</Text>
                <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  Total Taps
                </Text>
              </View>
            </View>
            <View style={styles.playRow}>
              <Play color={COLORS.white} size={20} fill={COLORS.white} />
              <Text style={styles.playText} numberOfLines={1}>TAP FOR</Text>
              <Text style={styles.playSideText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                WANTAM
              </Text>
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
                <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  Supporters
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatNumber(tutamStats?.total_taps ?? 0)}</Text>
                <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  Total Taps
                </Text>
              </View>
            </View>
            <View style={styles.playRow}>
              <Play color={COLORS.white} size={20} fill={COLORS.white} />
              <Text style={styles.playText} numberOfLines={1}>TAP FOR</Text>
              <Text style={styles.playSideText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                TUTAM
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/leaderboard')}>
            <Trophy color={COLORS.gold} size={20} />
            <Text style={styles.actionText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
              Leaders
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/totals')}>
            <Zap color={COLORS.white} size={20} />
            <Text style={styles.actionText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
              Totals
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.storeBanners}>
          <TouchableOpacity
            style={[styles.storeBanner, styles.housingBanner]}
            onPress={() => router.push({ pathname: '/marketplace', params: { tab: 'housing' } } as any)}
            activeOpacity={0.86}
          >
            <View style={styles.storeBannerIcon}>
              <Building2 color={COLORS.white} size={24} />
            </View>
            <View style={styles.storeBannerTextWrap}>
              <Text style={styles.storeBannerTitle}>Buy Affordable Housing Units</Text>
              <Text style={styles.storeBannerSubtitle}>Spend Coins on virtual homes</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.storeBanner, styles.carBanner]}
            onPress={() => router.push({ pathname: '/marketplace', params: { tab: 'cars' } } as any)}
            activeOpacity={0.86}
          >
            <View style={[styles.storeBannerIcon, styles.carBannerIcon]}>
              <Car color={COLORS.white} size={24} />
            </View>
            <View style={styles.storeBannerTextWrap}>
              <Text style={styles.storeBannerTitle}>Buy a Car</Text>
              <Text style={styles.storeBannerSubtitle}>Unlock toy luxury rides</Text>
            </View>
          </TouchableOpacity>
        </View>

         <View style={styles.bannerContainer}>
          <BannerAdvertisement />
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
    paddingBottom: 96,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontFamily: 'Inter-Black',
    fontSize: 27,
    color: COLORS.white,
    flexShrink: 1,
    maxWidth: '52%',
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
  balancePill: {
    minHeight: 32,
    maxWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  balancePillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.white,
    flexShrink: 1,
  },
  yourSideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  yourSideLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textMuted,
  },
  yourSideText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  battleContainer: {
    gap: 0,
    marginBottom: 24,
  },
  sideCard: {
    borderRadius: 20,
    padding: 22,
  },
  sideName: {
    fontFamily: 'Inter-Black',
    fontSize: 32,
    color: COLORS.white,
    marginBottom: 16,
  },
  sideStatsRow: {
    flexDirection: 'row',
    gap: 28,
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
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  playText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: COLORS.white,
  },
  playSideText: {
    fontFamily: 'Inter-Black',
    fontSize: 15,
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
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    minHeight: 64,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: COLORS.white,
    flexShrink: 1,
  },
  storeBanners: {
    gap: 12,
  },
  storeBanner: {
    minHeight: 86,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  housingBanner: {
    backgroundColor: COLORS.tutam,
  },
  carBanner: {
    backgroundColor: COLORS.wantam,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  storeBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  carBannerIcon: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  storeBannerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  storeBannerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: COLORS.white,
    marginBottom: 4,
  },
  storeBannerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
  },
    bannerContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    },
});
