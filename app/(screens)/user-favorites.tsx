import { Pressable, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { avatarUrl, displayName, listFavoriteUsers, toggleFavorite } from '@/lib/api';
import {
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

export default function UserFavoritesScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['favorites'], queryFn: listFavoriteUsers });

  const unfavorite = useMutation({
    mutationFn: (userId: string) => toggleFavorite(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    onError: (e: any) => toast.error(e.message || 'Failed to update'),
  });

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Favorites" subtitle="People you starred" />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load favorites'}
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState icon="star" title="No favorites yet" description="Star people to find them quickly." />
      ) : (
        <View className="px-6 pt-2">
          {query.data!.map((user) => (
            <Card key={user.user_id} className="mb-3 flex-row items-center gap-3">
              <Avatar name={displayName(user)} uri={avatarUrl(user.avatar_path)} size={44} />
              <View className="flex-1">
                <Text className="font-semibold">{displayName(user)}</Text>
                <Text variant="caption">
                  {user.is_online ? 'Online' : 'Offline'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove from favorites"
                onPress={() => unfavorite.mutate(user.user_id)}
                className="h-9 w-9 items-center justify-center rounded-full bg-secondary active:opacity-70"
              >
                <Icon name="star" size={16} color="#f59e0b" />
              </Pressable>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
