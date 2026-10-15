import { View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listRoomInvites, respondRoomInvite } from '@/lib/api';
import {
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

export default function RoomInvitesScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['room-invites'], queryFn: listRoomInvites });

  const respond = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      respondRoomInvite(id, accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-invites'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to respond'),
  });

  return (
    <Screen scroll={false}>
      <ScreenHeader title="Room invites" subtitle="Invitations to join rooms" />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load invites'}
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState icon="rooms" title="No pending invites" />
      ) : (
        <View className="px-6 pt-2">
          {query.data!.map((invite) => (
            <Card key={invite.id} className="mb-3 gap-3">
              <View>
                <Text className="font-semibold">{invite.room_name ?? 'Room'}</Text>
                <Text variant="caption">
                  Invited by {invite.inviter_name ?? 'someone'}
                </Text>
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Button
                    label="Accept"
                    size="sm"
                    onPress={() => respond.mutate({ id: invite.id, accept: true })}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    label="Decline"
                    variant="outline"
                    size="sm"
                    onPress={() => respond.mutate({ id: invite.id, accept: false })}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
