import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, Car, Check, ChevronLeft, Coins, Lock } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { COLORS } from '@/lib/constants';
import { CAR_ITEMS, HOUSING_UNITS } from '@/src/data/marketplaceCatalog';
import {
  claimRewardedAdBonus,
  getOwnedVirtualAssets,
  getTwsBalance,
  OwnedVirtualAsset,
  purchaseVirtualAsset,
} from '@/src/services/walletService';
import BannerAdvertisement from '@/components/BannerAd';
import { showRewardedAd } from '@/components/RewardedAd';

type MarketplaceTab = 'housing' | 'cars';
type HousingCityFilter = 'All' | 'Kisumu' | 'Nairobi' | 'Mombasa' | 'Nakuru';
type HousingTypeFilter = 'All' | 'Single Room' | 'One Bedroom' | 'Two Bedroom';
type OwnershipFilter = 'All' | 'Affordable' | 'Owned';

const HOUSING_CITY_FILTERS: HousingCityFilter[] = ['All', 'Nairobi', 'Kisumu', 'Mombasa', 'Nakuru'];
const HOUSING_TYPE_FILTERS: HousingTypeFilter[] = ['All', 'Single Room', 'One Bedroom', 'Two Bedroom'];
const OWNERSHIP_FILTERS: OwnershipFilter[] = ['All', 'Affordable', 'Owned'];
const CAR_CLASS_FILTERS = ['All', ...Array.from(new Set(CAR_ITEMS.map((car) => car.className)))];
const REWARDED_AD_COINS = 100000;

