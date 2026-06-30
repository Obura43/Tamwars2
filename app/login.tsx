import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { sendPasswordResetEmail, signInWithEmail } from '@/src/services/authService';
import { claimPendingGuestScore } from '@/src/services/gameService';
import { hasProfile } from '@/src/services/profileService';
import { COLORS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react-native';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordResetRedirectUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/reset-password`;
  }

  return Linking.createURL('/reset-password');
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    const result = await signInWithEmail(email.trim(), password);

    if ('error' in result) {
      setLoading(false);
      setError(result.error);
      console.log('[LOGIN] error:', result.error);
      return;
    }

    const userId = result.userId;

    if (userId) {
      const profileExists = await hasProfile(userId);
      setLoading(false);
      console.log('[LOGIN] signed in, profile exists:', profileExists);
      if (profileExists) {
        await claimPendingGuestScore(userId);
        router.replace('/(tabs)/home');
      } else {
        router.replace('/profile-setup');
      }
    } else {
      setLoading(false);
      setError('Login failed. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Enter your email first, then tap Forgot password.');
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setMessage('');
    setResetLoading(true);

    const redirectTo = getPasswordResetRedirectUrl();
    const result = await sendPasswordResetEmail(normalizedEmail, redirectTo);
    setResetLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setMessage('Password reset link sent. Check your email.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)/home')}>
          <ArrowLeft color={COLORS.white} size={24} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue the battle</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.successText}>{message}</Text> : null}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.forgotLink}
            onPress={handleForgotPassword}
            disabled={resetLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.forgotText}>{resetLoading ? 'Sending reset link...' : 'Forgot password?'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
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
    marginBottom: 12,
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 6,
  },
  forgotText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.white,
  },
});
