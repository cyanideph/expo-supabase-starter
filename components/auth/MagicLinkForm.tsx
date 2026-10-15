import React, { useState } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Button, Card, FieldGroup, Icon, Input, Text, useToast } from '@/components/ui';

interface MagicLinkFormProps {
  onSuccess?: () => void;
}

export function MagicLinkForm({ onSuccess }: MagicLinkFormProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSendMagicLink() {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: Linking.createURL('/') },
      });
      if (error) throw error;
      setSent(true);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="items-center gap-3 p-6">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon name="mail" size={24} color="#111827" />
        </View>
        <Text variant="subheading">Check your email</Text>
        <Text variant="caption" className="text-center">
          We sent a magic link to{' '}
          <Text className="font-medium text-foreground">{email}</Text>
        </Text>
        <Button
          label="Use a different email"
          variant="outline"
          size="sm"
          fullWidth={false}
          className="mt-2"
          onPress={() => setSent(false)}
        />
      </Card>
    );
  }

  return (
    <FieldGroup>
      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!loading}
        hint="We'll email you a magic link for a password-free sign in"
      />
      <Button
        label="Send magic link"
        onPress={handleSendMagicLink}
        loading={loading}
      />
    </FieldGroup>
  );
}
