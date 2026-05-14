/**
 * Login & Security Screen
 * Manages password updates and security settings.
 */
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, ChevronRight } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';

export default function LoginSecurityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row items-center border-b border-[#F0F0F0]">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#222222" />
        </TouchableOpacity>
        <ThemedText className="text-[18px] font-figtree-bold ml-4">Login & security</ThemedText>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
        <ThemedText className="text-[24px] font-figtree-bold text-[#222222] mb-2">Login</ThemedText>
        <ThemedText className="text-[14px] font-figtree text-[#717171] mb-8">Update your password and secure your account.</ThemedText>

        <SecurityItem 
          label="Password" 
          description="Last updated 2 months ago" 
        />
        <SecurityItem 
          label="Social accounts" 
          description="Not connected" 
        />

        <View className="h-10" />
        
        <ThemedText className="text-[24px] font-figtree-bold text-[#222222] mb-2">Security</ThemedText>
        <SecurityItem 
          label="Two-step verification" 
          description="Add a layer of security to your account" 
        />
        <SecurityItem 
          label="Recognized devices" 
          description="Check where you're logged in" 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SecurityItem({ label, description }: { label: string, description: string }) {
  return (
    <TouchableOpacity className="flex-row justify-between items-center py-5 border-b border-[#F0F0F0]">
      <View className="flex-1">
        <ThemedText className="text-[16px] font-figtree text-[#222222]">{label}</ThemedText>
        <ThemedText className="text-[14px] font-figtree text-[#717171] mt-1">{description}</ThemedText>
      </View>
      <ChevronRight size={20} color="#717171" />
    </TouchableOpacity>
  );
}
