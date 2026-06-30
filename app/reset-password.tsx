import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { preparePasswordResetSession, updatePassword } from '@/src/services/authService';
import { COLORS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [preparingSession, setPreparingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    const prepareSession = async (url?: string | null) => {
      const resetUrl =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.href
          : url;

      if (!resetUrl) {
        if (mounted) {
          setError('Open this screen from the password reset email link.');
          setPreparingSession(false);
        }
        return;
      }

      const result = await preparePasswordResetSession(resetUrl);

      if (!mounted) return;

      if (result.ready) {
        setSessionReady(true);
        setError('');
      } else {
        setError(result.error ?? 'Password reset session missing. Please request a new reset link.');
      }

      setPreparingSession(false);
    };

    Linking.getInitialURL().then(prepareSession);

    const subscription = Linking.addEventListener('url', ({ url }) => {
      setPreparingSession(true);
      prepareSession(url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const handleReset = async () => {
    if (!sessionReady) {
      setError('Password reset session missing. Please open the latest reset email link again.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage('Password updated. You can continue playing.');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
          <ArrowLeft color={COLORS.white} size={24} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {preparingSession ? 'Preparing your reset link...' : 'Choose a new password for your TamWar account'}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.successText}>{message}</Text> : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor={COLORS.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (loading || preparingSession || !sessionReady) && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading || preparingSession || !sessionReady}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>

          {message ? (
            <TouchableOpacity
              style={styles.homeLink}
              onPress={() => router.replace('/(tabs)/home')}
              activeOpacity={0.8}
            >
              <Text style={styles.homeLinkText}>Go to TamWar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    padding: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.success,
    marginBottom: 12,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.white,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.background,
  },
  homeLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  homeLinkText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
  },
});
