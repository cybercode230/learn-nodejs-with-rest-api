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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isOnboardingFinished, setIsOnboardingFinished] = useState(false);
  const [loaded] = useFonts({
    'Figtree-Regular': require('../assets/fonts/Figtree/static/Figtree-Regular.ttf'),
    'Figtree-Bold': require('../assets/fonts/Figtree/static/Figtree-Bold.ttf'),
    'Figtree-Medium': require('../assets/fonts/Figtree/static/Figtree-Medium.ttf'),
    'Figtree-SemiBold': require('../assets/fonts/Figtree/static/Figtree-SemiBold.ttf'),
    'Figtree-Light': require('../assets/fonts/Figtree/static/Figtree-Light.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!isOnboardingFinished) {
    return <OnboardingScreen onFinish={() => setIsOnboardingFinished(true)} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
