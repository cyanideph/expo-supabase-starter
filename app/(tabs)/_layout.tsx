import { Redirect, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/lib/useAuth';
import { Icon } from '@/components/ui';

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { colorScheme } = useColorScheme();
  const active = colorScheme === 'dark' ? '#f8fafc' : '#111827';
  const inactive = colorScheme === 'dark' ? '#6b7280' : '#9ca3af';

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: { borderTopColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ color, size }) => (
            <Icon name="rooms" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="conversations"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Icon name="comment" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Icon name="feed" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
