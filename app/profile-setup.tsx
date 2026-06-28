import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { claimPendingGuestScore } from '@/src/services/gameService';
import { createProfile } from '@/src/services/profileService';
import { COLORS, KENYAN_COUNTIES } from '@/lib/constants';
import { ChevronDown } from 'lucide-react-native';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, isEmailVerified } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log('[PROFILE_SETUP] no user, redirecting to welcome');
      router.replace('/');
      return;
    }
    if (!isEmailVerified) {
      console.log('[PROFILE_SETUP] unverified user, redirecting to verify-email');
      router.replace({ pathname: '/verify-email', params: { email: user.email ?? '' } });
    }
  }, [user, isEmailVerified]);
  const [username, setUsername] = useState('');
  const [county, setCounty] = useState('');
  const [university, setUniversity] = useState('');
  const [side, setSide] = useState<'WANTAM' | 'TUTAM' | ''>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountyPicker, setShowCountyPicker] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!county) {
      setError('Please select your county');
      return;
    }
    if (!side) {
      setError('Please choose your side');
      return;
    }
    if (!user) {
      setError('Not authenticated. Please log in again.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await createProfile({
      id: user.id,
      username: username.trim(),
      county,
      university: university.trim() || null,
      preferred_side: side,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Failed to create profile');
      return;
    }

    await claimPendingGuestScore(user.id);
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Set Up Profile</Text>
          <Text style={styles.subtitle}>Choose your identity in TamWar</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a unique username"
              placeholderTextColor={COLORS.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>County</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCountyPicker(!showCountyPicker)}
            >
              <Text style={county ? styles.pickerText : styles.pickerPlaceholder}>
                {county || 'Select your county'}
              </Text>
              <ChevronDown color={COLORS.textMuted} size={20} />
            </TouchableOpacity>
            {showCountyPicker && (
              <ScrollView style={styles.pickerList} nestedScrollEnabled>
                {KENYAN_COUNTIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.pickerItem, county === c && styles.pickerItemActive]}
                    onPress={() => { setCounty(c); setShowCountyPicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, county === c && styles.pickerItemTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>University / Institution (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. University of Nairobi"
              placeholderTextColor={COLORS.textMuted}
              value={university}
              onChangeText={setUniversity}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Choose Your Side</Text>
            <View style={styles.sideRow}>
              <TouchableOpacity
                style={[styles.sideButton, styles.wantamButton, side === 'WANTAM' && styles.sideActive]}
                onPress={() => setSide('WANTAM')}
              >
                <Text style={styles.sideButtonText}>WANTAM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sideButton, styles.tutamButton, side === 'TUTAM' && styles.sideActive]}
                onPress={() => setSide('TUTAM')}
              >
                <Text style={styles.sideButtonText}>TUTAM</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Let\'s Go!'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 32,
    paddingTop: 48,
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
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
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
  pickerButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.white,
    fontFamily: 'Inter-Regular',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontFamily: 'Inter-Regular',
  },
  pickerList: {
    maxHeight: 200,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemActive: {
    backgroundColor: COLORS.surfaceLight,
  },
  pickerItemText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  pickerItemTextActive: {
    color: COLORS.white,
    fontFamily: 'Inter-SemiBold',
  },
  sideRow: {
    flexDirection: 'row',
    gap: 16,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wantamButton: {
    backgroundColor: COLORS.wantam,
  },
  tutamButton: {
    backgroundColor: COLORS.tutam,
  },
  sideActive: {
    opacity: 1,
    borderColor: COLORS.white,
  },
  sideButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.white,
  },
  submitButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.background,
  },
});
