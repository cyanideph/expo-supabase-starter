import React from 'react';
import { Image, View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';

export interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
  className?: string;
}

function initials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, uri, size = 40, className }: AvatarProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn(
        'items-center justify-center overflow-hidden border border-border bg-secondary',
        className
      )}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        <Text
          className="font-semibold text-secondary-foreground"
          style={{ fontSize: size * 0.4 }}
        >
          {initials(name)}
        </Text>
      )}
    </View>
  );
}
