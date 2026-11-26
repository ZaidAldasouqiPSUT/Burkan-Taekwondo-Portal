import { Text, View, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/lib/theme';
import type { IconName } from '@/components/ui';
import { ls, t } from '@/lib/i18n';

const icon = (name: IconName) =>
  function TabBarIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Feather name={name} size={size - 2} color={color as string} />;
  };

function BrandTitle() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Feather name="award" size={22} color={colors.primary} />
      <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.primary }}>{t('BURKAN TKD')}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { profile } = useAuth();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerTitleAlign: 'left',
        headerTitle: () => <BrandTitle />,
        headerStyle: { backgroundColor: colors.card },
        headerShadowVisible: false,
        headerRight: () => (
          <Text style={{ marginEnd: 16, fontFamily: fonts.bold, fontSize: 11, color: colors.muted, letterSpacing: ls(1), textTransform: 'uppercase' }}>
            {t(profile?.role ?? '')}
          </Text>
        ),
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('Home'), tabBarIcon: icon('home') }} />
      <Tabs.Screen name="schedule" options={{ title: t('Schedule'), tabBarIcon: icon('calendar') }} />
      <Tabs.Screen name="attendance" options={{ title: t('Attendance'), tabBarIcon: icon('check-square') }} />
      <Tabs.Screen name="feedback" options={{ title: t('Feedback'), tabBarIcon: icon('message-square') }} />
      <Tabs.Screen name="more" options={{ title: t('More'), tabBarIcon: icon('menu') }} />
    </Tabs>
  );
}
