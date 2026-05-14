/**
 * useProfile Hook
 * Manages user profile state, personal information, and avatar updates.
 */
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, User } from './use-auth';

export function useProfile() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Pick an image from the device library and update the avatar.
   */
  const pickAvatar = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsUploading(true);
        // Simulate API call to upload image
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update local auth state
        if (updateUser) {
          updateUser({ avatar: result.assets[0].uri });
        }
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
    } finally {
      setIsUploading(false);
    }
  }, [updateUser]);

  /**
   * Update personal information
   */
  const updatePersonalInfo = useCallback(async (data: Partial<User>) => {
    if (updateUser) {
      updateUser(data);
    }
  }, [updateUser]);

  return {
    user,
    isUploading,
    pickAvatar,
    updatePersonalInfo,
  };
}
