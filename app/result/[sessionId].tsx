import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession, getGlobalRank, markPendingScoreClaim, TapSession } from '@/src/services/gameService';
import { COLORS } from '@/lib/constants';
import { Share2, Home, RotateCcw, Coins } from 'lucide-react-native';
import BannerAdvertisement from '@/components/BannerAd';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const COINS_PER_TAP = 3;

export default function ResultScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<TapSession | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const entrance = useSharedValue(0);
  const scorePulse = useSharedValue(1);
  const rankPopup = useSharedValue(0);
  const coinsPulse = useSharedValue(1);

  useEffect(() => {
    fetchResult();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;

    entrance.value = 0;
    scorePulse.value = 1;
    rankPopup.value = 0;
    coinsPulse.value = 1;
    entrance.value = withTiming(1, {
      duration: 620,
      easing: Easing.out(Easing.cubic),
    });
    scorePulse.value = withDelay(240, withSequence(withSpring(1.08), withSpring(1)));
    rankPopup.value = withDelay(
      1650,
      withSpring(1, {
        damping: 13,
        stiffness: 130,
      })
    );
    coinsPulse.value = withDelay(2050, withSequence(withSpring(1.08), withSpring(1)));

    const totalCoins = session.validated ? session.tap_count * COINS_PER_TAP : 0;
    const scoreDuration = 1350;
    const coinDuration = 2200;
    const coinDelay = 1950;
    const start = Date.now();
    setDisplayedScore(0);
    setDisplayedCoins(0);

    const scoreInterval = setInterval(() => {
      const progress = Math.min((Date.now() - start) / scoreDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(session.tap_count * eased));

      if (progress >= 1) {
        clearInterval(scoreInterval);
      }
    }, 16);

    let coinInterval: ReturnType<typeof setInterval> | null = null;
    const coinTimeout = setTimeout(() => {
      const coinStart = Date.now();
      coinInterval = setInterval(() => {
        const progress = Math.min((Date.now() - coinStart) / coinDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayedCoins(Math.round(totalCoins * eased));

        if (progress >= 1) {
          if (coinInterval) clearInterval(coinInterval);
        }
      }, 16);
    }, coinDelay);

    return () => {
      clearInterval(scoreInterval);
      clearTimeout(coinTimeout);
      if (coinInterval) clearInterval(coinInterval);
    };
  }, [coinsPulse, entrance, rankPopup, scorePulse, session]);

  const pageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [
      { translateY: 24 * (1 - entrance.value) },
      { scale: 0.98 + entrance.value * 0.02 },
    ],
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scorePulse.value }],
  }));

  const rankAnimatedStyle = useAnimatedStyle(() => ({
    opacity: rankPopup.value,
    transform: [
      { translateY: 18 * (1 - rankPopup.value) },
      { scale: 0.86 + rankPopup.value * 0.14 },
    ],
  }));

  const coinsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coinsPulse.value }],
  }));

  const fetchResult = async () => {
    const data = await getSession(sessionId);
    if (data) {
      setSession(data);
      if (data.validated && data.user_id !== 'guest') {
        const r = await getGlobalRank(data.tap_count);
        setRank(r);
      }
    } else {
      setError('Could not load your result. Please go back to home.');
    }
  };

  const handleShare = async () => {
    if (!session || sharing) return;

    setSharing(true);
    const playLink = 'https://play.google.com/store/apps/details?id=com.tamwar.app';
    const message = `I scored ${session.tap_count.toLocaleString()} taps for ${session.side} on TamWar! Can you beat me? Get TamWar: ${playLink}`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ text: message });
        } else {
          await navigator.clipboard?.writeText(message);
        }
      } else {
        await Share.share({ message });
      }
    } catch {
      if (Platform.OS === 'web') {
        await navigator.clipboard?.writeText(message);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleClaimScore = async () => {
    if (!session || session.user_id !== 'guest') return;

    await markPendingScoreClaim(session.id);
    router.push({ pathname: '/signup', params: { claimScore: '1' } });
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {error ? (
            <>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/(tabs)/home')}>
                <Text style={styles.homeButtonText}>Go Home</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.loadingText}>Loading result...</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const sideColor = session.side === 'WANTAM' ? COLORS.wantam : COLORS.tutam;
  const isGuestResult = session.user_id === 'guest';
  const coinsEarned = session.validated ? session.tap_count * COINS_PER_TAP : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.content, pageAnimatedStyle]}>
        {session.suspicious && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>Score flagged as suspicious and won't appear on leaderboard</Text>
          </View>
        )}

        <Text style={[styles.sideText, { color: sideColor }]}>{session.side}</Text>
        <Animated.View style={[styles.scoreCard, scoreAnimatedStyle]}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreValue}>{displayedScore.toLocaleString()}</Text>
          <Text style={styles.tapsText}>taps in 60 seconds</Text>
        </Animated.View>

        {isGuestResult && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>Saved on this device</Text>
          </View>
        )}

        {rank && session.validated && (
          <Animated.View style={[styles.rankBadge, rankAnimatedStyle]}>
            <Text style={styles.rankLabel}>Global Rank</Text>
            <Text style={styles.rankValue}>#{rank}</Text>
          </Animated.View>
        )}

        <Animated.View style={[styles.coinsCard, { borderColor: sideColor }, coinsAnimatedStyle]}>
          <View style={styles.coinsIcon}>
            <Coins color={COLORS.gold} size={26} />
          </View>
          <Text style={styles.coinsLabel}>Coins Earned</Text>
          <Text style={styles.coinsValue}>{displayedCoins.toLocaleString()}</Text>
          <Text style={styles.coinsFormula}>
            {session.validated ? `${session.tap_count.toLocaleString()} taps x ${COINS_PER_TAP} Coins` : 'Invalid sessions earn 0 Coins'}
          </Text>
        </Animated.View>

        {displayedCoins === coinsEarned && session.validated ? (
          <Text style={styles.coinsCompleteText}>
            {isGuestResult ? 'Sign up to claim these Coins' : 'Added to your spendable balance'}
          </Text>
        ) : null}

        <View style={styles.bannerContainer}>
          <BannerAdvertisement />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
            onPress={handleShare}
            disabled={sharing}
            activeOpacity={0.8}
          >
            <Share2 color={COLORS.white} size={20} />
            <Text style={styles.shareText}>{sharing ? 'Sharing...' : 'Share Result'}</Text>
          </TouchableOpacity>

          {isGuestResult && (
            <TouchableOpacity style={styles.claimButton} onPress={handleClaimScore} activeOpacity={0.8}>
              <Text style={styles.claimButtonText}>Claim Score</Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.replace(`/battle/${session.side}`)}
              activeOpacity={0.8}
            >
              <RotateCcw color={COLORS.white} size={18} />
              <Text style={styles.actionButtonText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.replace('/(tabs)/home')}
              activeOpacity={0.8}
            >
              <Home color={COLORS.white} size={18} />
              <Text style={styles.actionButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  homeButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  homeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.background,
  },
  warningBanner: {
    backgroundColor: 'rgba(255,68,68,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  warningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.error,
    textAlign: 'center',
  },
  sideText: {
    fontFamily: 'Inter-Black',
    fontSize: 36,
    marginBottom: 8,
  },
  scoreCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: 'Inter-Black',
    fontSize: 72,
    color: COLORS.gold,
  },
  tapsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  rankBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  localBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  localBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  rankLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rankValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.white,
  },
  coinsCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  coinsIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    marginBottom: 8,
  },
  coinsLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  coinsValue: {
    fontFamily: 'Inter-Black',
    fontSize: 42,
    color: COLORS.gold,
  },
  coinsFormula: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  coinsCompleteText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: COLORS.success,
    marginBottom: 18,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.white,
  },
  claimButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  claimButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.background,
  },
  actionRow: {
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
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
    bannerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: 60,
  },
});
