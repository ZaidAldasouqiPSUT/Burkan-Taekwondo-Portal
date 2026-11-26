import { ActivityIndicator, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, images } from '@/lib/theme';

export function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <Image source={images.logo} style={{ width: 240, height: 135 }} contentFit="contain" />
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
