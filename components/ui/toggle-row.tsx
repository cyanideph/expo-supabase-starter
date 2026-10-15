import React from 'react';
import { Switch, View } from 'react-native';
import { Text } from './text';

export interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-4 py-3">
      <View className="flex-1">
        <Text className="font-medium text-foreground">{label}</Text>
        {description ? (
          <Text variant="caption" className="mt-0.5">
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
      />
    </View>
  );
}
