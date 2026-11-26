import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Barlow_700Bold, Barlow_800ExtraBold } from '@expo-google-fonts/barlow';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold } from '@expo-google-fonts/cairo';
import { LanguageProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { ToastProvider } from '@/components/toast';
import { SetupRequired } from '@/components/setup-required';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Barlow_700Bold,
    Barlow_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LanguageProvider>
        {(lang) => (
          // Re-mount on language change; `direction` mirrors layouts for Arabic without an app restart.
          <View key={lang} style={{ flex: 1, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            {isFirebaseConfigured ? (
              <AuthProvider>
                <ToastProvider>
                  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
                </ToastProvider>
              </AuthProvider>
            ) : (
              <SetupRequired />
            )}
          </View>
        )}
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
