import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui';
import { EmailPasswordForm } from './EmailPasswordForm';
import { MagicLinkForm } from './MagicLinkForm';
import { PhoneAuthForm } from './PhoneAuthForm';

export const AUTH_PROVIDERS = [
  'email',
  'magic-link',
  'google',
  'apple',
  'phone',
] as const;

type AuthMethod = 'email' | 'magic-link' | 'phone';

const METHODS: { key: AuthMethod; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'magic-link', label: 'Magic link' },
  { key: 'phone', label: 'Phone' },
];

export function AuthMethods({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [active, setActive] = useState<AuthMethod>('email');

  return (
    <View className="gap-6">
      <View className="flex-row rounded-lg bg-secondary p-1">
        {METHODS.map((m) => {
          const selected = active === m.key;
          return (
            <Pressable
              key={m.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setActive(m.key)}
              className={cn(
                'flex-1 items-center rounded-md py-2',
                selected && 'bg-background'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium',
                  selected ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {active === 'email' ? <EmailPasswordForm mode={mode} /> : null}
      {active === 'magic-link' ? <MagicLinkForm /> : null}
      {active === 'phone' ? <PhoneAuthForm /> : null}
    </View>
  );
}
