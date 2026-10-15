import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button, FieldGroup, Input, Text, useToast } from '@/components/ui';

interface EmailPasswordFormProps {
  mode: 'sign-in' | 'sign-up';
  onSuccess?: () => void;
}

export function EmailPasswordForm({ mode, onSuccess }: EmailPasswordFormProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (mode === 'sign-up' && password.length < 8)
      next.password = 'Use at least 8 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'sign-up') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (data.user && !data.session) {
          toast.success('Check your email to confirm your account');
          router.replace('/(auth)/sign-in');
        } else {
          onSuccess?.();
          router.replace('/(tabs)');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        onSuccess?.();
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <FieldGroup>
      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        error={errors.email}
        editable={!loading}
      />
      <Input
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
        }}
        secureTextEntry
        autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
        error={errors.password}
        hint={
          mode === 'sign-up' ? 'Must be at least 8 characters' : undefined
        }
        editable={!loading}
      />

      {mode === 'sign-in' ? (
        <Button
          label="Forgot password?"
          variant="ghost"
          size="sm"
          fullWidth={false}
          className="self-end"
          onPress={() => router.push('/(auth)/forgot-password')}
          disabled={loading}
        />
      ) : null}

      <Button
        label={mode === 'sign-up' ? 'Create account' : 'Sign in'}
        onPress={handleSubmit}
        loading={loading}
      />
    </FieldGroup>
  );
}
