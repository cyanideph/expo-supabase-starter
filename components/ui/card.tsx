import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface CardProps extends ViewProps {
  className?: string;
  padded?: boolean;
}

export function Card({ className, padded = true, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-xl border border-border bg-card',
        padded && 'p-4',
        className
      )}
      {...props}
    />
  );
}
