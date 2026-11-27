import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, images, radius } from '@/lib/theme';
import { H1, Muted } from './ui';
import { useLanguage } from '@/lib/i18n';

export function AuthBackdrop({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { lang, setLang } = useLanguage();
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image source={images.hero} style={[StyleSheet.absoluteFill, { opacity: 0.4 }]} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: radius.xl, padding: 24, gap: 16 }}>
            <View style={{ alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Feather name="award" size={30} color="#fff" />
              </View>
              <H1 style={{ textAlign: 'center' }}>{title}</H1>
              <Muted style={{ textAlign: 'center', fontSize: 15 }}>{subtitle}</Muted>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Pressable
        accessibilityRole="button"
        onPress={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        style={{ position: 'absolute', top: insets.top + 10, end: 16, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' }}
      >
        <Feather name="globe" size={15} color="#fff" />
        <Text style={{ color: '#fff', fontFamily: fonts.semibold, fontSize: 13 }}>{lang === 'ar' ? 'English' : 'العربية'}</Text>
      </Pressable>
    </View>
  );
}
