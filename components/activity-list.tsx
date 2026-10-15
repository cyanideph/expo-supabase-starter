import { Pressable, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listNotifications,
  markNotificationRead,
  type AppNotification,
} from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  Badge,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Text,
  useToast,
} from '@/components/ui';

const TYPE_LABEL: Record<string, string> = {
  follow: 'New follower',
  block: 'Blocked',
  content_comment: 'New comment',
  comment_reply: 'New reply',
  content_reaction: 'New reaction',
  room_message_reaction: 'Room message reaction',
  profile_comment: 'Profile comment',
  mention: 'You were mentioned',
  room_invite: 'Room invite',
  conversation_invite: 'Chat invite',
};

export function ActivityList({
  types,
  emptyTitle,
  emptyDescription,
}: {
  types: string[];
  emptyTitle: string;
  emptyDescription?: string;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['notifications'], queryFn: listNotifications });

  const read = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e: any) => toast.error(e.message || 'Failed to update'),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) {
    return (
      <ErrorState
        message={(query.error as any)?.message ?? 'Failed to load activity'}
        onRetry={() => query.refetch()}
      />
    );
  }

  const items = (query.data ?? []).filter((n) => types.length === 0 || types.includes(n.type));

  if (items.length === 0) {
    return <EmptyState icon="bell" title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <View className="px-6 pt-2">
      {items.map((n) => (
        <ActivityRow key={n.id} item={n} onPress={() => !n.read_at && read.mutate(n.id)} />
      ))}
    </View>
  );
}

function ActivityRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const unread = !item.read_at;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="mb-2 active:opacity-80">
      <View
        className={`flex-row items-start gap-3 rounded-xl border p-4 ${
          unread ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Icon name="bell" size={18} color="#111827" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-medium">{TYPE_LABEL[item.type] ?? 'Notification'}</Text>
            <Text variant="caption">{formatRelativeTime(item.created_at)}</Text>
          </View>
          {item.payload?.preview ? (
            <Text variant="caption" className="mt-0.5" numberOfLines={2}>
              {String(item.payload.preview)}
            </Text>
          ) : null}
        </View>
        {unread ? <Badge label="New" tone="primary" /> : null}
      </View>
    </Pressable>
  );
}
