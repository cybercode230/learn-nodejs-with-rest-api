import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import 'react-native-reanimated';
import "../global.css";

import { useColorScheme } from '@/hooks/use-color-scheme';
import OnboardingScreen from '@/components/onboarding-screen';
import CustomSplashScreen from '@/components/custom-splash-screen';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { PreferencesProvider, usePreferences } from '@/hooks/use-preferences';
import { WishlistProvider } from '@/hooks/use-wishlist';
import { SearchProvider } from '@/hooks/use-search';
import { ReservationsProvider } from '@/hooks/use-reservations';
import { InboxProvider } from '@/hooks/use-inbox';

// Prevent the native splash screen from auto-hiding.
// We will manage the transition manually with our CustomSplashScreen.
SplashScreen.preventAutoHideAsync();

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

import { useSegments, useRouter } from 'expo-router';

function RootLayoutNav() {
  const { isDark } = usePreferences();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    // ── GUEST AND HOST GUARD ──────────────────────────────────────────────
    // This mobile app is for guests and hosts.
    // ADMIN accounts must use the web platform.
    if (isAuthenticated && user && user.role !== 'GUEST' && user.role !== 'HOST') {
      Alert.alert(
        'Access Restricted',
        `This app is for guests and hosts only.\n\nADMIN accounts must use the Airbnb web platform to manage the application.`,
        [
          {
            text: 'OK',
            onPress: () => logout(),
          },
        ],
        { cancelable: false }
      );
      return;
    }
    // ─────────────────────────────────────────────────────────────────

    // Authenticated users who land on auth screens → bounce to tabs
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // Unauthenticated users can freely browse Explore and listing detail.
    // Protected screens (Wishlist, Trips, Inbox, Profile) handle their own auth walls.
  }, [isAuthenticated, segments, isLoading, user]);

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
