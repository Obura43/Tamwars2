import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/lib/constants';

export default function GuestSideSelect() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Your Side</Text>
        <Text style={styles.subtitle}>
          Pick a side and start playing instantly.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.wantam }]}
          onPress={() => router.push('/battle/WANTAM')}
        >
          <Text style={styles.buttonText}>🔴 WANTAM</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: COLORS.tutam }]}
          onPress={() => router.push('/battle/TUTAM')}
        >
          <Text style={styles.buttonText}>🟢 TUTAM</Text>
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
    padding: 24,
  },
  title: {
    fontFamily: 'Inter-Black',
    fontSize: 32,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    paddingVertical: 22,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontFamily: 'Inter-Black',
    fontSize: 22,
    color: COLORS.white,
  },
});