import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '@/lib/auth-context';
import { checkCooldown, saveGuestTapSession, saveTapSession } from '@/src/services/gameService';
import { COLORS, GAME_DURATION } from '@/lib/constants';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { showInterstitial } from '@/components/InterstitialAd';

const { width } = Dimensions.get('window');
const MAX_TAP_EFFECTS = 8;

interface TapBurst {
  id: number;
  angle: number;
  distance: number;
}

function TapBurstEffect({ burst, sideColor }: { burst: TapBurst; sideColor: string }) {
  const progress = useSharedValue(0);
  const translateX = Math.cos(burst.angle) * burst.distance;
  const translateY = Math.sin(burst.angle) * burst.distance;

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - progress.value),
    transform: [{ scale: 0.82 + progress.value * 0.42 }],
  }));

  const sparkStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: translateX * progress.value },
      { translateY: translateY * progress.value },
      { scale: 1 - progress.value * 0.35 },
    ],
  }));

  const plusStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: -34 * progress.value },
      { scale: 0.9 + progress.value * 0.18 },
    ],
  }));

  return (
    <View pointerEvents="none" style={styles.burstLayer}>
      <Animated.View style={[styles.tapRipple, { borderColor: sideColor }, ringStyle]} />
      <Animated.View style={[styles.tapSpark, { backgroundColor: sideColor }, sparkStyle]} />
      <Animated.Text style={[styles.plusOneText, plusStyle]}>+1</Animated.Text>
    </View>
  );
}

export default function BattleScreen() {
  const { side } = useLocalSearchParams<{ side: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [tapBursts, setTapBursts] = useState<TapBurst[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstIdRef = useRef(0);
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
    const id = burstIdRef.current + 1;
    burstIdRef.current = id;
    const angle = (id * 2.399963229728653) % (Math.PI * 2);
    const distance = 32 + (id % 4) * 8;

    setTapBursts((bursts) => [...bursts.slice(-(MAX_TAP_EFFECTS - 1)), { id, angle, distance }]);
    setTimeout(() => {
      setTapBursts((bursts) => bursts.filter((burst) => burst.id !== id));
    }, 560);

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
            <View pointerEvents="none" style={[styles.tapGlow, { backgroundColor: sideColor }]} />
            {tapBursts.map((burst) => (
              <TapBurstEffect key={burst.id} burst={burst} sideColor={sideColor} />
            ))}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapButton: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tapGlow: {
    position: 'absolute',
    width: '112%',
    height: '112%',
    borderRadius: 999,
    opacity: 0.18,
  },
  burstLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tapRipple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 3,
  },
  tapSpark: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.78)',
  },
  plusOneText: {
    position: 'absolute',
    fontFamily: 'Inter-Black',
    fontSize: 22,
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 3,
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
