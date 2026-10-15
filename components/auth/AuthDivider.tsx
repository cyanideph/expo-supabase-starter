import React from 'react';
import { View } from 'react-native';
import { Divider, Text } from '@/components/ui';

export function AuthDivider({ text = 'or' }: { text?: string }) {
  return (
    <View className="my-6 flex-row items-center gap-3">
      <View className="flex-1">
        <Divider />
      </View>
      <Text variant="caption" className="uppercase tracking-wider">
        {text}
      </Text>
      <View className="flex-1">
        <Divider />
      </View>
    </View>
  );
}
