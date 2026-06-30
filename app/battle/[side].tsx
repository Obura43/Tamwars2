import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useAuth } from '@/lib/auth-context';
import { checkCooldown, saveGuestTapSession, saveTapSession } from '@/src/services/gameService';
import { COLORS, GAME_DURATION } from '@/lib/constants';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { showInterstitial } from '@/components/InterstitialAd';

const { width } = Dimensions.get('window');

export default function BattleScreen() {
  const { side } = useLocalSearchParams<{ side: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scale = useSharedValue(1);

  const sideColor = side === 'WANTAM' ? COLORS.wantam : COLORS.tutam;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

    const startGame = async () => {
      if (!user) {
        setError('');
        setTapCount(0);
        setTimeLeft(GAME_DURATION);
        setGameState('playing');
        return;
      }
    const canPlay = await checkCooldown(user.id);
    if (!canPlay) {
      setError('Slow down! You can only play 5 games every 10 minutes. Take a breather.');
      return;
    }
    setError('');
    setTapCount(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'finished') {
      saveSession();
    }
  }, [gameState]);

  const handleTap = useCallback(() => {
    if (gameState !== 'playing') return;
    setTapCount((prev) => prev + 1);
    scale.value = withSequence(withSpring(0.92, { duration: 50 }), withSpring(1, { duration: 50 }));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [gameState]);

  const saveSession = async () => {
    setSaving(true);

    if (!user) {
      const result = await saveGuestTapSession(side as 'WANTAM' | 'TUTAM', tapCount);
      setSaving(false);
      showInterstitial(() => {
        router.replace(`/result/${result.sessionId}`);
      });
      return;
    }

    const result = await saveTapSession(
      user.id,
      side as 'WANTAM' | 'TUTAM',
      tapCount
    );

      setSaving(false);

      if ('error' in result) {
        setError(result.error);
        return;
      }

      const goToResults = () => {
        router.replace(`/result/${result.sessionId}`);
      };

      showInterstitial(goToResults);
    };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      {gameState === 'ready' && (
        <View style={styles.readyContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X color={COLORS.white} size={24} />
          </TouchableOpacity>
          <View style={styles.readyContent}>
            <Text style={[styles.readySide, { color: sideColor }]}>{side}</Text>
            <Text style={styles.readyTitle}>60-Second Battle</Text>
            <Text style={styles.readyDesc}>Tap as fast as you can for {side}!</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: sideColor }]}
              onPress={startGame}
              activeOpacity={0.85}
            >
              <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {gameState === 'playing' && (
        <View style={styles.playingContainer}>
          <View style={styles.timerRow}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          <Text style={styles.tapCountText}>{tapCount.toLocaleString()}</Text>
          <Text style={styles.tapsLabel}>taps</Text>
          <Animated.View style={[styles.tapButtonWrapper, animatedStyle]}>
            <TouchableOpacity
              style={[styles.tapButton, { backgroundColor: sideColor }]}
              onPress={handleTap}
              activeOpacity={0.7}
            >
              <Text style={styles.tapButtonText}>TAP!</Text>
              <Text style={styles.tapButtonSide}>{side}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {gameState === 'finished' && (
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedTitle}>Time's Up!</Text>
          <Text style={styles.finishedScore}>{tapCount.toLocaleString()}</Text>
          <Text style={styles.finishedLabel}>taps for {side}</Text>
          {saving && <Text style={styles.savingText}>Saving your score...</Text>}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  readyContainer: {
    flex: 1,
  },
  readyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  readySide: {
    fontFamily: 'Inter-Black',
    fontSize: 48,
    marginBottom: 16,
  },
  readyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 8,
  },
  readyDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  startButton: {
    paddingVertical: 20,
    paddingHorizontal: 64,
    borderRadius: 16,
  },
  startButtonText: {
    fontFamily: 'Inter-Black',
    fontSize: 24,
    color: COLORS.white,
  },
  playingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  timerRow: {
    marginBottom: 16,
  },
  timerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: COLORS.white,
  },
  tapCountText: {
    fontFamily: 'Inter-Black',
    fontSize: 64,
    color: COLORS.white,
  },
  tapsLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  tapButtonWrapper: {
    width: width * 0.7,
    aspectRatio: 1,
    maxWidth: 280,
    maxHeight: 280,
  },
  tapButton: {
    flex: 1,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapButtonText: {
    fontFamily: 'Inter-Black',
    fontSize: 42,
    color: COLORS.white,
  },
  tapButtonSide: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  finishedTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: COLORS.white,
    marginBottom: 16,
  },
  finishedScore: {
    fontFamily: 'Inter-Black',
    fontSize: 72,
    color: COLORS.gold,
  },
  finishedLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  savingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 24,
  },
});
