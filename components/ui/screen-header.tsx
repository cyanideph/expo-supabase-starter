import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from './text';
import { Icon } from './icon';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Show a back chevron (default: only when there is history to pop). */
  showBack?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack,
  right,
}: ScreenHeaderProps) {
  const router = useRouter();
  const canGoBack = showBack ?? router.canGoBack();

  return (
    <View className="flex-row items-start gap-3 px-6 pt-4 pb-2">
      {canGoBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="mt-1 h-9 w-9 items-center justify-center rounded-full bg-secondary active:opacity-70"
          hitSlop={8}
        >
          <Icon name="chevron-left" size={20} color="#111827" />
        </Pressable>
      ) : null}
      <View className="flex-1">
        <Text variant="heading">{title}</Text>
        {subtitle ? (
          <Text variant="caption" className="mt-1">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
