import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text } from '@/components/ui';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AUTH_PROVIDERS, AuthMethods } from '@/components/auth/AuthMethods';

const socialProviders = AUTH_PROVIDERS.filter(
  (p) => p === 'google' || p === 'apple'
);

export default function SignInScreen() {
  return (
    <Screen>
      <View className="gap-2 pb-8 pt-12">
        <Text variant="title">Welcome back</Text>
        <Text muted>Sign in to continue to your account</Text>
      </View>

      <SocialButtons providers={socialProviders} />
      <AuthDivider />
      <AuthMethods mode="sign-in" />

      <View className="mt-8 flex-row items-center justify-center">
        <Text variant="caption">Don't have an account? </Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/(auth)/sign-up')}
        >
          <Text className="font-semibold text-primary">Sign up</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
