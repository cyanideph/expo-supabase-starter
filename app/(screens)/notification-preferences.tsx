import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferences,
  setNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/api';
import {
  Button,
  Card,
  Divider,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  ToggleRow,
  useToast,
} from '@/components/ui';

type Key = keyof NotificationPreferences;

const OPTIONS: { key: Key; label: string; description: string }[] = [
  { key: 'follow_enabled', label: 'New followers', description: 'When someone follows you' },
  { key: 'mention_enabled', label: 'Mentions', description: 'When you are @mentioned' },
  { key: 'content_comment_enabled', label: 'Comments', description: 'Comments on your posts' },
  { key: 'comment_reply_enabled', label: 'Replies', description: 'Replies to your comments' },
  { key: 'content_reaction_enabled', label: 'Reactions', description: 'Reactions on your posts' },
  { key: 'profile_comment_enabled', label: 'Profile comments', description: 'Comments on your profile' },
  { key: 'room_message_reaction_enabled', label: 'Room reactions', description: 'Reactions to your room messages' },
  { key: 'room_invite_enabled', label: 'Room invites', description: 'Invitations to rooms' },
  { key: 'conversation_invite_enabled', label: 'Chat invites', description: 'Invitations to direct chats' },
  { key: 'block_enabled', label: 'Blocks', description: 'When someone blocks you' },
];

export default function NotificationPreferencesScreen() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getNotificationPreferences,
  });

  const [prefs, setPrefs] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );

  useEffect(() => {
    if (query.data) setPrefs(query.data);
  }, [query.data]);

  const save = useMutation({
    mutationFn: () => setNotificationPreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferences saved');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to save preferences'),
  });

  if (query.isLoading) {
    return (
      <Screen scroll={false}>
        <ScreenHeader title="Notifications" />
        <LoadingState />
      </Screen>
    );
  }

  if (query.isError) {
    return (
      <Screen scroll={false}>
        <ScreenHeader title="Notifications" />
        <ErrorState
          message={(query.error as any)?.message ?? 'Failed to load preferences'}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Notifications" subtitle="Choose what you hear about" />

      <Card className="mt-2 px-4">
        {OPTIONS.map((opt, i) => (
          <View key={opt.key}>
            {i > 0 ? <Divider /> : null}
            <ToggleRow
              label={opt.label}
              description={opt.description}
              value={prefs[opt.key]}
              onValueChange={(value) => setPrefs((p) => ({ ...p, [opt.key]: value }))}
            />
          </View>
        ))}
      </Card>

      <View className="mt-6">
        <Button
          label="Save preferences"
          onPress={() => save.mutate()}
          loading={save.isPending}
        />
      </View>
    </Screen>
  );
}
