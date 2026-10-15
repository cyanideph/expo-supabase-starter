import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRoom, listRooms, type Room } from '@/lib/api';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  Input,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';

export default function RoomsScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const roomsQuery = useQuery({ queryKey: ['rooms'], queryFn: listRooms });

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const create = useMutation({
    mutationFn: () => createRoom({ name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setName('');
      setDescription('');
      setShowCreate(false);
      toast.success('Room created');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to create room'),
  });

  return (
    <Screen scroll={false}>
      <ScreenHeader
        title="Rooms"
        showBack={false}
        subtitle="Public chat rooms"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create room"
            onPress={() => setShowCreate((v) => !v)}
            className="h-9 w-9 items-center justify-center rounded-full bg-primary active:opacity-80"
          >
            <Icon name="plus" size={18} color="#ffffff" />
          </Pressable>
        }
      />

      {showCreate ? (
        <View className="px-6 py-2">
          <Card className="gap-3">
            <Input
              label="Room name"
              placeholder="e.g. Cebu Night Owls"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Description"
              placeholder="What is this room about?"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <View className="flex-row justify-end gap-2">
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setShowCreate(false)}
              />
              <Button
                label="Create"
                size="sm"
                fullWidth={false}
                onPress={() => create.mutate()}
                loading={create.isPending}
                disabled={!name.trim()}
              />
            </View>
          </Card>
        </View>
      ) : null}

      {roomsQuery.isLoading ? (
        <LoadingState />
      ) : roomsQuery.isError ? (
        <ErrorState
          message={(roomsQuery.error as any)?.message ?? 'Failed to load rooms'}
          onRetry={() => roomsQuery.refetch()}
        />
      ) : (roomsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon="rooms"
          title="No rooms yet"
          description="Create the first room to get the conversation going."
          action={
            <Button
              label="Create a room"
              size="sm"
              fullWidth={false}
              onPress={() => setShowCreate(true)}
            />
          }
        />
      ) : (
        <View className="px-6 pt-2">
          {roomsQuery.data!.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              onPress={() =>
                router.push({
                  pathname: '/(screens)/room-detail',
                  params: { roomId: room.id },
                } as any)
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

function RoomRow({ room, onPress }: { room: Room; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mb-3 active:opacity-80"
    >
      <Card className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 font-semibold" numberOfLines={1}>
            {room.name}
          </Text>
          <Badge label={room.kind} tone="muted" />
        </View>
        {room.description ? (
          <Text variant="caption" numberOfLines={2}>
            {room.description}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-1">
          <Icon name="rooms" size={14} color="#9ca3af" />
          <Text variant="caption">
            {new Date(room.created_at).toLocaleDateString()}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