export default function MarketplaceScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>(tab === 'cars' ? 'cars' : 'housing');
  const [balance, setBalance] = useState(0);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [ownedAssets, setOwnedAssets] = useState<OwnedVirtualAsset[]>([]);
  const [housingCityFilter, setHousingCityFilter] = useState<HousingCityFilter>('All');
  const [housingTypeFilter, setHousingTypeFilter] = useState<HousingTypeFilter>('All');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('All');
  const [carClassFilter, setCarClassFilter] = useState('All');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);

  const loadWallet = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setOwnedIds(new Set());
      setOwnedAssets([]);
      return;
    }

    const [nextBalance, assets] = await Promise.all([
      getTwsBalance(user.id),
      getOwnedVirtualAssets(user.id),
    ]);

    setBalance(nextBalance);
    setOwnedIds(new Set(assets.map((asset) => asset.asset_id)));
    setOwnedAssets(assets);
  }, [user]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    if (tab === 'cars' || tab === 'housing') {
      setActiveTab(tab);
    }
  }, [tab]);

  const visibleHousing = useMemo(
    () =>
      HOUSING_UNITS.filter((unit) => {
        const cityMatches = housingCityFilter === 'All' || unit.city === housingCityFilter;
        const typeMatches = housingTypeFilter === 'All' || unit.type === housingTypeFilter;
        const owned = ownedIds.has(unit.id);
        const affordabilityMatches =
          ownershipFilter === 'All' ||
          (ownershipFilter === 'Affordable' && balance >= unit.priceTws && !owned) ||
          (ownershipFilter === 'Owned' && owned);
        return cityMatches && typeMatches && affordabilityMatches;
      }),
    [balance, housingCityFilter, housingTypeFilter, ownedIds, ownershipFilter]
  );

  const visibleCars = useMemo(
    () =>
      CAR_ITEMS.filter((car) => {
        const classMatches = carClassFilter === 'All' || car.className === carClassFilter;
        const owned = ownedIds.has(car.id);
        const affordabilityMatches =
          ownershipFilter === 'All' ||
          (ownershipFilter === 'Affordable' && balance >= car.priceTws && !owned) ||
          (ownershipFilter === 'Owned' && owned);
        return classMatches && affordabilityMatches;
      }),
    [balance, carClassFilter, ownedIds, ownershipFilter]
  );

  const ownedHousingCount = ownedAssets.filter((asset) => asset.asset_type === 'housing').length;
  const ownedCarCount = ownedAssets.filter((asset) => asset.asset_type === 'car').length;

  const renderMarketplaceAd = (key: string) => (
    <View key={key} style={styles.adContainer}>
      <BannerAdvertisement />
    </View>
  );

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const makeRewardId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const handleRewardedAdBonus = async () => {
    if (!user || rewardLoading) return;

    setRewardLoading(true);
    const earnedReward = await showRewardedAd();

    if (!earnedReward) {
      setRewardLoading(false);
      showMessage('Ad not completed', 'Watch the full rewarded ad to earn Coins.');
      return;
    }

    const result = await claimRewardedAdBonus(makeRewardId());
    setRewardLoading(false);

    if (!result.success) {
      showMessage('Reward failed', result.error);
      return;
    }

    await loadWallet();
    showMessage('Coins added', `You earned ${result.amount.toLocaleString()} Coins.`);
  };

  const offerRewardedAdBonus = (assetName: string, price: number) => {
    const message = `You need ${price.toLocaleString()} Coins to buy ${assetName}. Watch a rewarded ad to earn ${REWARDED_AD_COINS.toLocaleString()} Coins?`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        handleRewardedAdBonus();
      }
      return;
    }

    Alert.alert('Not enough Coins', message, [
      { text: 'Not now', style: 'cancel' },
      {
        text: rewardLoading ? 'Loading...' : 'Watch Ad',
        onPress: handleRewardedAdBonus,
      },
    ]);
  };

  const handleBuy = async (asset: {
    type: 'housing' | 'car';
    id: string;
    name: string;
    priceTws: number;
  }) => {
    if (!user) {
      router.push('/signup');
      return;
    }

    if (ownedIds.has(asset.id)) return;

    if (balance < asset.priceTws) {
      offerRewardedAdBonus(asset.name, asset.priceTws);
      return;
    }

    setBuyingId(asset.id);
    const result = await purchaseVirtualAsset(asset);
    setBuyingId(null);

    if (!result.success) {
      showMessage('Purchase failed', result.error);
      return;
    }

    await loadWallet();
    showMessage('Purchase complete', `${asset.name} is now in your TamWar assets.`);

    if (asset.type === 'housing') {
      router.push({ pathname: '/housing/[assetId]', params: { assetId: result.ownedAssetId } } as any);
    } else {
      router.push({ pathname: '/car/[assetId]', params: { assetId: result.ownedAssetId } } as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <ChevronLeft color={COLORS.white} size={24} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>TW Store</Text>
            <Text style={styles.subtitle}>Spend your earned Coins on virtual assets</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Coins color={COLORS.gold} size={28} />
          <View style={styles.balanceTextWrap}>
            <Text style={styles.balanceLabel}>Spendable Balance</Text>
            <Text style={styles.balanceValue}>{balance.toLocaleString()} Coins</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{ownedHousingCount}</Text>
            <Text style={styles.summaryLabel}>Homes Owned</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{ownedCarCount}</Text>
            <Text style={styles.summaryLabel}>Cars Owned</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{ownedAssets.length}</Text>
            <Text style={styles.summaryLabel}>Total Assets</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'housing' && styles.tabButtonActive]}
            onPress={() => setActiveTab('housing')}
            activeOpacity={0.8}
          >
            <Building2 color={activeTab === 'housing' ? COLORS.background : COLORS.white} size={18} />
            <Text style={[styles.tabText, activeTab === 'housing' && styles.tabTextActive]}>Housing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'cars' && styles.tabButtonActive]}
            onPress={() => setActiveTab('cars')}
            activeOpacity={0.8}
          >
            <Car color={activeTab === 'cars' ? COLORS.background : COLORS.white} size={18} />
            <Text style={[styles.tabText, activeTab === 'cars' && styles.tabTextActive]}>Cars</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'housing' ? (
          <View style={styles.catalogList}>
            <Text style={styles.cityNote}>These are virtual TamWar housing collectibles bought with Coins, not real property.</Text>
            <View style={styles.filterPanel}>
              <Text style={styles.filterLabel}>Show</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {OWNERSHIP_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, ownershipFilter === filter && styles.filterChipActive]}
                    onPress={() => setOwnershipFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, ownershipFilter === filter && styles.filterChipTextActive]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.filterLabel, styles.filterLabelSpaced]}>City</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {HOUSING_CITY_FILTERS.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.filterChip, housingCityFilter === city && styles.filterChipActive]}
                    onPress={() => setHousingCityFilter(city)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, housingCityFilter === city && styles.filterChipTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.filterLabel, styles.filterLabelSpaced]}>Unit Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {HOUSING_TYPE_FILTERS.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.filterChip, housingTypeFilter === type && styles.filterChipActive]}
                    onPress={() => setHousingTypeFilter(type)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, housingTypeFilter === type && styles.filterChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {visibleHousing.length === 0 && (
              <Text style={styles.emptyCatalogText}>No units match these filters.</Text>
            )}
            {visibleHousing.map((unit, index) => {
              const owned = ownedIds.has(unit.id);
              const ownedAsset = ownedAssets.find((asset) => asset.asset_id === unit.id);
              const canAfford = balance >= unit.priceTws;

              return (
                <View key={unit.id}>
                  {index === 1 && renderMarketplaceAd('housing-ad-top')}
                  <View style={styles.assetCard}>
                  <View style={styles.assetTopRow}>
                    <View style={styles.assetIcon}>
                      <Building2 color={COLORS.gold} size={24} />
                    </View>
                    <View style={styles.assetMain}>
                      <Text style={styles.assetName}>{unit.type}</Text>
                      <Text style={styles.assetMeta}>{unit.project}</Text>
                    </View>
                    <Text style={styles.assetPrice}>{unit.priceTws.toLocaleString()} Coins</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>City</Text>
                    <Text style={styles.detailValue}>{unit.city}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{unit.location}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      owned && styles.ownedButton,
                      !owned && !canAfford && styles.lockedButton,
                    ]}
                    onPress={() => {
                      if (owned && ownedAsset) {
                        router.push({ pathname: '/housing/[assetId]', params: { assetId: ownedAsset.id } } as any);
                        return;
                      }

                      handleBuy({
                        type: 'housing',
                        id: unit.id,
                        name: `${unit.project} ${unit.type}`,
                        priceTws: unit.priceTws,
                      });
                    }}
                    disabled={buyingId === unit.id}
                    activeOpacity={0.8}
                  >
                    {owned ? <Check color={COLORS.background} size={18} /> : !canAfford ? <Lock color={COLORS.white} size={18} /> : null}
                    <Text style={[styles.buyButtonText, owned && styles.ownedButtonText]}>
                      {owned ? 'View Unit' : buyingId === unit.id ? 'Buying...' : canAfford ? 'Buy Unit' : 'Earn More Coins'}
                    </Text>
                  </TouchableOpacity>
                </View>
                  {index === 4 && renderMarketplaceAd('housing-ad-bottom')}
                </View>
              );
            })}
            {visibleHousing.length > 0 && visibleHousing.length <= 1 && renderMarketplaceAd('housing-ad-top-short')}
            {visibleHousing.length > 0 && visibleHousing.length <= 4 && renderMarketplaceAd('housing-ad-bottom-short')}
          </View>
        ) : (
          <View style={styles.catalogList}>
            <Text style={styles.cityNote}>Toy luxury cars unlock Nairobi City driving in the next game layer.</Text>
            <View style={styles.filterPanel}>
              <Text style={styles.filterLabel}>Show</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {OWNERSHIP_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, ownershipFilter === filter && styles.filterChipActive]}
                    onPress={() => setOwnershipFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, ownershipFilter === filter && styles.filterChipTextActive]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.filterLabel, styles.filterLabelSpaced]}>Class</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {CAR_CLASS_FILTERS.map((className) => (
                  <TouchableOpacity
                    key={className}
                    style={[styles.filterChip, carClassFilter === className && styles.filterChipActive]}
                    onPress={() => setCarClassFilter(className)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, carClassFilter === className && styles.filterChipTextActive]}>
                      {className}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {visibleCars.length === 0 && (
              <Text style={styles.emptyCatalogText}>No cars match these filters.</Text>
            )}
            {visibleCars.map((car, index) => {
              const owned = ownedIds.has(car.id);
              const ownedAsset = ownedAssets.find((asset) => asset.asset_id === car.id);
              const canAfford = balance >= car.priceTws;

              return (
                <View key={car.id}>
                  {index === 1 && renderMarketplaceAd('cars-ad-top')}
                  <View style={styles.assetCard}>
                  <View style={styles.assetTopRow}>
                    <View style={styles.assetIcon}>
                      <Car color={COLORS.gold} size={24} />
                    </View>
                    <View style={styles.assetMain}>
                      <Text style={styles.assetName}>{car.name}</Text>
                      <Text style={styles.assetMeta}>{car.className} - {car.color}</Text>
                    </View>
                    <Text style={styles.assetPrice}>{car.priceTws.toLocaleString()} Coins</Text>
                  </View>
                  <View style={styles.carStats}>
                    <View style={styles.carStat}>
                      <Text style={styles.detailLabel}>Speed</Text>
                      <Text style={styles.detailValue}>{car.speed}</Text>
                    </View>
                    <View style={styles.carStat}>
                      <Text style={styles.detailLabel}>Handling</Text>
                      <Text style={styles.detailValue}>{car.handling}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      owned && styles.ownedButton,
                      !owned && !canAfford && styles.lockedButton,
                    ]}
                    onPress={() => {
                      if (owned && ownedAsset) {
                        router.push({ pathname: '/car/[assetId]', params: { assetId: ownedAsset.id } } as any);
                        return;
                      }

                      handleBuy({
                        type: 'car',
                        id: car.id,
                        name: car.name,
                        priceTws: car.priceTws,
                      });
                    }}
                    disabled={buyingId === car.id}
                    activeOpacity={0.8}
                  >
                    {owned ? <Check color={COLORS.background} size={18} /> : !canAfford ? <Lock color={COLORS.white} size={18} /> : null}
                    <Text style={[styles.buyButtonText, owned && styles.ownedButtonText]}>
                      {owned ? 'Garage' : buyingId === car.id ? 'Buying...' : canAfford ? 'Buy Car' : 'Earn More Coins'}
                    </Text>
                  </TouchableOpacity>
                </View>
                  {index === 2 && renderMarketplaceAd('cars-ad-bottom')}
                </View>
              );
            })}
            {visibleCars.length > 0 && visibleCars.length <= 1 && renderMarketplaceAd('cars-ad-top-short')}
            {visibleCars.length > 0 && visibleCars.length <= 2 && renderMarketplaceAd('cars-ad-bottom-short')}
          </View>
        )}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitleWrap: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Black',
    fontSize: 28,
    color: COLORS.white,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    minHeight: 70,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  summaryValue: {
    fontFamily: 'Inter-Black',
    fontSize: 20,
    color: COLORS.white,
    marginBottom: 3,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  balanceTextWrap: {
    flex: 1,
  },
  balanceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  balanceValue: {
    fontFamily: 'Inter-Black',
    fontSize: 24,
    color: COLORS.gold,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  tabText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
  },
  tabTextActive: {
    color: COLORS.background,
  },
  catalogList: {
    gap: 14,
  },
  adContainer: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cityNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  filterPanel: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  filterLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.white,
    marginBottom: 10,
  },
  filterLabelSpaced: {
    marginTop: 14,
  },
  filterRow: {
    gap: 8,
    paddingRight: 4,
  },
  filterChip: {
    minHeight: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  filterChipText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: COLORS.white,
  },
  filterChipTextActive: {
    color: COLORS.background,
  },
  emptyCatalogText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 18,
  },
  assetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  assetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  assetIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  assetMain: {
    flex: 1,
    minWidth: 0,
  },
  assetName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 3,
  },
  assetMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  assetPrice: {
    fontFamily: 'Inter-Black',
    fontSize: 14,
    color: COLORS.gold,
    textAlign: 'right',
    maxWidth: 112,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: COLORS.white,
    textAlign: 'right',
  },
  carStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  carStat: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  buyButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  lockedButton: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ownedButton: {
    backgroundColor: COLORS.gold,
  },
  buyButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: COLORS.background,
  },
  ownedButtonText: {
    color: COLORS.background,
  },
});
