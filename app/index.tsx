import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { hasProfile } from '@/src/services/profileService';
import { COLORS } from '@/lib/constants';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading, isEmailVerified } = useAuth();

  useEffect(() => {
    if (loading) return;

    console.log('[INDEX] guard: user:', user?.id, 'isEmailVerified:', isEmailVerified);

    if (user) {
      if (!isEmailVerified) {
        console.log('[INDEX] redirecting unverified user to verify-email');
        router.replace({ pathname: '/verify-email', params: { email: user.email ?? '' } });
        return;
      }
      hasProfile(user.id).then((exists) => {
        console.log('[INDEX] verified user, profile exists:', exists);
        if (exists) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/profile-setup');
        }
      });
    }
  }, [user, loading, isEmailVerified]);

  if (loading || user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TamWar</Text>
          <View style={styles.taglineRow}>
            <Text style={[styles.taglineSide, { color: COLORS.wantam }]}>Wantam</Text>
            <Text style={styles.taglineVs}> Vs </Text>
            <Text style={[styles.taglineSide, { color: COLORS.tutam }]}>Tutam</Text>
          </View>
          <Text style={styles.taglineSub}>tapping battle</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/guest-side-select')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>PLAY AS GUEST</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 32,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginTop: '50%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoText: {
    fontFamily: 'Inter-Black',
    fontSize: 64,
    color: COLORS.white,
    letterSpacing: -2,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  taglineSide: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  taglineVs: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  taglineSub: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: COLORS.white,
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.background,
  },
  signupButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.white,
  },
  signInText: {
  textAlign: 'center',
  color: COLORS.textSecondary,
  fontFamily: 'Inter-Regular',
  fontSize: 15,
  marginTop: 8,
},

signInLink: {
  color: COLORS.white,
  fontFamily: 'Inter-Bold',
},
});
