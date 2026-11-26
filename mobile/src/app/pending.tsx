import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { Splash } from '@/components/splash';
import { Body, Button, H1, Muted } from '@/components/ui';
import { colors } from '@/lib/theme';
import { t } from '@/lib/i18n';

export default function Pending() {
  const { initializing, user, profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  // A brand-new account's profile can take a moment to appear after sign-up.
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (initializing) return <Splash />;
  if (!user) return <Redirect href="/login" />;
  if (profile?.status === 'approved') return <Redirect href="/home" />;
  if (!profile && !waited) return <Splash />;

  const rejected = profile?.status === 'rejected';
  const missing = !profile;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: insets.top + 80, gap: 16 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: rejected || missing ? colors.dangerSoft : colors.warningSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={rejected || missing ? 'x-circle' : 'clock'} size={34} color={rejected || missing ? colors.danger : colors.warning} />
      </View>
      <H1>{rejected ? 'Request declined' : missing ? 'Account not found' : 'Awaiting approval'}</H1>
      <Body>
        {rejected
          ? 'Your account request was declined. Please contact the club front desk if you think this is a mistake.'
          : missing
            ? 'This login has no portal profile (it may have been removed by an administrator). Please contact the club or create a new account.'
            : t("Thanks {name}! An administrator will review your request shortly. This screen updates automatically once you're approved.", { name: profile?.fullName.split(' ')[0] ?? '' })}
      </Body>
      {!rejected && !missing ? (
        <Muted>Tip: if your coach gave you a join code, sign out and create your account again with the code to get access instantly.</Muted>
      ) : null}
      <Button title="Sign out" variant="outline" icon="log-out" onPress={signOut} style={{ marginTop: 12 }} />
    </View>
  );
}
