import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/lib/theme';
import { t } from '@/lib/i18n';

type ToastKind = 'success' | 'error';
interface ToastState {
  title: string;
  message?: string;
  kind: ToastKind;
}

const ToastContext = createContext<(title: string, message?: string, kind?: ToastKind) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (title: string, message?: string, kind: ToastKind = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ title, message, kind });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToast(null));
      }, 2800);
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 8, opacity }}
        >
          <View
            style={{
              backgroundColor: colors.black,
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              borderStartWidth: 4,
              borderStartColor: toast.kind === 'error' ? colors.danger : colors.success,
            }}
          >
            <Feather
              name={toast.kind === 'error' ? 'alert-circle' : 'check-circle'}
              size={20}
              color={toast.kind === 'error' ? '#F87171' : '#4ADE80'}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 14 }}>{t(toast.title)}</Text>
              {toast.message ? (
                <Text style={{ color: '#D1D5DB', fontFamily: fonts.body, fontSize: 13, marginTop: 2 }}>{t(toast.message)}</Text>
              ) : null}
            </View>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
