import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/lib/auth-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
//import mobileAds from 'react-native-google-mobile-ads';
import { loadInterstitial } from '@/components/InterstitialAd';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-Black': Inter_900Black,
  });

  useEffect(() => {
    async function initializeApp() {
      if (fontsLoaded || fontError) {
        try {
          // await mobileAds().initialize();
          // loadInterstitial();
          console.log('AdMob initialized');
        } catch (err) {
          console.error('AdMob initialization failed:', err);
        }

        await SplashScreen.hideAsync();
      }
    }

    initializeApp();
  }, [fontsLoaded, fontError]);

  return (
      <AuthProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1, overflow: 'visible' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="guest-side-select" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="privacy-policy" />
        <Stack.Screen name="terms-of-use" />
        <Stack.Screen name="contact" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="guest-finish" />
        <Stack.Screen name="account-deletion" />
        <Stack.Screen name="battle/[side]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="result/[sessionId]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
