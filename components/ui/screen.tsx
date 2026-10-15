import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  type ScrollViewProps,
  View,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';
import { Text } from './text';
import { Button } from './button';

export interface ScreenProps {
  children: React.ReactNode;
  /** Wrap children in a ScrollView (default true). Set false for lists. */
  scroll?: boolean;
  /** Horizontal padding applied to the content. */
  padded?: boolean;
  className?: string;
  edges?: Edge[];
  refreshControl?: ScrollViewProps['refreshControl'];
}

/** Page shell: safe area + consistent background, horizontal padding and bottom spacing. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  className,
  edges = ['top'],
  refreshControl,
}: ScreenProps) {
  const inner = (
    <View className={cn(padded && 'px-6', 'pb-16')}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-background', className)}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

export function LoadingState({ label }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background py-24">
      <ActivityIndicator size="large" />
      {label ? <Text variant="caption">{label}</Text> : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-6 py-24">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <Text className="text-xl text-destructive">!</Text>
      </View>
      <Text variant="subheading" className="text-center">
        Something went wrong
      </Text>
      <Text variant="caption" className="text-center">
        {message}
      </Text>
      {onRetry ? (
        <Button
          label="Try again"
          variant="outline"
          size="sm"
          fullWidth={false}
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}
