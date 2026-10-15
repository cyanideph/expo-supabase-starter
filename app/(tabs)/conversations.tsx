import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { avatarUrl, listConversations } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  Avatar,
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';

export default function ConversationsScreen() {
  const query = useQuery({ queryKey: ['conversations'], queryFn: listConversations });

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Messages" showBack={false} subtitle="Your direct chats" />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load conversations'}
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon="comment"
          title="No conversations yet"
          description="Start a chat from a profile or a room to see it here."
        />
      ) : (
        <View className="px-6 pt-2">
          {query.data!.map((conv) => (
            <Pressable
              key={conv.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/(screens)/conversation-detail',
                  params: {
                    conversationId: conv.id,
                    title: conv.participant_display_name ?? conv.participant_username ?? 'Chat',
                  },
                } as any)
              }
              className="mb-1 flex-row items-center gap-3 rounded-xl px-2 py-3 active:bg-secondary"
            >
              <Avatar
                name={conv.participant_display_name ?? conv.participant_username}
                uri={avatarUrl(null)}
                size={48}
              />
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 font-semibold" numberOfLines={1}>
                    {conv.participant_display_name || conv.participant_username || 'Conversation'}
                  </Text>
                  <Text variant="caption">{formatRelativeTime(conv.last_message_at)}</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text variant="caption" numberOfLines={1} className="flex-1 pr-2">
                    {conv.last_message || 'No messages yet'}
                  </Text>
                  {conv.unread_count > 0 ? (
                    <Badge label={String(conv.unread_count)} tone="primary" />
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}
