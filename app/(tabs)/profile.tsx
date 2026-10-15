import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/useAuth';
import { useThemeStore, type ThemePreference } from '@/lib/theme';
import { getMyProfile, updateMyProfile, type Profile } from '@/lib/api';
import {
  Button,
  Card,
  Divider,
  ErrorState,
  Input,
  ListRow,
  LoadingState,
  Screen,
  ScreenHeader,
  Text,
  useToast,
} from '@/components/ui';
import { Avatar } from '@/components/profile/Avatar';

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

const LINKS: { title: string; subtitle: string; href: string }[] = [
  { title: 'Notifications', subtitle: 'Activity and alerts', href: '/(screens)/notifications' },
  { title: 'Notification preferences', subtitle: 'Choose what you hear about', href: '/(screens)/notification-preferences' },
  { title: 'Mentions', subtitle: 'Where you were @mentioned', href: '/(screens)/message-mentions' },
  { title: 'Reactions', subtitle: 'Reactions to your activity', href: '/(screens)/message-reactions' },
  { title: 'Replies', subtitle: 'Replies to your comments', href: '/(screens)/message-replies' },
  { title: 'Polls', subtitle: 'Vote on community polls', href: '/(screens)/polls' },
  { title: 'Content categories', subtitle: 'Browse by topic', href: '/(screens)/content-categories' },
  { title: 'Featured profiles', subtitle: 'People worth following', href: '/(screens)/featured-profiles' },
  { title: 'Favorites', subtitle: 'People you starred', href: '/(screens)/user-favorites' },
  { title: 'Check-ins', subtitle: 'Streaks and points', href: '/(screens)/user-check-ins' },
  { title: 'Profile visitors', subtitle: 'Who viewed you', href: '/(screens)/profile-visits' },
  { title: 'Room invites', subtitle: 'Pending room invitations', href: '/(screens)/room-invites' },
  { title: 'Conversation invites', subtitle: 'Pending chat invitations', href: '/(screens)/conversation-invites' },
  { title: 'Reports', subtitle: 'Community reports', href: '/(screens)/reports' },
  { title: 'Moderation', subtitle: 'Moderation history', href: '/(screens)/moderation-actions' },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: () => getMyProfile(user!.id),
  });

  const [form, setForm] = useState<Partial<Profile>>({});
  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        display_name: profileQuery.data.display_name ?? '',
        username: profileQuery.data.username ?? '',
        bio: profileQuery.data.bio ?? '',
        status_text: profileQuery.data.status_text ?? '',
        province: profileQuery.data.province ?? '',
      });
    }
  }, [profileQuery.data]);

  const save = useMutation({
    mutationFn: () => updateMyProfile(user!.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update profile'),
  });

  async function onSignOut() {
    await signOut();
    router.replace('/(auth)/sign-in');
  }

  if (profileQuery.isLoading) {
    return (
      <Screen scroll={false}>
        <ScreenHeader title="Profile" showBack={false} />
        <LoadingState />
      </Screen>
    );
  }

  if (profileQuery.isError) {
    return (
      <Screen scroll={false}>
        <ScreenHeader title="Profile" showBack={false} />
        <ErrorState
          message={(profileQuery.error as any)?.message ?? 'Failed to load profile'}
          onRetry={() => profileQuery.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Profile" showBack={false} />

      <View className="items-center py-6">
        <Avatar
          path={profileQuery.data?.avatar_path ?? null}
          name={form.display_name || form.username}
          onUpload={(filePath) => {
            updateMyProfile(user!.id, { avatar_path: filePath }).then(() => {
              queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
            });
          }}
        />
        <Text variant="subheading" className="mt-4">
          {form.display_name || form.username || 'Your profile'}
        </Text>
        <Text variant="caption">{user?.email}</Text>
      </View>

      <Card className="gap-4">
        <Input
          label="Display name"
          placeholder="Jane Doe"
          value={form.display_name ?? ''}
          onChangeText={(t) => setForm((f) => ({ ...f, display_name: t }))}
        />
        <Input
          label="Username"
          placeholder="janedoe"
          value={form.username ?? ''}
          onChangeText={(t) => setForm((f) => ({ ...f, username: t }))}
          autoCapitalize="none"
        />
        <Input
          label="Status"
          placeholder="What are you up to?"
          value={form.status_text ?? ''}
          onChangeText={(t) => setForm((f) => ({ ...f, status_text: t }))}
        />
        <Input
          label="Bio"
          placeholder="A short introduction"
          value={form.bio ?? ''}
          onChangeText={(t) => setForm((f) => ({ ...f, bio: t }))}
          multiline
        />
        <Input
          label="Province"
          placeholder="e.g. Cebu"
          value={form.province ?? ''}
          onChangeText={(t) => setForm((f) => ({ ...f, province: t }))}
        />
        <Button label="Save changes" onPress={() => save.mutate()} loading={save.isPending} />
      </Card>

      <Text variant="label" className="mb-3 mt-8">
        Appearance
      </Text>
      <Card padded={false} className="p-1">
        <View className="flex-row">
          {THEME_OPTIONS.map((opt) => {
            const selected = preference === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setPreference(opt.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                className={`flex-1 items-center rounded-lg py-2.5 ${
                  selected ? 'bg-secondary' : ''
                }`}
              >
                <Text
                  className={selected ? 'font-semibold text-foreground' : 'text-muted-foreground'}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Text variant="label" className="mb-1 mt-8">
        More
      </Text>
      <Card padded={false} className="px-4">
        {LINKS.map((link, i) => (
          <View key={link.href}>
            {i > 0 ? <Divider /> : null}
            <ListRow
              title={link.title}
              subtitle={link.subtitle}
              showChevron
              onPress={() => router.push(link.href as any)}
            />
          </View>
        ))}
      </Card>

      <View className="mt-8 gap-3">
        <Button label="Sign out" variant="outline" onPress={onSignOut} />
        <Button
          label="Delete account"
          variant="ghost"
          className="border border-destructive/40"
          onPress={() =>
            toast.info('Account deletion needs a server-side function')
          }
        />
      </View>
    </Screen>
  );
}
