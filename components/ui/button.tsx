import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  View,
} from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

const containerVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'border border-border bg-transparent',
  ghost: 'bg-transparent',
  destructive: 'bg-destructive',
};

const labelVariants: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-destructive-foreground',
};

const sizeVariants: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-2',
  md: 'min-h-11 px-4 py-3',
  lg: 'min-h-12 px-5 py-3.5',
};

/** Concrete colours for the spinner (RN can't read CSS variables). */
const spinnerColor: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: '#111827',
  outline: '#111827',
  ghost: '#111827',
  destructive: '#ffffff',
};

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-lg active:opacity-80',
        containerVariants[variant],
        sizeVariants[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text
            className={cn('text-center font-semibold', labelVariants[variant])}
          >
            {label}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}
