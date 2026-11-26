import { ScrollView, Text, View } from 'react-native';
import { colors, fonts } from '@/lib/theme';
import { t } from '@/lib/i18n';

const steps = [
  'Create a free Firebase project at console.firebase.google.com.',
  'Enable Authentication → Sign-in method → Email/Password.',
  'Create a Firestore database (production mode).',
  'Add a Web app in Project settings and copy its config.',
  'Copy mobile/.env.example to mobile/.env and paste the values.',
  'Run `npm run deploy:rules`, then restart `npx expo start`.',
];

export function SetupRequired() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 24, paddingTop: 80, gap: 16 }}>
      <Text style={{ color: colors.primary, fontFamily: fonts.bold, letterSpacing: 1.5, fontSize: 12 }}>{t('SETUP REQUIRED')}</Text>
      <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 34, textTransform: 'uppercase' }}>{t('Connect Firebase')}</Text>
      <Text style={{ color: '#D1D5DB', fontFamily: fonts.body, fontSize: 15, lineHeight: 22 }}>
        The app stores accounts and club data in Firebase. Add your project keys to finish setup — see mobile/README.md.
      </Text>
      {steps.map((s, i) => (
        <View key={s} style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ color: colors.primary, fontFamily: fonts.display, fontSize: 18, width: 20 }}>{i + 1}</Text>
          <Text style={{ color: '#fff', fontFamily: fonts.body, fontSize: 15, flex: 1, lineHeight: 22 }}>{s}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
