import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '@/lib/constants';

export default function GuestFinish() {
  const router = useRouter();
  const { score, side } = useLocalSearchParams<{
    score: string;
    side: string;
  }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.side, { color: side === 'WANTAM' ? COLORS.wantam : COLORS.tutam }]}>
          {side}
        </Text>

        <Text style={styles.score}>{score}</Text>

        <Text style={styles.message}>
          Nice game!{"\n\n"}
          Create a FREE account to:
        </Text>

        <Text style={styles.list}>
          🏆 Join the leaderboard{"\n"}
          💾 Save your best score{"\n"}
          📈 Track your progress
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.buttonText}>Create Free Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.later}>Maybe Later</Text>
        </TouchableOpacity>
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
    padding: 30,
    alignItems: 'center',
  },
  side: {
    fontFamily: 'Inter-Black',
    fontSize: 34,
  },
  score: {
    fontFamily: 'Inter-Black',
    fontSize: 72,
    color: COLORS.gold,
    marginVertical: 20,
  },
  message: {
    color: COLORS.white,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    marginBottom: 20,
  },
  list: {
    color: COLORS.textSecondary,
    textAlign: 'left',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 40,
  },
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  buttonText: {
    color: COLORS.background,
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  later: {
    marginTop: 20,
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
  },
});