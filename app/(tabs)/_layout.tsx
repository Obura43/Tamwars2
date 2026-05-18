import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { COLORS } from '@/lib/constants';
import { Home, Trophy, BarChart3, User } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();
  const { user, loading, isEmailVerified } = useAuth();

  useEffect(() => {
    if (loading) return;
    console.log('[TABS] guard: user:', user?.id, 'isEmailVerified:', isEmailVerified);
    if (!user) {
      console.log('[TABS] no user, redirecting to welcome');
      router.replace('/');
      return;
    }
    if (!isEmailVerified) {
      console.log('[TABS] unverified user, redirecting to verify-email');
      router.replace({ pathname: '/verify-email', params: { email: user.email ?? '' } });
    }
  }, [user, loading, isEmailVerified]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Battle',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="totals"
        options={{
          title: 'Totals',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
