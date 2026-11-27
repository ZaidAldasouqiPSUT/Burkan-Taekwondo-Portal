import { View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { MORE_ITEMS } from '@/lib/nav';
import { colors, fonts } from '@/lib/theme';
import { Avatar, Badge, Body, Card, Muted, Row, Screen, Title, confirm } from '@/components/ui';
import { isRTL, t } from '@/lib/i18n';

export default function More() {
  const { profile, signOut } = useAuth();
  const items = MORE_ITEMS.filter((i) => profile && i.roles.includes(profile.role));

  return (
    <Screen>
      <Card>
        <Row gap={14}>
          <Avatar name={profile?.fullName ?? '?'} size={54} />
          <View style={{ flex: 1, gap: 4 }}>
            <Title>{profile?.fullName}</Title>
            <Muted>{profile?.email}</Muted>
            <Badge label={profile?.role ?? ''} tone="primary" />
          </View>
        </Row>
      </Card>

      <Card style={{ padding: 0 }}>
        {items.map((item, i) => (
          <View key={item.label}>
            {i > 0 ? <View style={{ height: 1, backgroundColor: colors.border, marginStart: 60 }} /> : null}
            <Card onPress={() => router.push(item.href)} style={{ shadowOpacity: 0, elevation: 0, borderRadius: 0, backgroundColor: 'transparent', paddingVertical: 14 }}>
              <Row gap={14}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={item.icon} size={17} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontFamily: fonts.semibold }}>{t(item.label)}</Body>
                  <Muted style={{ fontSize: 12 }}>{t(item.description)}</Muted>
                </View>
                <Feather name={isRTL() ? 'chevron-left' : 'chevron-right'} size={18} color={colors.muted} />
              </Row>
            </Card>
          </View>
        ))}
      </Card>

      <Card onPress={() => confirm('Sign out?', 'You will need to sign in again.', signOut, 'Sign out')}>
        <Row gap={14}>
          <Feather name="log-out" size={18} color={colors.danger} />
          <Body style={{ color: colors.danger, fontFamily: fonts.semibold }}>Sign out</Body>
        </Row>
      </Card>
    </Screen>
  );
}
