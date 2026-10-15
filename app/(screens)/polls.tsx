import { View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  avatarUrl,
  displayName,
  listContentFeed,
  voteContentPoll,
  type FeedContent,
} from '@/lib/api';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

export default function PollsScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['polls'],
    queryFn: async () => (await listContentFeed()).filter((c) => c.kind === 'poll'),
  });

  const vote = useMutation({
    mutationFn: ({ contentId, optionId }: { contentId: string; optionId: string }) =>
      voteContentPoll(contentId, optionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls'] }),
    onError: (e: any) => toast.error(e.message || 'Failed to vote'),
  });

  return (
    <Screen scroll={false}>
      <ScreenHeader
        title="Polls"
        subtitle="Vote on community polls"
        right={
          <Button
            label="New"
            size="sm"
            fullWidth={false}
            onPress={() => router.push('/(screens)/create-poll' as any)}
          />
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load polls'}
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon="trending-up"
          title="No polls yet"
          description="Create the first poll to gather opinions."
          action={
            <Button
              label="Create a poll"
              size="sm"
              fullWidth={false}
              onPress={() => router.push('/(screens)/create-poll' as any)}
            />
          }
        />
      ) : (
        <View className="px-6 pt-2">
          {query.data!.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVote={(optionId) => vote.mutate({ contentId: poll.id, optionId })}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function PollCard({
  poll,
  onVote,
}: {
  poll: FeedContent;
  onVote: (optionId: string) => void;
}) {
  const total = poll.poll_options.reduce((sum, o) => sum + o.vote_count, 0);
  return (
    <Card className="mb-3 gap-3">
      <Text variant="subheading">{poll.title}</Text>
      <View className="flex-row items-center gap-2">
        <Avatar name={displayName(poll.author)} uri={avatarUrl(poll.author?.avatar_path)} size={24} />
        <Text variant="caption">{displayName(poll.author)}</Text>
        <Text variant="caption">· {total} votes</Text>
      </View>

      <View className="gap-2">
        {poll.poll_options.map((opt) => {
          const pct = total > 0 ? Math.round((opt.vote_count / total) * 100) : 0;
          return (
            <Button
              key={opt.id}
              label={`${opt.label}  ${opt.vote_count}${total ? ` (${pct}%)` : ''}`}
              variant={opt.is_selected ? 'primary' : 'outline'}
              size="sm"
              onPress={() => !opt.is_selected && onVote(opt.id)}
            />
          );
        })}
      </View>
    </Card>
  );
}
