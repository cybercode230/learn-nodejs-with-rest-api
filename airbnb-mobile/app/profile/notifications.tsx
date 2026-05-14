/**
 * Notifications Settings Screen
 * Manages push and email notification preferences.
 */
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';

export default function NotificationsScreen() {
  const router = useRouter();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row items-center border-b border-[#F0F0F0]">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#222222" />
        </TouchableOpacity>
        <ThemedText className="text-[18px] font-figtree-bold ml-4">Notifications</ThemedText>
      </View>

      <ScrollView className="flex-1 px-6 pt-8">
        <ThemedText className="text-[24px] font-figtree-bold text-[#222222] mb-2">Notification settings</ThemedText>
        <ThemedText className="text-[14px] font-figtree text-[#717171] mb-8">Choose how you want to be notified about your trips and account activity.</ThemedText>

        <NotificationToggle 
          label="Push notifications" 
          description="Receive alerts on your device" 
          value={pushEnabled}
          onValueChange={setPushEnabled}
        />
        <NotificationToggle 
          label="Email notifications" 
          description="Receive detailed updates via email" 
          value={emailEnabled}
          onValueChange={setEmailEnabled}
        />
        <NotificationToggle 
          label="Promotions and offers" 
          description="Get notified about special deals and discounts" 
          value={promoEnabled}
          onValueChange={setPromoEnabled}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationToggle({ label, description, value, onValueChange }: { label: string, description: string, value: boolean, onValueChange: (v: boolean) => void }) {
  return (
    <View className="flex-row justify-between items-center py-5 border-b border-[#F0F0F0]">
      <View className="flex-1 pr-4">
        <ThemedText className="text-[16px] font-figtree text-[#222222]">{label}</ThemedText>
        <ThemedText className="text-[14px] font-figtree text-[#717171] mt-1">{description}</ThemedText>
      </View>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: '#EEEEEE', true: '#222222' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
