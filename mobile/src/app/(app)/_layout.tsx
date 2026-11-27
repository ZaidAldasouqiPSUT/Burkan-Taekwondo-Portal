import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Splash } from '@/components/splash';
import { colors, fonts } from '@/lib/theme';
import { t } from '@/lib/i18n';

export default function AppLayout() {
  const { initializing, user, profile } = useAuth();
  if (initializing) return <Splash />;
  if (!user) return <Redirect href="/login" />;
  if (profile?.status !== 'approved') return <Redirect href="/pending" />;

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.display, color: colors.text },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="students" options={{ title: t('Students'), headerTitle: '' }} />
      <Stack.Screen name="belt-tests" options={{ title: t('Belt Testing'), headerTitle: '' }} />
      <Stack.Screen name="finances" options={{ title: t('Finances'), headerTitle: '' }} />
      <Stack.Screen name="news" options={{ title: t('Club News'), headerTitle: '' }} />
      <Stack.Screen name="locations" options={{ title: t('Locations'), headerTitle: '' }} />
      <Stack.Screen name="about" options={{ title: t('About Us') }} />
      <Stack.Screen name="accounts" options={{ title: t('Accounts') }} />
      <Stack.Screen name="settings" options={{ title: t('Settings') }} />
    </Stack>
  );
}
