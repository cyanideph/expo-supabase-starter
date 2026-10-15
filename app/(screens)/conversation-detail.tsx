import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/lib/useAuth';
import {
  listConversationMessages,
  sendConversationMessage,
} from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

export default function ConversationDetailScreen() {
  const { conversationId, title } = useLocalSearchParams<{
    conversationId: string;
    title?: string;
  }>();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const [draft, setDraft] = useState('');

  const messages = useQuery({
    queryKey: ['conversation-messages', conversationId],
    enabled: !!conversationId,
    queryFn: () => listConversationMessages(conversationId),
    refetchInterval: 5000,
  });

  const send = useMutation({
    mutationFn: () => sendConversationMessage(conversationId, draft.trim()),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({
        queryKey: ['conversation-messages', conversationId],
      });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to send'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScreenHeader title={title || 'Chat'} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {messages.isLoading ? (
          <LoadingState />
        ) : messages.isError ? (
          <ErrorState
            message={(messages.error as any)?.message ?? 'Failed to load messages'}
            onRetry={() => messages.refetch()}
          />
        ) : (messages.data?.length ?? 0) === 0 ? (
          <EmptyState
            icon="comment"
            title="No messages yet"
            description="Say hello to get the conversation started."
          />
        ) : (
          <View className="flex-1 px-6">
            {messages.data!.map((msg) => {
              const mine = msg.sender_id === user?.id;
              return (
                <View
                  key={msg.id}
                  className={`my-1 max-w-[80%] ${
                    mine ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <View
                    className={`rounded-2xl px-3.5 py-2 ${
                      mine ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <Text className={mine ? 'text-primary-foreground' : 'text-secondary-foreground'}>
                      {msg.body}
                    </Text>
                  </View>
                  <Text variant="caption" className="mt-0.5 px-1">
                    {formatRelativeTime(msg.created_at)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <View className="flex-row items-end gap-2 border-t border-border px-4 py-3">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message…"
            placeholderTextColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
            multiline
            className="max-h-28 flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-base text-foreground"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim() || send.isPending}
            onPress={() => send.mutate()}
            className="h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80 disabled:opacity-40"
          >
            <Icon name="send" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
