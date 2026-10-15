import React from 'react';
import { Pressable, View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from './text';
import { Icon, type IconName } from './icon';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  className?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  iconColor,
  right,
  onPress,
  showChevron = false,
  destructive = false,
  className,
}: ListRowProps) {
  const content = (
    <View className="flex-row items-center gap-3 py-3.5">
      {icon ? (
        <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Icon name={icon} size={18} color={iconColor ?? '#111827'} />
        </View>
      ) : null}
      <View className="flex-1">
        <Text
          className={cn(
            'font-medium',
            destructive ? 'text-destructive' : 'text-foreground'
          )}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" className="mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {showChevron ? (
        <Icon name="chevron-right" size={18} color="#9ca3af" />
      ) : null}
    </View>
  );

  if (!onPress) return <View className={className}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn('active:opacity-70', className)}
    >
      {content}
    </Pressable>
  );
}
