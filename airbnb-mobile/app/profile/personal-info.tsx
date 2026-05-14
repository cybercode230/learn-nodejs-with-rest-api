/**
 * Personal Information Screen
 * Allows users to edit their name, email, and bio.
 */
import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useProfile } from '@/hooks/use-profile';
import { ms } from 'react-native-size-matters';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { user, updatePersonalInfo } = useProfile();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleSave = () => {
    updatePersonalInfo({ name, email, bio });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center border-b border-[#F0F0F0]">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ChevronLeft size={24} color="#222222" />
          </TouchableOpacity>
          <ThemedText className="text-[18px] font-figtree-bold ml-4">Personal information</ThemedText>
        </View>

        <ScrollView className="flex-1 px-6 pt-8">
          <ThemedText className="text-[24px] font-figtree-bold text-[#222222] mb-8">
            Edit your details
          </ThemedText>

          {/* Name Field */}
          <View className="mb-6">
            <ThemedText className="text-[14px] font-figtree-semibold text-[#717171] mb-2">Legal name</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              className="border border-[#CCCCCC] rounded-lg px-4 py-3 text-[16px] font-figtree text-[#222222]"
              placeholder="Your name"
            />
          </View>

          {/* Email Field */}
          <View className="mb-6">
            <ThemedText className="text-[14px] font-figtree-semibold text-[#717171] mb-2">Email address</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="border border-[#CCCCCC] rounded-lg px-4 py-3 text-[16px] font-figtree text-[#222222]"
              placeholder="Your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Bio Field */}
          <View className="mb-8">
            <ThemedText className="text-[14px] font-figtree-semibold text-[#717171] mb-2">About you</ThemedText>
            <TextInput
              value={bio}
              onChangeText={setBio}
              className="border border-[#CCCCCC] rounded-lg px-4 py-3 text-[16px] font-figtree text-[#222222] min-h-[120px]"
              placeholder="Tell us a little about yourself..."
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer Save Button */}
        <View className="p-6 border-t border-[#F0F0F0] bg-white">
          <TouchableOpacity 
            onPress={handleSave}
            className="bg-[#222222] py-4 rounded-lg items-center"
          >
            <ThemedText className="text-white text-[16px] font-figtree-bold">Save</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
