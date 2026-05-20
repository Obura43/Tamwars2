import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resendVerificationEmail, refreshAndCheckVerification, signOut } from '@/services/authService';
import { hasProfile } from '@/services/profileService';
import { COLORS } from '@/lib/constants';
import { Mail, ArrowLeft } from 'lucide-react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(paramEmail ?? '');
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const handleResend = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address above.');
      setMessageType('error');
      return;
    }
    setResending(true);
    setMessage('');

    const result = await resendVerificationEmail(email.trim());

    setResending(false);
    if (result.error) {
      setMessage(result.error);
      setMessageType('error');
    } else {
      setMessage('Verification email resent! Check your inbox and spam folder.');
      setMessageType('success');
    }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    setMessage('');

    const result = await refreshAndCheckVerification();

    if (result.error) {
      setChecking(false);
      setMessage(result.error);
      setMessageType('error');
      return;
    }

    if (result.verified && result.userId) {
      console.log('[VERIFY] email verified, checking profile');
      const profileExists = await hasProfile(result.userId);
      setChecking(false);
      if (profileExists) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/profile-setup');
      }
    } else {
      setChecking(false);
      setMessage('Email not verified yet. Please click the link in your email first.');
      setMessageType('error');
    }
  };

  const handleBackToLogin = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail color={COLORS.white} size={48} />
        </View>

        <Text style={styles.logo}>TamWar</Text>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.description}>
          Check your inbox and spam folder for the TamWar verification link.
        </Text>

        {!paramEmail && (
          <View style={styles.emailInputContainer}>
            <Text style={styles.emailLabel}>Your email</Text>
            <TextInput
              style={styles.emailInput}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {paramEmail ? (
          <Text style={styles.emailDisplay}>{paramEmail}</Text>
        ) : null}

        {message ? (
          <Text style={[styles.messageText, messageType === 'success' ? styles.successText : styles.errorText]}>
            {message}
          </Text>
        ) : null}

        <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.primaryButtonText}>
            Go To Login
          </Text>
        </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, resending && styles.buttonDisabled]}
            onPress={handleResend}
            disabled={resending}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
            activeOpacity={0.8}
          >
            <ArrowLeft color={COLORS.textSecondary} size={16} />
            <Text style={styles.backButtonText}>Back to Login</Text>
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
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logo: {
    fontFamily: 'Inter-Black',
    fontSize: 28,
    color: COLORS.white,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emailDisplay: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 16,
  },
  emailInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  emailLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  emailInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.white,
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  successText: {
    color: COLORS.success,
  },
  errorText: {
    color: COLORS.error,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.background,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  backButtonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
