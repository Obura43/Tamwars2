import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession, getGlobalRank, TapSession } from '@/src/services/gameService';
import { COLORS } from '@/lib/constants';
import { Share2, Home, RotateCcw } from 'lucide-react-native';

export default function ResultScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<TapSession | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [sessionId]);

  const fetchResult = async () => {
    const data = await getSession(sessionId);
    if (data) {
      setSession(data);
      if (data.validated) {
        const r = await getGlobalRank(data.tap_count);
        setRank(r);
      }
    } else {
      setError('Could not load your result. Please go back to home.');
    }
  };

  const handleShare = async () => {
    if (!session) return;
    const message = `I scored ${session.tap_count.toLocaleString()} taps for ${session.side} on TamWar! Can you beat me?`;
    if (Platform.OS === 'web') {
      if (navigator.share) {
        navigator.share({ text: message });
      } else {
        navigator.clipboard?.writeText(message);
      }
    } else {
      Share.share({ message });
    }
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

        {rank && session.validated && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankLabel}>Global Rank</Text>
            <Text style={styles.rankValue}>#{rank}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
            <Share2 color={COLORS.white} size={20} />
            <Text style={styles.shareText}>Share Result</Text>
          </TouchableOpacity>

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
  shareText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: COLORS.white,
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
});
