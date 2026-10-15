import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';

export type BadgeTone = 'default' | 'muted' | 'primary' | 'destructive';

const toneClasses: Record<BadgeTone, string> = {
  default: 'bg-secondary',
  muted: 'bg-muted',
  primary: 'bg-primary',
  destructive: 'bg-destructive',
};

const toneTextClasses: Record<BadgeTone, string> = {
  default: 'text-secondary-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary-foreground',
  destructive: 'text-destructive-foreground',
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ label, tone = 'default', className }: BadgeProps) {
  return (
    <View
      className={cn(
        'self-start rounded-full px-2.5 py-0.5',
        toneClasses[tone],
        className
      )}
    >
      <Text className={cn('text-xs font-medium', toneTextClasses[tone])}>
        {label}
      </Text>
    </View>
  );
}
