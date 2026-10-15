import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { avatarUrl, displayName, listFeaturedProfiles } from '@/lib/api';
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';

export default function FeaturedProfilesScreen() {
  const query = useQuery({
    queryKey: ['featured-profiles'],
    queryFn: listFeaturedProfiles,
  });

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Featured profiles" subtitle="People worth following" />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load featured profiles'}
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState icon="star" title="No featured profiles" />
      ) : (
        <View className="px-6 pt-2">
          {query.data!.map((item, index) => (
            <Card key={item.profile.id} className="mb-3 flex-row items-center gap-3">
              <Avatar
                name={displayName(item.profile)}
                uri={avatarUrl(item.profile.avatar_path)}
                size={52}
              />
              <View className="flex-1">
                <Text className="font-semibold">{displayName(item.profile)}</Text>
                <Text variant="caption" numberOfLines={1}>
                  {item.profile.status_text || item.profile.bio || 'No status'}
                </Text>
              </View>
              <Badge label={`#${index + 1}`} tone="muted" />
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
