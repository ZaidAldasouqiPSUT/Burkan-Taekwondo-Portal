import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, fonts, images, lh } from '@/lib/theme';
import { Body, Card, Screen } from '@/components/ui';
import { isRTL, t } from '@/lib/i18n';

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={{ borderStartWidth: 4, borderStartColor: colors.primary, paddingStart: 12 }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 26, textTransform: 'uppercase', color: colors.text, textAlign: isRTL() ? 'right' : 'left' }}>{t(children)}</Text>
    </View>
  );
}

export default function About() {
  return (
    <Screen padded={false}>
      <View style={{ backgroundColor: '#000', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 36, overflow: 'hidden' }}>
        <Image source={images.mahmoud} style={[StyleSheet.absoluteFill, { opacity: 0.3 }]} contentFit="cover" contentPosition="top" />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
        <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 44, lineHeight: lh(46), textTransform: 'uppercase', textAlign: isRTL() ? 'right' : 'left' }}>
          {t('Legacy of')}{'\n'}
          <Text style={{ color: colors.primary }}>{t('Champions')}</Text>
        </Text>
        <Text style={{ color: '#D1D5DB', fontFamily: fonts.body, fontSize: 15, lineHeight: 23, marginTop: 14, textAlign: isRTL() ? 'right' : 'left' }}>
          {t('Burkan Taekwondo Center is a pillar of Jordanian Taekwondo. For decades, we have shaped national heroes, fostered discipline, and built a community bound by respect and excellence.')}
        </Text>
      </View>

      <View style={{ padding: 16, gap: 18 }}>
        <SectionTitle>The Grand Master</SectionTitle>
        <Body>Founded by Grand Master Mahmoud Sqoor, Burkan Taekwondo Center represents the pinnacle of martial arts in Jordan.</Body>
        <Body>
          Under his leadership, the club has produced countless national team members, international medalists, and champions who carry the Burkan spirit across the globe. His philosophy blends rigorous traditional discipline with modern athletic science.
        </Body>
        <Image source={images.mahmoud} style={{ height: 300, borderRadius: 16, backgroundColor: '#111' }} contentFit="cover" contentPosition="top" />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Image source={images.hero} style={{ flex: 1, height: 200, borderRadius: 16 }} contentFit="cover" contentPosition="top" />
          <Image source={images.rama} style={{ flex: 1, height: 200, borderRadius: 16 }} contentFit="cover" contentPosition="top" />
        </View>

        <SectionTitle>National Pride</SectionTitle>
        <Body>{"Our athletes don't just compete; they dominate. Burkan Taekwondo is a recognized feeder for the Jordanian National Team."}</Body>
        <Body>
          From cadet championships to the Olympic stage, the red and black of Burkan is feared and respected. We train not just for medals, but to represent our country with unparalleled honor and strength.
        </Body>

        <Card style={{ backgroundColor: colors.primary, alignItems: 'center', paddingVertical: 28 }}>
          <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: 28, textTransform: 'uppercase' }}>{t('Join The Family')}</Text>
          <Text style={{ color: '#FFE4E8', fontFamily: fonts.body, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8 }}>
            {t('Whether you are taking your first step onto the mat or aiming for gold on the world stage, Burkan Taekwondo Center is your home.')}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
