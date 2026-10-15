import React, { forwardRef } from 'react';
import {
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { cn } from '@/lib/utils';
import { Text } from './text';

export interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, error, containerClassName, className, ...props },
  ref
) {
  const { colorScheme } = useColorScheme();
  const placeholderColor = colorScheme === 'dark' ? '#6b7280' : '#9ca3af';

  return (
    <View className={cn('gap-2', containerClassName)}>
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderColor}
        className={cn(
          'min-h-11 rounded-lg border bg-background px-4 py-3 text-base text-foreground',
          error ? 'border-destructive' : 'border-border',
          props.editable === false && 'opacity-60',
          className
        )}
        {...props}
      />
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
});

export function FieldGroup({ className, ...props }: ViewProps) {
  return <View className={cn('gap-4', className)} {...props} />;
}
