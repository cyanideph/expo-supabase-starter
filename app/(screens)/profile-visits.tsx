import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { avatarUrl, displayName, listProfileVisitors } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';

export default function ProfileVisitsScreen() {
  const query = useQuery({ queryKey: ['profile-visitors'], queryFn: listProfileVisitors });

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Profile visitors" subtitle="Who viewed your profile" />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load visitors'}
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState icon="eye" title="No visitors yet" />
      ) : (
        <View className="px-6 pt-2">
          {query.data!.map((visit) => (
            <Card key={visit.id} className="mb-3 flex-row items-center gap-3">
              <Avatar
                name={displayName(visit.visitor)}
                uri={avatarUrl(visit.visitor?.avatar_path)}
                size={44}
              />
              <View className="flex-1">
                <Text className="font-medium">{displayName(visit.visitor)}</Text>
                <Text variant="caption">
                  {visit.visitor?.status_text || 'Visited your profile'}
                </Text>
              </View>
              <Text variant="caption">{formatRelativeTime(visit.visited_at)}</Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
