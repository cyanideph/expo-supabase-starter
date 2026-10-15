import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { listModerationHistory, listRooms } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  ListRow,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';

export default function ModerationActionsScreen() {
  const { roomId: roomIdParam, name } = useLocalSearchParams<{
    roomId?: string;
    name?: string;
  }>();
  const [roomId, setRoomId] = useState<string | undefined>(roomIdParam);

  const rooms = useQuery({
    queryKey: ['rooms'],
    enabled: !roomId,
    queryFn: listRooms,
  });

  const history = useQuery({
    queryKey: ['moderation-history', roomId],
    enabled: !!roomId,
    queryFn: () => listModerationHistory(roomId!),
  });

  if (!roomId) {
    return (
      <Screen scroll={false}>
        <ScreenHeader title="Moderation" subtitle="Pick a room to review" />
        {rooms.isLoading ? (
          <LoadingState />
        ) : rooms.isError ? (
          <ErrorState
            message={(rooms.error as any)?.message ?? 'Failed to load rooms'}
            onRetry={() => rooms.refetch()}
          />
        ) : (rooms.data?.length ?? 0) === 0 ? (
          <EmptyState icon="shield" title="No rooms available" />
        ) : (
          <View className="px-6 pt-2">
            <Card padded={false} className="px-4">
              {rooms.data!.map((room) => (
                <ListRow
                  key={room.id}
                  title={room.name}
                  subtitle={room.description ?? undefined}
                  showChevron
                  onPress={() => setRoomId(room.id)}
                />
              ))}
            </Card>
          </View>
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Moderation" subtitle={name ?? 'Room history'} />

      {history.isLoading ? (
        <LoadingState />
      ) : history.isError ? (
        <ErrorState
          message={(history.error as any)?.message ?? 'Failed to load history'}
          onRetry={() => history.refetch()}
        />
      ) : (history.data?.length ?? 0) === 0 ? (
        <EmptyState icon="shield" title="No moderation actions" />
      ) : (
        <View className="px-6 pt-2">
          {history.data!.map((action) => (
            <Card key={action.id} className="mb-3 gap-2">
              <View className="flex-row items-center justify-between">
                <Badge label={action.action} tone="muted" />
                <Text variant="caption">{formatRelativeTime(action.created_at)}</Text>
              </View>
              {action.reason ? <Text variant="caption">{action.reason}</Text> : null}
            </Card>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => setRoomId(undefined)}
            className="mt-2 items-center active:opacity-70"
          >
            <Text variant="caption">Choose another room</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}
