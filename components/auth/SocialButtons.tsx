import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import * as Linking from 'expo-linking';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Text, useToast } from '@/components/ui';

interface SocialButtonsProps {
  providers: Array<'google' | 'apple'>;
  onSuccess?: () => void;
}

function GoogleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

const redirectTo = Linking.createURL('/');

export function SocialButtons({ providers, onSuccess }: SocialButtonsProps) {
  const toast = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading('google');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(null);
    }
  }

  async function handleAppleSignIn() {
    setLoading('apple');
    try {
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
        nonce,
      });
      if (error) throw error;
      onSuccess?.();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') return;
      toast.error(error.message || 'Failed to sign in with Apple');
    } finally {
      setLoading(null);
    }
  }

  return (
    <View className="gap-3">
      {providers.includes('google') ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          onPress={handleGoogleSignIn}
          disabled={!!loading}
          className="min-h-11 flex-row items-center justify-center gap-3 rounded-lg border border-border px-4 py-3 active:opacity-80"
        >
          <GoogleLogo />
          <Text className="font-medium">
            {loading === 'google' ? 'Signing in…' : 'Continue with Google'}
          </Text>
        </Pressable>
      ) : null}

      {providers.includes('apple') && Platform.OS === 'ios' ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={{ width: '100%', height: 48 }}
          onPress={handleAppleSignIn}
        />
      ) : null}

      {providers.includes('apple') && Platform.OS !== 'ios' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
          onPress={handleAppleSignIn}
          disabled={!!loading}
          className="min-h-11 flex-row items-center justify-center rounded-lg bg-black px-4 py-3 active:opacity-80"
        >
          <Text className="font-medium" style={{ color: '#ffffff' }}>
            {loading === 'apple' ? 'Signing in…' : 'Continue with Apple'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
