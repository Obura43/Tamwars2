import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car, ChevronLeft, Gauge, Palette, ShieldCheck, Store } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { COLORS } from '@/lib/constants';
import { CAR_ITEMS } from '@/src/data/marketplaceCatalog';
import { getOwnedVirtualAssets, OwnedVirtualAsset } from '@/src/services/walletService';

export default function CarDetailScreen() {
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

    router.replace({ pathname: '/marketplace', params: { tab: 'cars' } } as any);
  };

  const loadAsset = useCallback(async () => {
    if (!user) {
      setAsset(null);
      setLoading(false);
      return;
    }

    const assets = await getOwnedVirtualAssets(user.id);
    setAsset(assets.find((item) => item.id === assetId && item.asset_type === 'car') ?? null);
    setLoading(false);
  }, [assetId, user]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  const car = useMemo(
    () => CAR_ITEMS.find((item) => item.id === asset?.asset_id) ?? null,
    [asset?.asset_id]
  );

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));

  const getCarPaint = () => {
    if (car?.color === 'Volcano Red') return COLORS.wantam;
    if (car?.color === 'Champagne Gold') return COLORS.gold;
    if (car?.color === 'Midnight Black') return '#050505';
    return COLORS.white;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading garage...</Text>
      </SafeAreaView>
    );
  }

  if (!asset) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Car color={COLORS.gold} size={46} />
          <Text style={styles.emptyTitle}>Car not found</Text>
          <Text style={styles.emptyText}>This toy luxury car is not in your garage.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={goBackOrStore} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const carName = car?.name ?? asset.asset_name;
  const carClass = car?.className ?? 'Toy luxury car';
  const carColor = car?.color ?? 'Custom';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBackOrStore} activeOpacity={0.8}>
            <ChevronLeft color={COLORS.white} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Garage</Text>
            <Text style={styles.subtitle}>Virtual TamWar car</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.carStage}>
            <View style={[styles.carBody, { backgroundColor: getCarPaint() }]}>
              <View style={styles.windshield} />
              <View style={styles.sideWindowRow}>
                <View style={styles.sideWindow} />
                <View style={styles.sideWindow} />
              </View>
              <View style={styles.frontGrille} />
            </View>
            <View style={styles.wheelRow}>
              <View style={styles.wheel} />
              <View style={styles.wheel} />
            </View>
          </View>
          <Text style={styles.carName}>{carName}</Text>
          <Text style={styles.carClass}>{carClass}</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Gauge color={COLORS.gold} size={20} />
            <Text style={styles.summaryLabel}>Speed</Text>
            <Text style={styles.summaryValue}>{car?.speed ?? 0}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Palette color={COLORS.gold} size={20} />
            <Text style={styles.summaryLabel}>Paint</Text>
            <Text style={styles.summaryValue}>{carColor}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Handling</Text>
            <Text style={styles.detailValue}>{car?.handling ?? 0}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bought For</Text>
            <Text style={styles.detailValue}>{asset.price_tws.toLocaleString()} Coins</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purchased</Text>
            <Text style={styles.detailValue}>{formatDate(asset.purchased_at)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.driveButton}
            onPress={() => router.push({ pathname: '/drive', params: { carId: asset.asset_id } } as any)}
            activeOpacity={0.8}
          >
            <Car color={COLORS.background} size={19} />
            <Text style={styles.driveButtonText}>Drive in Nairobi City</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.storeButton}
            onPress={() => router.push({ pathname: '/marketplace', params: { tab: 'cars' } } as any)}
            activeOpacity={0.8}
          >
            <Store color={COLORS.white} size={18} />
            <Text style={styles.storeButtonText}>View More Cars</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noticeCard}>
          <ShieldCheck color={COLORS.success} size={22} />
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>TamWar virtual car</Text>
            <Text style={styles.noticeText}>
              This is an in-app toy vehicle bought with Coins. It unlocks driving play inside TamWar only.
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
  carStage: {
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  carBody: {
    width: 190,
    height: 82,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  windshield: {
    width: 82,
    height: 24,
    borderRadius: 10,
    backgroundColor: '#6AB7FF',
    marginTop: 12,
  },
  sideWindowRow: {
    flexDirection: 'row',
    gap: 46,
    marginTop: 6,
  },
  sideWindow: {
    width: 30,
    height: 14,
    borderRadius: 6,
    backgroundColor: 'rgba(106,183,255,0.85)',
  },
  frontGrille: {
    width: 92,
    height: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginTop: 8,
  },
  wheelRow: {
    flexDirection: 'row',
    gap: 116,
    marginTop: -10,
  },
  wheel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#050505',
    borderWidth: 4,
    borderColor: COLORS.surfaceLight,
  },
  carName: {
    fontFamily: 'Inter-Black',
    fontSize: 26,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  carClass: {
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
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  driveButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  driveButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: COLORS.background,
  },
  storeButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  storeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: COLORS.white,
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
