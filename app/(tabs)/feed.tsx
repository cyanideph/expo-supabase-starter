import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  avatarUrl,
  displayName,
  listContentFeed,
  toggleContentReaction,
  type FeedContent,
} from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

export default function FeedScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['feed'], queryFn: listContentFeed });

  const react = useMutation({
    mutationFn: (id: string) => toggleContentReaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
    onError: (e: any) => toast.error(e.message || 'Failed to react'),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScreenHeader title="Feed" showBack={false} subtitle="Latest from the community" />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load feed'}
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon="feed"
          title="Nothing here yet"
          description="When people post, it will show up in your feed."
        />
      ) : (
        <FlashList
          data={query.data!}
          keyExtractor={(item) => item.id}
          estimatedItemSize={180}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 }}
          refreshing={query.isFetching}
          onRefresh={() => query.refetch()}
          renderItem={({ item }) => (
            <FeedItem item={item} onReact={() => react.mutate(item.id)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function FeedItem({ item, onReact }: { item: FeedContent; onReact: () => void }) {
  const authorName = displayName(item.author);
  return (
    <Card className="mb-3 gap-3">
      <View className="flex-row items-center gap-3">
        <Avatar name={authorName} uri={avatarUrl(item.author?.avatar_path)} size={40} />
        <View className="flex-1">
          <Text className="font-semibold" numberOfLines={1}>
            {authorName}
          </Text>
          <Text variant="caption">{formatRelativeTime(item.created_at)}</Text>
        </View>
      </View>

      {item.title ? <Text variant="subheading">{item.title}</Text> : null}
      {item.body ? <Text>{item.body}</Text> : null}

      {item.poll_options.length > 0 ? (
        <View className="gap-1.5">
          {item.poll_options.map((opt) => (
            <View
              key={opt.id}
              className={`flex-row items-center justify-between rounded-lg border px-3 py-2 ${
                opt.is_selected ? 'border-primary/40 bg-primary/5' : 'border-border'
              }`}
            >
              <Text className="flex-1" numberOfLines={1}>
                {opt.label}
              </Text>
              <Text variant="caption">{opt.vote_count}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="flex-row items-center gap-6 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="React"
          onPress={onReact}
          className="flex-row items-center gap-2 active:opacity-70"
        >
          <Icon name="heart" size={18} color={item.is_liked ? '#ef4444' : '#6b7280'} />
          <Text variant="caption">{item.likes_count}</Text>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Icon name="comment" size={18} color="#6b7280" />
          <Text variant="caption">{item.comments_count}</Text>
        </View>
      </View>
    </Card>
  );
}
