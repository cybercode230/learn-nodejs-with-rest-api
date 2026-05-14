import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import "../global.css";

import { useColorScheme } from '@/hooks/use-color-scheme';
import OnboardingScreen from '@/components/onboarding-screen';
import CustomSplashScreen from '@/components/custom-splash-screen';
import { AuthProvider } from '@/hooks/use-auth';
import { PreferencesProvider, usePreferences } from '@/hooks/use-preferences';
import { WishlistProvider } from '@/hooks/use-wishlist';
import { SearchProvider } from '@/hooks/use-search';
import { ReservationsProvider } from '@/hooks/use-reservations';
import { InboxProvider } from '@/hooks/use-inbox';

// Prevent the native splash screen from auto-hiding.
// We will manage the transition manually with our CustomSplashScreen.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Root Layout Component.
 * Manages the application lifecycle, font loading, and high-level navigation providers.
 */
export default function RootLayout() {
  const [loaded] = useFonts({
    'Figtree-Regular': require('../assets/fonts/Figtree/static/Figtree-Regular.ttf'),
    'Figtree-Bold': require('../assets/fonts/Figtree/static/Figtree-Bold.ttf'),
    'Figtree-Medium': require('../assets/fonts/Figtree/static/Figtree-Medium.ttf'),
    'Figtree-SemiBold': require('../assets/fonts/Figtree/static/Figtree-SemiBold.ttf'),
    'Figtree-Light': require('../assets/fonts/Figtree/static/Figtree-Light.ttf'),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [isOnboardingFinished, setIsOnboardingFinished] = useState(false);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }, 500);
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <PreferencesProvider>
        <WishlistProvider>
          <SearchProvider>
            <ReservationsProvider>
              <InboxProvider>
                {!appIsReady ? (
                  <CustomSplashScreen />
                ) : !isOnboardingFinished ? (
                  <OnboardingScreen onFinish={() => setIsOnboardingFinished(true)} />
                ) : (
                  <RootLayoutNav />
                )}
              </InboxProvider>
            </ReservationsProvider>
          </SearchProvider>
        </WishlistProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { isDark } = usePreferences();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="listing/wishlist-category" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="inbox/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
