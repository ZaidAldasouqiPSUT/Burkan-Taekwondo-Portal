import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow } from '@/lib/theme';
import { isRTL, ls, t } from '@/lib/i18n';
import { initials } from '@/lib/format';

export type IconName = ComponentProps<typeof Feather>['name'];

/** Translates plain-string children; anything else is passed through. */
const tx = (c: ReactNode) => (typeof c === 'string' ? t(c) : c);
/** Right-aligned, right-to-left text in Arabic. */
const dir = (): TextStyle | null => (isRTL() ? { textAlign: 'right', writingDirection: 'rtl' } : null);

// ---------- typography ----------
export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.h1, dir(), style]}>{tx(children)}</Text>;
}
export function Title({ children, style, numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  return (
    <Text style={[s.title, dir(), style]} numberOfLines={numberOfLines}>
      {tx(children)}
    </Text>
  );
}
export function Body({ children, style, numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  return (
    <Text style={[s.body, dir(), style]} numberOfLines={numberOfLines}>
      {tx(children)}
    </Text>
  );
}
export function Muted({ children, style, numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  return (
    <Text style={[s.muted, dir(), style]} numberOfLines={numberOfLines}>
      {tx(children)}
    </Text>
  );
}
export function Overline({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.overline, dir(), style]}>{tx(children)}</Text>;
}

// ---------- layout ----------
export function Screen({
  children,
  onRefresh,
  padded = true,
  style,
}: {
  children: ReactNode;
  onRefresh?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [refreshing, setRefreshing] = useState(false);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[padded && { padding: 16, gap: 16 }, { paddingBottom: 40 }, style]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              onRefresh();
              setTimeout(() => setRefreshing(false), 600);
            }}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <H1>{t(title)}</H1>
        {subtitle ? <Muted style={{ marginTop: 4 }}>{t(subtitle)}</Muted> : null}
      </View>
      {action}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  accent,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accent?: string;
}) {
  const content = [s.card, accent ? { borderStartWidth: 4, borderStartColor: accent } : null, style];
  if (!onPress) return <View style={content}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [content, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}>
      {children}
    </Pressable>
  );
}

export function Row({ children, style, gap = 8 }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 4 }} />;
}

// ---------- controls ----------
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'dark' | 'light';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  size = 'md',
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}) {
  const v = buttonVariants[variant];
  const h = size === 'sm' ? 36 : size === 'lg' ? 54 : 46;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.button,
        { height: h, backgroundColor: v.bg, borderColor: v.border, paddingHorizontal: size === 'sm' ? 12 : 18 },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={size === 'sm' ? 15 : 18} color={v.fg} /> : null}
          <Text style={[s.buttonText, { color: v.fg, fontSize: size === 'sm' ? 12 : size === 'lg' ? 16 : 14 }]}>{t(title)}</Text>
        </>
      )}
    </Pressable>
  );
}

const buttonVariants: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
  outline: { bg: 'transparent', fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
  dark: { bg: colors.black, fg: '#fff', border: colors.black },
  light: { bg: 'transparent', fg: '#fff', border: '#fff' },
};

export function IconButton({ icon, onPress, color = colors.text, label }: { icon: IconName; onPress: () => void; color?: string; label: string }) {
  return (
    <Pressable accessibilityLabel={t(label)} hitSlop={10} onPress={onPress} style={({ pressed }) => [{ padding: 6 }, pressed && { opacity: 0.6 }]}>
      <Feather name={icon} size={20} color={color} />
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  error,
  multiline,
  style,
  placeholder,
  ...props
}: ComponentProps<typeof TextInput> & { label: string; hint?: string; error?: string | null }) {
  return (
    <View style={{ gap: 6 }}>
      <Overline style={{ color: colors.muted }}>{t(label)}</Overline>
      <TextInput
        placeholder={placeholder ? t(placeholder) : undefined}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        style={[s.input, { fontFamily: fonts.body }, isRTL() && { textAlign: 'right' }, multiline && { height: 110, textAlignVertical: 'top', paddingTop: 12 }, error ? { borderColor: colors.danger } : null, style]}
        {...props}
      />
      {error ? <Text style={[s.small, dir(), { color: colors.danger }]}>{t(error)}</Text> : hint ? <Text style={[s.small, dir()]}>{t(hint)}</Text> : null}
    </View>
  );
}

