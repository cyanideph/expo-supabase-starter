import { useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabase';
import { listRoomMessages, sendRoomMessage } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  Avatar,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

export default function RoomDetailScreen() {
  const { roomId, name } = useLocalSearchParams<{ roomId: string; name?: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const [draft, setDraft] = useState('');

  const messages = useQuery({
    queryKey: ['room-messages', roomId],
    enabled: !!roomId,
    queryFn: () => listRoomMessages(roomId),
  });

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room_messages_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['room-messages', roomId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  const send = useMutation({
    mutationFn: () => sendRoomMessage(roomId, draft.trim()),
    onSuccess: () => {
      setDraft('');
      queryClient.invalidateQueries({ queryKey: ['room-messages', roomId] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to send'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScreenHeader title={name || 'Room'} />

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
            icon="rooms"
            title="No messages yet"
            description="Be the first to say something in this room."
          />
        ) : (
          <View className="flex-1 px-6">
            {messages.data!.map((msg) => {
              const mine = msg.mine ?? msg.sender_id === user?.id;
              return (
                <View
                  key={msg.id}
                  className={`my-1 max-w-[80%] flex-row gap-2 ${
                    mine ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <Avatar name={msg.sender_name} size={28} />
                  <View className={mine ? 'items-end' : 'items-start'}>
                    {!mine ? (
                      <Text variant="caption" className="px-1">
                        {msg.sender_name || 'Someone'}
                      </Text>
                    ) : null}
                    <View
                      className={`rounded-2xl px-3.5 py-2 ${
                        mine ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      <Text
                        className={
                          mine ? 'text-primary-foreground' : 'text-secondary-foreground'
                        }
                      >
                        {msg.body}
                      </Text>
                    </View>
                    <Text variant="caption" className="mt-0.5 px-1">
                      {formatRelativeTime(msg.created_at)}
                    </Text>
                  </View>
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
            className="h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80"
            style={{ opacity: !draft.trim() || send.isPending ? 0.4 : 1 }}
          >
            <Icon name="send" size={18} color="#ffffff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
