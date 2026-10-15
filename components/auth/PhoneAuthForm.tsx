import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Button, Card, FieldGroup, Input, Text, useToast } from '@/components/ui';

interface PhoneAuthFormProps {
  onSuccess?: () => void;
}

export function PhoneAuthForm({ onSuccess }: PhoneAuthFormProps) {
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  async function handleSendOTP() {
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!phone.startsWith('+')) {
      toast.error('Include the country code, e.g. +1 for US');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
      if (error) throw error;
      setOtpSent(true);
      toast.success('Verification code sent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp,
        type: 'sms',
      });
      if (error) throw error;
      onSuccess?.();
      router.replace('/(tabs)');
    } catch (error: any) {
      toast.error(error.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  if (otpSent) {
    return (
      <FieldGroup>
        <Card className="gap-1 p-4">
          <Text variant="caption" className="text-center">
            Enter the 6-digit code sent to{' '}
            <Text className="font-medium text-foreground">{phone}</Text>
          </Text>
        </Card>
        <Input
          label="Verification code"
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
          className="text-center text-2xl tracking-widest"
        />
        <Button label="Verify code" onPress={handleVerifyOTP} loading={loading} />
        <View className="flex-row items-center justify-center gap-3">
          <Button
            label="Resend code"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={handleSendOTP}
            disabled={loading}
          />
          <Text variant="caption">•</Text>
          <Button
            label="Change number"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={() => setOtpSent(false)}
            disabled={loading}
          />
        </View>
      </FieldGroup>
    );
  }

  return (
    <FieldGroup>
      <Input
        label="Phone number"
        placeholder="+1 (555) 123-4567"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        editable={!loading}
        hint="Include country code (e.g. +1 for US)"
      />
      <Button label="Send code" onPress={handleSendOTP} loading={loading} />
    </FieldGroup>
  );
}
