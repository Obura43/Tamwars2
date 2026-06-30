import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { getProfile, Profile } from '@/src/services/profileService';
import { getUserStats, getUserTapHistory, TapSession } from '@/src/services/gameService';
import {
  getOwnedVirtualAssets,
  getTwsBalance,
  getTwsTransactions,
  OwnedVirtualAsset,
  TwsWalletTransaction,
} from '@/src/services/walletService';
import { signOut } from '@/src/services/authService';
import { CAR_ITEMS, HOUSING_UNITS } from '@/src/data/marketplaceCatalog';
import { COLORS } from '@/lib/constants';
import { Building2, Car, ChevronDown, ChevronUp, Coins, LogOut, Settings, User } from 'lucide-react-native';

interface UserStats {
  bestScore: number;
  totalGames: number;
  totalTaps: number;
}

const TWS_PER_TAP = 3;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats>({ bestScore: 0, totalGames: 0, totalTaps: 0 });
  const [twsBalance, setTwsBalance] = useState(0);
  const [tapHistory, setTapHistory] = useState<TapSession[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<TwsWalletTransaction[]>([]);
  const [ownedAssets, setOwnedAssets] = useState<OwnedVirtualAsset[]>([]);
  const [assetsExpanded, setAssetsExpanded] = useState(false);
  const [walletExpanded, setWalletExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    const [profileData, userStats, balance, transactions, assets, history] = await Promise.all([
      getProfile(user.id),
      getUserStats(user.id),
      getTwsBalance(user.id),
      getTwsTransactions(user.id),
      getOwnedVirtualAssets(user.id),
      getUserTapHistory(user.id),
    ]);

    if (profileData) setProfile(profileData);
    setStats(userStats);
    setTwsBalance(balance);
    setWalletTransactions(transactions);
    setOwnedAssets(assets);
    setTapHistory(history);
  }, [user]);

  useEffect(() => {
    if (loading) return;

    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setStats({ bestScore: 0, totalGames: 0, totalTaps: 0 });
      setTwsBalance(0);
      setWalletTransactions([]);
      setTapHistory([]);
      setOwnedAssets([]);
      setAssetsExpanded(false);
      setWalletExpanded(false);
      setHistoryExpanded(false);
    }
  }, [fetchProfile, loading, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  const getTransactionTitle = (transaction: TwsWalletTransaction) => {
    switch (transaction.transaction_type) {
      case 'starter_bonus':
        return 'Starter Bonus';
      case 'tap_earning':
        return 'Tap Earnings';
      case 'drive_mission_reward':
        return 'Drive Mission Reward';
      case 'housing_purchase':
        return 'Housing Purchase';
      case 'car_purchase':
        return 'Car Purchase';
      case 'purchase_refund':
        return 'Purchase Refund';
      default:
        return 'TWS Transaction';
    }
  };

  const formatHistoryDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <View style={styles.guestIcon}>
            <User color={COLORS.white} size={34} />
          </View>
          <Text style={styles.guestTitle}>Create your profile</Text>
          <Text style={styles.guestText}>
            Sign up to save your score, pick your side, and appear on the leaderboard.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/signup')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Sign up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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

        <View style={styles.walletCard}>
          <View style={styles.walletIcon}>
            <Coins color={COLORS.gold} size={28} />
          </View>
          <View style={styles.walletContent}>
            <Text style={styles.walletLabel}>Spendable Balance</Text>
            <Text style={styles.walletValue}>{twsBalance.toLocaleString()} TWS</Text>
          </View>
          <TouchableOpacity
            style={styles.walletStoreButton}
            onPress={() => router.push('/marketplace' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.walletStoreButtonText}>Store</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => setWalletExpanded((expanded) => !expanded)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.historyTitle}>TWS Ledger</Text>
              <Text style={styles.historySubtitle}>Latest {walletTransactions.length} wallet entries</Text>
            </View>
            {walletExpanded ? (
              <ChevronUp color={COLORS.white} size={22} />
            ) : (
              <ChevronDown color={COLORS.white} size={22} />
            )}
          </TouchableOpacity>

          {walletExpanded && (
            <View style={styles.historyList}>
              {walletTransactions.length === 0 ? (
                <Text style={styles.historyEmpty}>No TWS transactions yet.</Text>
              ) : (
                walletTransactions.map((transaction) => {
                  const positive = transaction.amount > 0;

                  return (
                    <View key={transaction.id} style={styles.transactionRow}>
                      <View style={styles.transactionMain}>
                        <Text style={styles.transactionTitle}>{getTransactionTitle(transaction)}</Text>
                        <Text style={styles.transactionDate}>{formatHistoryDate(transaction.created_at)}</Text>
                      </View>
                      <Text style={[styles.transactionAmount, positive ? styles.transactionCredit : styles.transactionDebit]}>
                        {positive ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()} TWS
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>

        <View style={styles.historyCard}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => setHistoryExpanded((expanded) => !expanded)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.historyTitle}>Taps History</Text>
              <Text style={styles.historySubtitle}>Latest {tapHistory.length} validated sessions at 3 TWS per tap</Text>
            </View>
            {historyExpanded ? (
              <ChevronUp color={COLORS.white} size={22} />
            ) : (
              <ChevronDown color={COLORS.white} size={22} />
            )}
          </TouchableOpacity>

          {historyExpanded && (
            <View style={styles.historyList}>
              {tapHistory.length === 0 ? (
                <Text style={styles.historyEmpty}>No validated tap sessions yet.</Text>
              ) : (
                tapHistory.map((session) => (
                  <View key={session.id} style={styles.historyRow}>
                    <View style={styles.historySessionMeta}>
                      <Text style={styles.historyDate}>{formatHistoryDate(session.created_at)}</Text>
                      <Text
                        style={[
                          styles.historySide,
                          { color: session.side === 'WANTAM' ? COLORS.wantam : COLORS.tutam },
                        ]}
                      >
                        {session.side}
                      </Text>
                    </View>
                    <View style={styles.historySessionStats}>
                      <Text style={styles.historyTaps}>{session.tap_count.toLocaleString()} taps</Text>
                      <Text style={styles.historyCoins}>
                        {(session.tap_count * TWS_PER_TAP).toLocaleString()} TWS
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.historyCard}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => setAssetsExpanded((expanded) => !expanded)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.historyTitle}>My Assets</Text>
              <Text style={styles.historySubtitle}>
                {ownedAssets.length} owned virtual {ownedAssets.length === 1 ? 'asset' : 'assets'}
              </Text>
            </View>
            {assetsExpanded ? (
              <ChevronUp color={COLORS.white} size={22} />
            ) : (
              <ChevronDown color={COLORS.white} size={22} />
            )}
          </TouchableOpacity>

          {assetsExpanded && (
            <View style={styles.assetsList}>
              {ownedAssets.length === 0 ? (
                <View style={styles.assetsEmpty}>
                  <Text style={styles.historyEmpty}>No virtual assets yet.</Text>
                  <TouchableOpacity
                    style={styles.assetActionButton}
                    onPress={() => router.push('/marketplace' as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.assetActionText}>Open TW Store</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                ownedAssets.map((asset) => {
                  const car = CAR_ITEMS.find((item) => item.id === asset.asset_id);
                  const unit = HOUSING_UNITS.find((item) => item.id === asset.asset_id);
                  const isCar = asset.asset_type === 'car';

                  return (
                    <View key={asset.id} style={styles.assetRow}>
                      <View style={styles.assetIcon}>
                        {isCar ? (
                          <Car color={COLORS.gold} size={22} />
                        ) : (
                          <Building2 color={COLORS.gold} size={22} />
                        )}
                      </View>
                      <View style={styles.assetBody}>
                        <Text style={styles.assetName}>{asset.asset_name}</Text>
                        <Text style={styles.assetMeta}>
                          {isCar
                            ? car
                              ? `${car.className} - ${car.color}`
                              : 'Toy luxury car'
                            : unit
                            ? `${unit.location}, ${unit.city}`
                            : 'Virtual housing unit'}
                        </Text>
                        <Text style={styles.assetPrice}>{asset.price_tws.toLocaleString()} TWS</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.assetActionButton}
                        onPress={() => {
                          if (isCar) {
                            router.push({ pathname: '/car/[assetId]', params: { assetId: asset.id } } as any);
                            return;
                          }

                          router.push({ pathname: '/housing/[assetId]', params: { assetId: asset.id } } as any);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.assetActionText}>{isCar ? 'Drive' : 'View'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          )}
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
guestContainer: {
  flex: 1,
  justifyContent: 'center',
  paddingHorizontal: 32,
},
guestIcon: {
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: COLORS.surface,
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  borderWidth: 1,
  borderColor: COLORS.border,
  marginBottom: 20,
},
guestTitle: {
  fontFamily: 'Inter-Bold',
  fontSize: 26,
  color: COLORS.white,
  textAlign: 'center',
  marginBottom: 10,
},
guestText: {
  fontFamily: 'Inter-Regular',
  fontSize: 15,
  lineHeight: 22,
  color: COLORS.textSecondary,
  textAlign: 'center',
  marginBottom: 28,
},
primaryButton: {
  backgroundColor: COLORS.white,
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginBottom: 12,
},
primaryButtonText: {
  fontFamily: 'Inter-Bold',
  fontSize: 16,
  color: COLORS.background,
},
secondaryButton: {
  backgroundColor: COLORS.surface,
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: COLORS.border,
},
secondaryButtonText: {
  fontFamily: 'Inter-Bold',
  fontSize: 16,
  color: COLORS.white,
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
    marginBottom: 16,
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
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  walletIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletContent: {
    flex: 1,
  },
  walletLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  walletValue: {
    fontFamily: 'Inter-Black',
    fontSize: 28,
    color: COLORS.gold,
  },
  walletStoreButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletStoreButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.background,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  historyHeader: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 3,
  },
  historySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
  },
  historyList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  historyEmpty: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
    padding: 16,
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historySessionMeta: {
    flex: 1,
    minWidth: 0,
  },
  historyDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: COLORS.white,
    marginBottom: 4,
  },
  historySide: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  historySessionStats: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  historyTaps: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 4,
  },
  historyCoins: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.gold,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionMain: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 4,
  },
  transactionDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
  },
  transactionAmount: {
    fontFamily: 'Inter-Black',
    fontSize: 14,
    textAlign: 'right',
    flexShrink: 0,
  },
  transactionCredit: {
    color: COLORS.success,
  },
  transactionDebit: {
    color: COLORS.error,
  },
  assetsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  assetsEmpty: {
    padding: 16,
    alignItems: 'center',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetBody: {
    flex: 1,
    minWidth: 0,
  },
  assetName: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 3,
  },
  assetMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  assetPrice: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: COLORS.gold,
  },
  assetActionButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetActionText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.background,
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
