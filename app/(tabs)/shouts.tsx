import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Send } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { COLORS } from '@/lib/constants';
import { BATTLE_SHOUT_PRESETS, getBattleShoutText } from '@/src/data/battleShouts';
import {
  BattleShout,
  getBattleShouts,
  postBattleShout,
  subscribeToBattleShouts,
} from '@/src/services/battleShoutsService';
import { getProfile, Profile } from '@/src/services/profileService';

export default function ShoutsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shouts, setShouts] = useState<BattleShout[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const loadShouts = useCallback(async () => {
    const [nextShouts, nextProfile] = await Promise.all([
      getBattleShouts(),
      user ? getProfile(user.id) : Promise.resolve(null),
    ]);

    setShouts(nextShouts);
    setProfile(nextProfile);
  }, [user]);

  useEffect(() => {
    loadShouts();
  }, [loadShouts]);

  useEffect(() => {
    const channel = subscribeToBattleShouts((shout) => {
      setShouts((current) => {
        if (current.some((item) => item.id === shout.id)) return current;
        return [shout, ...current].slice(0, 60);
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const visiblePresets = useMemo(
    () =>
      BATTLE_SHOUT_PRESETS.filter((preset) => {
        if (!preset.side) return true;
        return profile?.preferred_side === preset.side;
      }),
    [profile]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShouts();
    setRefreshing(false);
  };

  const handlePost = async (messageId: string) => {
    if (!user) {
      router.push('/signup');
      return;
    }

    setStatus('');
    setPostingId(messageId);
    const result = await postBattleShout(messageId);
    setPostingId(null);

    if (!result.success) {
      setStatus(result.error);
      return;
    }

    setStatus('Shout sent.');
    await loadShouts();
  };

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <MessageCircle color={COLORS.white} size={24} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Battle Shouts</Text>
            <Text style={styles.subtitle}>Preset-only team chatter</Text>
          </View>
        </View>

        {!user ? (
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>View shouts as a guest</Text>
            <Text style={styles.guestText}>Create a profile to send your own Battle Shouts.</Text>
            <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/signup')} activeOpacity={0.8}>
              <Text style={styles.signupButtonText}>Sign up to shout</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {user && !profile ? (
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Finish your profile</Text>
            <Text style={styles.guestText}>Pick Wantam or Tutam before posting Battle Shouts.</Text>
            <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/profile-setup')} activeOpacity={0.8}>
              <Text style={styles.signupButtonText}>Set up profile</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.presetsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Send a Shout</Text>
            {profile ? (
              <View style={[styles.sidePill, { backgroundColor: profile.preferred_side === 'WANTAM' ? COLORS.wantam : COLORS.tutam }]}>
                <Text style={styles.sidePillText}>{profile.preferred_side}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.presetsGrid}>
            {visiblePresets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetButton,
                  preset.side === 'WANTAM' && styles.wantamPreset,
                  preset.side === 'TUTAM' && styles.tutamPreset,
                  postingId === preset.id && styles.presetButtonDisabled,
                ]}
                onPress={() => handlePost(preset.id)}
                disabled={postingId !== null}
                activeOpacity={0.8}
              >
                <Text style={styles.presetText}>{preset.text}</Text>
                <Send color={COLORS.white} size={14} />
              </TouchableOpacity>
            ))}
          </View>
          {status ? (
            <Text style={[styles.statusText, status === 'Shout sent.' ? styles.statusSuccess : styles.statusError]}>
              {status}
            </Text>
          ) : null}
        </View>

        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Live Feed</Text>
          {shouts.length === 0 ? (
            <Text style={styles.emptyText}>No shouts yet. Start the noise.</Text>
          ) : (
            <View style={styles.feedList}>
              {shouts.map((shout) => (
                <View key={shout.id} style={styles.shoutRow}>
                  <View style={[styles.shoutSideBar, { backgroundColor: shout.side === 'WANTAM' ? COLORS.wantam : COLORS.tutam }]} />
                  <View style={styles.shoutBody}>
                    <View style={styles.shoutMetaRow}>
                      <Text style={styles.shoutUsername} numberOfLines={1}>{shout.username}</Text>
                      <Text style={styles.shoutTime}>{formatTime(shout.created_at)}</Text>
                    </View>
                    <Text style={styles.shoutMessage}>{getBattleShoutText(shout.message_id)}</Text>
                    <Text style={[styles.shoutSide, { color: shout.side === 'WANTAM' ? COLORS.wantam : COLORS.tutam }]}>
                      {shout.side}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 96,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    paddingTop: 8,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-Black',
    fontSize: 25,
    color: COLORS.white,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  guestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  guestTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 6,
  },
  guestText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  signupButton: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  signupButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: COLORS.background,
  },
  presetsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: COLORS.white,
  },
  sidePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  sidePillText: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    color: COLORS.white,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    minHeight: 42,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wantamPreset: {
    backgroundColor: COLORS.wantam,
    borderColor: COLORS.wantam,
  },
  tutamPreset: {
    backgroundColor: COLORS.tutam,
    borderColor: COLORS.tutam,
  },
  presetButtonDisabled: {
    opacity: 0.55,
  },
  presetText: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.white,
  },
  statusText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginTop: 12,
  },
  statusSuccess: {
    color: COLORS.success,
  },
  statusError: {
    color: COLORS.error,
  },
  feedSection: {
    gap: 12,
  },
  feedList: {
    gap: 10,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  shoutRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  shoutSideBar: {
    width: 5,
  },
  shoutBody: {
    flex: 1,
    padding: 13,
  },
  shoutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  shoutUsername: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    color: COLORS.white,
  },
  shoutTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: COLORS.textMuted,
  },
  shoutMessage: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  shoutSide: {
    fontFamily: 'Inter-Black',
    fontSize: 11,
  },
});
