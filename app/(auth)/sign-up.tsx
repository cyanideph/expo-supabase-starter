import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, Text } from '@/components/ui';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AUTH_PROVIDERS, AuthMethods } from '@/components/auth/AuthMethods';

const socialProviders = AUTH_PROVIDERS.filter(
  (p) => p === 'google' || p === 'apple'
);

export default function SignUpScreen() {
  return (
    <Screen>
      <View className="gap-2 pb-8 pt-12">
        <Text variant="title">Create account</Text>
        <Text muted>Get started with your free account</Text>
      </View>

      <SocialButtons providers={socialProviders} />
      <AuthDivider />
      <AuthMethods mode="sign-up" />

      <Text variant="caption" className="mt-6 px-4 text-center">
        By continuing, you agree to our{' '}
        <Text className="text-primary">Terms of Service</Text> and{' '}
        <Text className="text-primary">Privacy Policy</Text>.
      </Text>

      <View className="mt-8 flex-row items-center justify-center">
        <Text variant="caption">Already have an account? </Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text className="font-semibold text-primary">Sign in</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
