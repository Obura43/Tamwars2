import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSideStats, SideStats } from '@/src/services/totalsService';
import { COLORS } from '@/lib/constants';
import { BarChart3 } from 'lucide-react-native';
import BannerAdvertisement from '@/components/BannerAd';

export default function TotalsScreen() {
  const [stats, setStats] = useState<SideStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    const data = await getSideStats();
    setStats(data);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const wantam = stats.find(s => s.side === 'WANTAM');
  const tutam = stats.find(s => s.side === 'TUTAM');

  const totalSupporters = (wantam?.unique_supporters ?? 0) + (tutam?.unique_supporters ?? 0);
  const totalTaps = (wantam?.total_taps ?? 0) + (tutam?.total_taps ?? 0);

  const supporterPercent = totalSupporters > 0
    ? Math.round(((wantam?.unique_supporters ?? 0) / totalSupporters) * 100)
    : 50;
  const tapPercent = totalTaps > 0
    ? Math.round(((wantam?.total_taps ?? 0) / totalTaps) * 100)
    : 50;

  const leading = (wantam?.total_taps ?? 0) >= (tutam?.total_taps ?? 0) ? 'WANTAM' : 'TUTAM';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
      >
        <View style={styles.header}>
          <BarChart3 color={COLORS.white} size={24} />
          <Text style={styles.title}>Live Totals</Text>
        </View>

        <View style={styles.leadingBanner}>
          <Text style={styles.leadingLabel}>Currently Leading</Text>
          <Text style={[styles.leadingText, { color: leading === 'WANTAM' ? COLORS.wantam : COLORS.tutam }]}>
            {leading}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unique Supporters</Text>
          <View style={styles.barContainer}>
            <View style={styles.barRow}>
              <View style={[styles.bar, styles.wantamBar, { flex: supporterPercent || 1 }]} />
              <View style={[styles.bar, styles.tutamBar, { flex: (100 - supporterPercent) || 1 }]} />
            </View>
            <View style={styles.barLabels}>
              <View style={styles.barLabel}>
                <View style={[styles.dot, { backgroundColor: COLORS.wantam }]} />
                <Text style={styles.barLabelText}>WANTAM</Text>
                <Text style={styles.barValue}>{(wantam?.unique_supporters ?? 0).toLocaleString()}</Text>
              </View>
              <View style={styles.barLabel}>
                <View style={[styles.dot, { backgroundColor: COLORS.tutam }]} />
                <Text style={styles.barLabelText}>TUTAM</Text>
                <Text style={styles.barValue}>{(tutam?.unique_supporters ?? 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.percentText}>{supporterPercent}% - {100 - supporterPercent}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Taps</Text>
          <View style={styles.barContainer}>
            <View style={styles.barRow}>
              <View style={[styles.bar, styles.wantamBar, { flex: tapPercent || 1 }]} />
              <View style={[styles.bar, styles.tutamBar, { flex: (100 - tapPercent) || 1 }]} />
            </View>
            <View style={styles.barLabels}>
              <View style={styles.barLabel}>
                <View style={[styles.dot, { backgroundColor: COLORS.wantam }]} />
                <Text style={styles.barLabelText}>WANTAM</Text>
                <Text style={styles.barValue}>{(wantam?.total_taps ?? 0).toLocaleString()}</Text>
              </View>
              <View style={styles.barLabel}>
                <View style={[styles.dot, { backgroundColor: COLORS.tutam }]} />
                <Text style={styles.barLabelText}>TUTAM</Text>
                <Text style={styles.barValue}>{(tutam?.total_taps ?? 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.percentText}>{tapPercent}% - {100 - tapPercent}%</Text>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Combined Total Taps</Text>
          <Text style={styles.totalValue}>{totalTaps.toLocaleString()}</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  leadingBanner: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leadingLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  leadingText: {
    fontFamily: 'Inter-Black',
    fontSize: 36,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 16,
  },
  barContainer: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    gap: 2,
  },
  bar: {
    borderRadius: 8,
  },
  wantamBar: {
    backgroundColor: COLORS.wantam,
  },
  tutamBar: {
    backgroundColor: COLORS.tutam,
  },
  barLabels: {
    gap: 8,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  barLabelText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  barValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
  },
  percentText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  totalCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  totalValue: {
    fontFamily: 'Inter-Black',
    fontSize: 36,
    color: COLORS.white,
  },
  bannerContainer: {
    marginTop: 20,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
