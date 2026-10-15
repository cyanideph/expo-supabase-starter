import React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { Icon, type IconName } from './icon';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = 'grid',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center gap-3 px-6 py-16">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Icon name={icon} size={24} color="#9ca3af" />
      </View>
      <Text variant="subheading" className="text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="caption" className="text-center">
          {description}
        </Text>
      ) : null}
      {action ? <View className="mt-2">{action}</View> : null}
    </View>
  );
}
