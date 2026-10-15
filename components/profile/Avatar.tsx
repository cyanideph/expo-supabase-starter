import React, { useState } from 'react';
import { View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { avatarUrl } from '@/lib/api';
import { Avatar as BaseAvatar, Button, Text, useToast } from '@/components/ui';

interface AvatarUploaderProps {
  path: string | null;
  name?: string | null;
  size?: number;
  onUpload: (filePath: string) => void;
  editable?: boolean;
}

export function Avatar({
  path,
  name,
  size = 120,
  onUpload,
  editable = true,
}: AvatarUploaderProps) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);

  async function pickAndUpload() {
    try {
      setUploading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Please allow photo access to upload an avatar');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      });
      if (result.canceled || !result.assets?.length) return;

      const image = result.assets[0];
      const response = await fetch(image.uri);
      const arrayBuffer = await response.arrayBuffer();
      const ext = image.uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
          upsert: false,
        });
      if (error) throw error;

      setLocalUri(image.uri);
      onUpload(filePath);
      toast.success('Photo updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View className="items-center gap-3">
      <BaseAvatar name={name} uri={localUri ?? avatarUrl(path)} size={size} />
      {editable ? (
        <Button
          label={uploading ? 'Uploading…' : path ? 'Change photo' : 'Upload photo'}
          variant="outline"
          size="sm"
          fullWidth={false}
          onPress={pickAndUpload}
          disabled={uploading}
        />
      ) : null}
    </View>
  );
}
