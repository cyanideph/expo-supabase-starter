import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Button, Card, Icon, Input, Screen, Text, useToast } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResetPassword() {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: Linking.createURL('/'),
      });
      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="pb-8 pt-12">
        <Button
          label="Back"
          variant="ghost"
          size="sm"
          fullWidth={false}
          className="mb-6 -ml-2"
          onPress={() => router.back()}
        />
        <Text variant="title">
          {sent ? 'Check your email' : 'Reset password'}
        </Text>
        <Text muted className="mt-2">
          {sent
            ? 'We sent you a link to reset your password'
            : "Enter your email and we'll send you a reset link"}
        </Text>
      </View>

      {sent ? (
        <Card className="items-center gap-3 p-6">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Icon name="mail" size={24} color="#111827" />
          </View>
          <Text variant="caption" className="text-center">
            Sent to <Text className="font-medium text-foreground">{email}</Text>
          </Text>
          <Button
            label="Back to sign in"
            size="sm"
            fullWidth={false}
            onPress={() => router.replace('/(auth)/sign-in')}
          />
          <Button
            label="Use a different email"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={() => {
              setSent(false);
              setEmail('');
            }}
          />
        </Card>
      ) : (
        <View className="gap-6">
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />
          <Button
            label="Send reset link"
            onPress={handleResetPassword}
            loading={loading}
          />
        </View>
      )}
    </Screen>
  );
}
