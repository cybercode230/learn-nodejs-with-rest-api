import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, User } from './use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useProfile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Fetch Profile Data
   */
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/profile');
      return response.data;
    },
    enabled: !!user,
  });

  /**
   * Pick an image and upload to /api/v1/users/{id}/avatar
   */
  const pickAvatar = useCallback(async () => {
    if (!user) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsUploading(true);
        
        const uri = result.assets[0].uri;
        const formData = new FormData();
        
        // Extract filename and type
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        // @ts-ignore
        formData.append('image', {
          uri,
          name: filename,
          type,
        });

        const response = await apiClient.post(`/users/${user.id}/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.user?.avatar) {
          updateUser({ avatar: response.data.user.avatar });
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
    }
  }, [user, updateUser]);

  /**
   * Update personal information (PUT /api/v1/profile)
   */
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put('/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (data.user) {
        updateUser(data.user);
      }
    },
  });

  const updatePersonalInfo = useCallback(async (data: Partial<User>) => {
    await updateMutation.mutateAsync(data);
  }, [updateMutation]);

  return {
    user,
    profile,
    isLoading: isProfileLoading || updateMutation.isPending,
    isUploading,
    pickAvatar,
    updatePersonalInfo,
  };
}
