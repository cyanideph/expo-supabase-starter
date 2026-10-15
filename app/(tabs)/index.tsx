import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/useAuth';
import { displayName, getMyProfile } from '@/lib/api';
import {
  Card,
  Icon,
  type IconName,
  ListRow,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';

const QUICK_ACTIONS: {
  label: string;
  icon: IconName;
  href: string;
}[] = [
  { label: 'Rooms', icon: 'rooms', href: '/(tabs)/rooms' },
  { label: 'Messages', icon: 'comment', href: '/(tabs)/conversations' },
  { label: 'Feed', icon: 'feed', href: '/(tabs)/feed' },
  { label: 'Notifications', icon: 'bell', href: '/(screens)/notifications' },
];

const DISCOVER: { title: string; subtitle: string; icon: IconName; href: string }[] = [
  { title: 'Polls', subtitle: 'Vote on community polls', icon: 'trending-up', href: '/(screens)/polls' },
  { title: 'Categories', subtitle: 'Browse content by topic', icon: 'grid', href: '/(screens)/content-categories' },
  { title: 'Featured profiles', subtitle: 'People worth following', icon: 'star', href: '/(screens)/featured-profiles' },
  { title: 'Check-ins', subtitle: 'Track your streak', icon: 'calendar', href: '/(screens)/user-check-ins' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const profile = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: () => getMyProfile(user!.id),
  });

  const name = displayName(profile.data);

  return (
    <Screen>
      <ScreenHeader title={`Hi, ${name.split(' ')[0]}`} showBack={false} subtitle="Welcome back" />

      <Card className="mt-2 gap-1 bg-primary/5">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Icon name="check" size={20} color="#111827" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold">
              {profile.data?.status_text || "You're all set"}
            </Text>
            <Text variant="caption">{user?.email}</Text>
          </View>
        </View>
      </Card>

      <Text variant="label" className="mb-3 mt-8">
        Quick actions
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.href}
            accessibilityRole="button"
            onPress={() => router.push(action.href as any)}
            className="basis-[47%] grow rounded-xl border border-border bg-card p-4 active:opacity-80"
          >
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <Icon name={action.icon} size={20} color="#111827" />
            </View>
            <Text className="font-semibold">{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text variant="label" className="mb-1 mt-8">
        Discover
      </Text>
      <Card padded={false} className="px-4">
        {DISCOVER.map((item, i) => (
          <View key={item.href}>
            {i > 0 ? <View className="h-px bg-border" /> : null}
            <ListRow
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              showChevron
              onPress={() => router.push(item.href as any)}
            />
          </View>
        ))}
      </Card>

      <Text variant="caption" className="mt-8 text-center">
        Built with Expo, Supabase & NativeWind
      </Text>
    </Screen>
  );
}
