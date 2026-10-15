import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './text';
import { Icon, type IconName } from './icon';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastContextValue {
  show: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { bg: string; fg: string; icon: IconName }> = {
  success: { bg: 'bg-primary', fg: '#ffffff', icon: 'check' },
  error: { bg: 'bg-destructive', fg: '#ffffff', icon: 'x' },
  info: { bg: 'bg-foreground', fg: '#ffffff', icon: 'bell' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(
    null
  );
  const opacity = useRef(new Animated.Value(0)).current;
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      if (timeout.current) clearTimeout(timeout.current);
      setToast({ message, tone });
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      timeout.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, 2600);
    },
    [opacity]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error'),
      info: (m) => show(m, 'info'),
    }),
    [show]
  );

  const style = toast ? toneStyles[toast.tone] : toneStyles.info;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={{ opacity, top: insets.top + 8 }}
          className="absolute inset-x-0 z-50 items-center px-4"
        >
          <View
            className={`flex-row items-center gap-2 rounded-full px-4 py-2.5 shadow-lg ${style.bg}`}
          >
            <Icon name={style.icon} size={16} color={style.fg} />
            <Text className="text-sm font-medium" style={{ color: style.fg }}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
