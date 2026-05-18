import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLeaderboard, LeaderboardEntry } from '@/services/leaderboardService';
import { COLORS } from '@/lib/constants';
import { Trophy } from 'lucide-react-native';

type TimeFilter = 'today' | 'week' | 'alltime';
type SideFilter = 'all' | 'WANTAM' | 'TUTAM';

export default function LeaderboardScreen() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [sideFilter, setSideFilter] = useState<SideFilter>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchLeaderboard = useCallback(async () => {
    setError('');
    const data = await getLeaderboard(timeFilter, sideFilter);
    setEntries(data);
    setLoading(false);
  }, [timeFilter, sideFilter]);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return COLORS.gold;
    if (rank === 2) return COLORS.silver;
    if (rank === 3) return COLORS.bronze;
    return COLORS.textMuted;
  };

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const displayRank = index + 1;
    return (
      <View style={styles.row}>
        <View style={styles.rankCol}>
          <Text style={[styles.rankText, { color: getRankColor(displayRank) }]}>
            {displayRank <= 3 ? (displayRank === 1 ? '1st' : displayRank === 2 ? '2nd' : '3rd') : `#${displayRank}`}
          </Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.county}>{item.county}</Text>
        </View>
        <View style={[styles.sideBadge, { backgroundColor: item.side === 'WANTAM' ? COLORS.wantam : COLORS.tutam }]}>
          <Text style={styles.sideBadgeText}>{item.side.charAt(0)}</Text>
        </View>
        <Text style={styles.tapCount}>{item.tap_count.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Trophy color={COLORS.gold} size={24} />
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      <View style={styles.timeFilters}>
        {(['today', 'week', 'alltime'] as TimeFilter[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterButton, timeFilter === t && styles.filterActive]}
            onPress={() => setTimeFilter(t)}
          >
            <Text style={[styles.filterText, timeFilter === t && styles.filterTextActive]}>
              {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sideFilters}>
        {(['all', 'WANTAM', 'TUTAM'] as SideFilter[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.sideFilterButton,
              sideFilter === s && {
                backgroundColor: s === 'WANTAM' ? COLORS.wantam : s === 'TUTAM' ? COLORS.tutam : COLORS.surfaceLight,
              },
            ]}
            onPress={() => setSideFilter(s)}
          >
            <Text style={[styles.sideFilterText, sideFilter === s && styles.sideFilterTextActive]}>
              {s === 'all' ? 'All' : s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  timeFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  filterText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.background,
  },
  sideFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  sideFilterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sideFilterText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sideFilterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rankCol: {
    width: 44,
  },
  rankText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
  },
  infoCol: {
    flex: 1,
  },
  username: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: COLORS.white,
  },
  county: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
  },
  sideBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sideBadgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: COLORS.white,
  },
  tapCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textMuted,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