export function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
  multi,
}: {
  label?: string;
  options: { value: T; label: string }[];
  value: T | T[];
  onChange: (v: T) => void;
  multi?: boolean;
}) {
  const selected = (o: T) => (multi ? (value as T[]).includes(o) : value === o);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Overline style={{ color: colors.muted }}>{t(label)}</Overline> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[s.chip, selected(o.value) && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={[s.chipText, selected(o.value) && { color: '#fff' }]}>{t(o.label)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function Toggle({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
      <View style={{ flex: 1 }}>
        <Body style={{ fontFamily: fonts.semibold }}>{label}</Body>
        {description ? <Muted style={{ marginTop: 2 }}>{description}</Muted> : null}
      </View>
      <View style={[s.switch, value && { backgroundColor: colors.primary }]}>
        <View style={[s.knob, value && { transform: [{ translateX: isRTL() ? -20 : 20 }] }]} />
      </View>
    </Pressable>
  );
}

// ---------- display ----------
type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dark';
const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: '#F3F4F6', fg: '#374151' },
  primary: { bg: colors.primarySoft, fg: colors.primary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  info: { bg: colors.infoSoft, fg: colors.info },
  dark: { bg: colors.black, fg: '#fff' },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const tone_ = tones[tone];
  return (
    <View style={{ backgroundColor: tone_.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' }}>
      <Text style={{ color: tone_.fg, fontFamily: fonts.bold, fontSize: 10, letterSpacing: ls(0.6), textTransform: 'uppercase' }}>{t(label)}</Text>
    </View>
  );
}

export const statusTone = (status: string): Tone => {
  switch (status) {
    case 'Present':
    case 'Paid':
    case 'Active':
    case 'Approved':
    case 'approved':
      return 'success';
    case 'Late':
    case 'Due':
    case 'Pending':
    case 'pending':
    case 'Registered':
      return 'warning';
    case 'Absent':
    case 'Declined':
    case 'rejected':
      return 'danger';
    case 'Excused':
      return 'info';
    default:
      return 'neutral';
  }
};

export function Avatar({ name, size = 44, color = colors.primary }: { name: string; size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontFamily: fonts.display, fontSize: size * 0.38 }}>{initials(name)}</Text>
    </View>
  );
}

export function StatCard({ icon, label, value, tone = 'neutral', onPress }: { icon: IconName; label: string; value: string | number; tone?: Tone; onPress?: () => void }) {
  const tn = tones[tone];
  const highlight = tone === 'primary' || tone === 'warning';
  return (
    <Card onPress={onPress} style={[{ flex: 1, minWidth: '46%', padding: 16 }, highlight && { backgroundColor: tn.bg }]}>
      <Feather name={icon} size={24} color={tone === 'neutral' ? colors.primary : tn.fg} />
      <Overline style={{ marginTop: 12, color: highlight ? tn.fg : colors.muted }}>{t(label)}</Overline>
      <Text style={[s.stat, highlight && { color: tn.fg }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </Card>
  );
}

export function Empty({ icon = 'inbox', title, message }: { icon?: IconName; title: string; message?: string }) {
  return (
    <Card style={{ alignItems: 'center', paddingVertical: 36, borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.border, shadowOpacity: 0, elevation: 0 }}>
      <Feather name={icon} size={36} color="#C4C7CC" />
      <Title style={{ marginTop: 12, fontSize: 18 }}>{title}</Title>
      {message ? <Muted style={{ marginTop: 4, textAlign: 'center' }}>{message}</Muted> : null}
    </Card>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={{ paddingVertical: 48, alignItems: 'center', gap: 10 }}>
      <ActivityIndicator color={colors.primary} size="large" />
      {label ? <Muted>{label}</Muted> : null}
    </View>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={{ backgroundColor: colors.dangerSoft, padding: 12, borderRadius: radius.md, flexDirection: 'row', gap: 8 }}>
      <Feather name="alert-circle" size={18} color={colors.danger} />
      <Text style={[s.small, dir(), { color: colors.danger, flex: 1, fontSize: 13 }]}>{t(message)}</Text>
    </View>
  );
}

export function Restricted({ message }: { message: string }) {
  return (
    <Screen>
      <View style={{ alignItems: 'center', paddingTop: 80, paddingHorizontal: 24 }}>
        <Feather name="lock" size={52} color={colors.muted} />
        <Title style={{ marginTop: 16, fontSize: 24 }}>Access Restricted</Title>
        <Muted style={{ textAlign: 'center', marginTop: 8 }}>{message}</Muted>
      </View>
    </Screen>
  );
}

export function KeyValue({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }}>
      <Muted>{label}</Muted>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Body style={{ fontFamily: strong ? fonts.bold : fonts.semibold }}>{value}</Body>
      ) : (
        value
      )}
    </Row>
  );
}

// ---------- bottom sheet ----------
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} />
        </Pressable>
        <View style={[s.sheet, { direction: isRTL() ? 'rtl' : 'ltr', paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={s.grabber} />
          <Row style={{ alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Title style={{ fontSize: 22 }}>{title}</Title>
              {subtitle ? <Muted style={{ marginTop: 2 }}>{subtitle}</Muted> : null}
            </View>
            <IconButton icon="x" label="Close" onPress={onClose} color={colors.muted} />
          </Row>
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 14, paddingVertical: 8 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function confirm(title: string, message: string, onConfirm: () => void, confirmLabel = 'Delete') {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${t(title)}\n\n${t(message)}`)) onConfirm();
    return;
  }
  Alert.alert(t(title), t(message), [
    { text: t('Cancel'), style: 'cancel' },
    { text: t(confirmLabel), style: 'destructive', onPress: onConfirm },
  ]);
}

const makeStyles = () =>
  StyleSheet.create({
  h1: { fontFamily: fonts.display, fontSize: 30, color: colors.text, textTransform: 'uppercase', letterSpacing: ls(-0.5) },
  title: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 15, color: colors.text, lineHeight: 22 },
  muted: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 19 },
  overline: { fontFamily: fonts.bold, fontSize: 11, color: colors.primary, letterSpacing: ls(1.2), textTransform: 'uppercase' },
  small: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, ...shadow },
  button: { borderRadius: radius.md, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { fontFamily: fonts.bold, textTransform: 'uppercase', letterSpacing: ls(1) },
  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  switch: { width: 46, height: 26, borderRadius: 13, backgroundColor: '#D1D5DB', padding: 3 },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  stat: { fontFamily: fonts.display, fontSize: 28, color: colors.text, marginTop: 2 },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, maxHeight: '90%' },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12 },
});

// Styles depend on the active language (fonts, letter-spacing), so they are built per language.
let cache: { rtl: boolean; styles: ReturnType<typeof makeStyles> } | null = null;
const s = new Proxy({} as ReturnType<typeof makeStyles>, {
  get: (_, key: keyof ReturnType<typeof makeStyles>) => {
    if (!cache || cache.rtl !== isRTL()) cache = { rtl: isRTL(), styles: makeStyles() };
    return cache.styles[key];
  },
});
