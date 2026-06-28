import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession, getGlobalRank, markPendingScoreClaim, TapSession } from '@/src/services/gameService';
import { COLORS } from '@/lib/constants';
import { Share2, Home, RotateCcw } from 'lucide-react-native';
import BannerAdvertisement from '@/components/BannerAd';

export default function ResultScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<TapSession | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [sessionId]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {session.suspicious && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>Score flagged as suspicious and won't appear on leaderboard</Text>
          </View>
        )}

        <Text style={[styles.sideText, { color: sideColor }]}>{session.side}</Text>
        <Text style={styles.scoreLabel}>Your Score</Text>
        <Text style={styles.scoreValue}>{session.tap_count.toLocaleString()}</Text>
        <Text style={styles.tapsText}>taps in 60 seconds</Text>

        {isGuestResult && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>Saved on this device</Text>
          </View>
        )}

        {rank && session.validated && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankLabel}>Global Rank</Text>
            <Text style={styles.rankValue}>#{rank}</Text>
          </View>
        )}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    marginBottom: 24,
  },
  rankBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
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
