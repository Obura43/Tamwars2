import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmail, resendVerificationEmail } from '@/src/services/authService';
import { hasProfile } from '@/src/services/profileService';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setShowResend(false);
    setResendMessage('');
    setLoading(true);

    const result = await signInWithEmail(email.trim(), password);

    if ('error' in result) {
      setLoading(false);
      setError(result.error);
      console.log('[LOGIN] error:', result.error);
      if (result.error.toLowerCase().includes('verify your email')) {
        setShowResend(true);
      }
      return;
    }

    // Double-check verification status after successful login
    const { data: { user } } = await supabase.auth.getUser();
    console.log('[LOGIN] getUser email_confirmed_at:', user?.email_confirmed_at);

    if (user && !user.email_confirmed_at) {
      console.log('[LOGIN] unverified user detected after login, signing out');
      await supabase.auth.signOut();
      setLoading(false);
      setError('Please verify your email before logging in.');
      setShowResend(true);
      return;
    }

    if (user) {
      const profileExists = await hasProfile(user.id);
      setLoading(false);
      console.log('[LOGIN] verified, profile exists:', profileExists);
      if (profileExists) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/profile-setup');
      }
    } else {
      setLoading(false);
      setError('Login failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!email) {
      setResendMessage('Please enter your email above first.');
      return;
    }
    setResendMessage('');
    const result = await resendVerificationEmail(email.trim());
    if (result.error) {
      setResendMessage(result.error);
    } else {
      setResendMessage('Verification email resent! Check your inbox.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={COLORS.white} size={24} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue the battle</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {showResend && (
            <View style={styles.resendContainer}>
              <TouchableOpacity style={styles.resendButton} onPress={handleResend} activeOpacity={0.8}>
                <Text style={styles.resendButtonText}>Resend Verification Email</Text>
              </TouchableOpacity>
              {resendMessage ? (
                <Text style={[styles.resendMessage, resendMessage.includes('resent') ? styles.successText : styles.errorColor]}>
                  {resendMessage}
                </Text>
              ) : null}
            </View>
          )}

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
  resendContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  resendButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resendButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: COLORS.white,
  },
  resendMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  successText: {
    color: COLORS.success,
  },
  errorColor: {
    color: COLORS.error,
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
});
