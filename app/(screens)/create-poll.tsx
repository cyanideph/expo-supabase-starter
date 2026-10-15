import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContent } from '@/lib/api';
import {
  Button,
  Card,
  Icon,
  Input,
  Screen,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

export default function CreatePollScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  function setOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  const create = useMutation({
    mutationFn: () =>
      createContent({
        kind: 'poll',
        title: question.trim(),
        metadata: { options: options.map((o) => o.trim()).filter(Boolean) },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      toast.success('Poll created');
      router.back();
    },
    onError: (e: any) => toast.error(e.message || 'Failed to create poll'),
  });

  const valid =
    question.trim().length > 0 && options.filter((o) => o.trim()).length >= 2;

  return (
    <Screen>
      <ScreenHeader title="Create poll" subtitle="Ask the community a question" />

      <Card className="mt-2 gap-4">
        <Input
          label="Question"
          placeholder="What should we do this weekend?"
          value={question}
          onChangeText={setQuestion}
        />

        <View className="gap-3">
          <Text variant="label">Options</Text>
          {options.map((opt, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <View className="flex-1">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChangeText={(t) => setOption(i, t)}
                />
              </View>
              {options.length > 2 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove option"
                  onPress={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                  className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-70"
                >
                  <Icon name="x" size={16} color="#111827" />
                </Pressable>
              ) : null}
            </View>
          ))}
          {options.length < 6 ? (
            <Button
              label="Add option"
              variant="ghost"
              size="sm"
              fullWidth={false}
              leftIcon={<Icon name="plus" size={16} color="#111827" />}
              onPress={() => setOptions((prev) => [...prev, ''])}
            />
          ) : null}
        </View>
      </Card>

      <View className="mt-6">
        <Button
          label="Publish poll"
          onPress={() => create.mutate()}
          loading={create.isPending}
          disabled={!valid}
        />
      </View>
    </Screen>
  );
}
