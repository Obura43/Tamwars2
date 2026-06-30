import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, ChevronLeft, Coins, MapPin, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { COLORS } from '@/lib/constants';
import { HOUSING_UNITS } from '@/src/data/marketplaceCatalog';
import { getOwnedVirtualAssets, OwnedVirtualAsset } from '@/src/services/walletService';

export default function HousingDetailScreen() {
  const router = useRouter();
  const { assetId } = useLocalSearchParams<{ assetId: string }>();
  const { user } = useAuth();
  const [asset, setAsset] = useState<OwnedVirtualAsset | null>(null);
  const [loading, setLoading] = useState(true);

  const goBackOrStore = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({ pathname: '/marketplace', params: { tab: 'housing' } } as any);
  };

  const loadAsset = useCallback(async () => {
    if (!user) {
      setAsset(null);
      setLoading(false);
      return;
    }

    const assets = await getOwnedVirtualAssets(user.id);
    setAsset(assets.find((item) => item.id === assetId && item.asset_type === 'housing') ?? null);
    setLoading(false);
  }, [assetId, user]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  const unit = useMemo(
    () => HOUSING_UNITS.find((item) => item.id === asset?.asset_id) ?? null,
    [asset?.asset_id]
  );

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading unit...</Text>
      </SafeAreaView>
    );
  }

  if (!asset) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Building2 color={COLORS.gold} size={46} />
          <Text style={styles.emptyTitle}>Unit not found</Text>
          <Text style={styles.emptyText}>This virtual housing unit is not in your assets.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={goBackOrStore} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const unitType = unit?.type ?? 'Virtual Housing Unit';
  const project = unit?.project ?? asset.asset_name;
  const location = unit ? `${unit.location}, ${unit.city}` : 'TamWar City';
  const bedrooms = unit ? (unit.bedrooms === 0 ? 'Single room' : `${unit.bedrooms} bedroom`) : 'Virtual unit';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBackOrStore} activeOpacity={0.8}>
            <ChevronLeft color={COLORS.white} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Housing Unit</Text>
            <Text style={styles.subtitle}>Virtual TamWar asset</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.buildingArt}>
            <View style={styles.tower}>
              <View style={styles.windowGrid}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <View key={index} style={styles.window} />
                ))}
              </View>
            </View>
            <View style={styles.towerSmall}>
              <View style={styles.windowGridSmall}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <View key={index} style={styles.window} />
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.projectName}>{project}</Text>
          <Text style={styles.unitType}>{unitType}</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <MapPin color={COLORS.gold} size={20} />
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue}>{location}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Coins color={COLORS.gold} size={20} />
            <Text style={styles.summaryLabel}>Value</Text>
            <Text style={styles.summaryValue}>{asset.price_tws.toLocaleString()} Coins</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unit Type</Text>
            <Text style={styles.detailValue}>{bedrooms}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purchased</Text>
            <Text style={styles.detailValue}>{formatDate(asset.purchased_at)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ownership</Text>
            <Text style={styles.detailValue}>Verified</Text>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <ShieldCheck color={COLORS.success} size={22} />
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>TamWar virtual property</Text>
            <Text style={styles.noticeText}>
              This is an in-app collectible bought with Coins. It is not real-world property or a legal claim to housing.
            </Text>
          </View>
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
    paddingBottom: 40,
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
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
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
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  buildingArt: {
    height: 150,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  tower: {
    width: 96,
    height: 136,
    borderRadius: 10,
    backgroundColor: COLORS.tutam,
    padding: 12,
    justifyContent: 'center',
  },
  towerSmall: {
    width: 72,
    height: 104,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    padding: 12,
    justifyContent: 'center',
  },
  windowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  windowGridSmall: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  window: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  projectName: {
    fontFamily: 'Inter-Black',
    fontSize: 24,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  unitType: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minHeight: 112,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 10,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: COLORS.white,
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.white,
    textAlign: 'right',
    flexShrink: 1,
  },
  noticeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 4,
  },
  noticeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryButton: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: COLORS.background,
  },
});
