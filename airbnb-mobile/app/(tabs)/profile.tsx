/**
 * Profile Screen
 * Main account settings and user profile overview.
 * Uses NativeWind for styling and modular hooks for state management.
 */
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { usePreferences } from '@/hooks/use-preferences';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { 
  User, Settings, LogOut, ChevronRight, Bell, ShieldCheck, 
  Info, Globe, Moon, HelpCircle, X 
} from '@/components/icons';
import { Image } from 'expo-image';
import { ms } from 'react-native-size-matters';
import { ThemeModal, LanguageModal } from '@/components/preferences-modals';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const { pickAvatar, isUploading } = useProfile();
  const { theme, setTheme, language, setLanguage, languageName } = usePreferences();
  const router = useRouter();

  // Modals state
  const [helpVisible, setHelpVisible] = useState(false);
  const [howVisible, setHowVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [langVisible, setLangVisible] = useState(false);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 }}>
          <ThemedText className="text-[32px] font-figtree-bold text-[#222222] mb-3">Your Profile</ThemedText>
          <ThemedText className="text-[16px] font-figtree text-[#717171] mb-8">Log in to start planning your next trip.</ThemedText>
          
          <TouchableOpacity 
            className="bg-[#FF385C] rounded-lg py-4 items-center mb-5"
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText className="text-white text-[16px] font-figtree-bold">Log in</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            className="items-center mb-10"
            onPress={() => router.push('/auth/signup')}
          >
            <ThemedText className="text-[14px] font-figtree text-[#717171]">
              Don't have an account? <ThemedText className="font-figtree-bold text-[#222222] underline">Sign up</ThemedText>
            </ThemedText>
          </TouchableOpacity>

          <View className="h-[1px] bg-[#EEEEEE] mb-6" />
          
          <MenuItem icon={<Settings size={ms(22)} color="#222222" />} label="Settings" />
          <MenuItem icon={<Info size={ms(22)} color="#222222" />} label="Help Center" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 }}>
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-1 pr-4">
            <ThemedText className="text-[28px] font-figtree-bold text-[#222222]">{user?.name}</ThemedText>
            <ThemedText className="text-[14px] font-figtree text-[#717171] mt-1">{user?.email}</ThemedText>
            <TouchableOpacity onPress={() => router.push('/profile/personal-info')}>
               <ThemedText className="text-[14px] font-figtree-semibold text-[#222222] mt-2 underline">Show profile</ThemedText>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={pickAvatar} className="relative">
            <Image 
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop' }} 
              style={{ width: ms(64), height: ms(64), borderRadius: ms(32) }}
              className={`bg-[#F0F0F0] ${isUploading ? 'opacity-50' : ''}`}
              contentFit="cover"
            />
            <View className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
              <Settings size={ms(12)} color="#222222" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Earning Card */}
        <TouchableOpacity className="p-6 bg-white rounded-xl shadow-md border border-[#F0F0F0] mb-8">
           <ThemedText className="text-[18px] font-figtree-bold text-[#222222]">Airbnb your home</ThemedText>
           <ThemedText className="text-[14px] font-figtree text-[#717171] mt-1">It's easy to get setup and start earning.</ThemedText>
        </TouchableOpacity>

        {/* Settings Section */}
        <View className="mb-8">
          <ThemedText className="text-[22px] font-figtree-bold text-[#222222] mb-4">Settings</ThemedText>
          <MenuItem 
            icon={<User size={ms(22)} color="#222222" />} 
            label="Personal information" 
            onPress={() => router.push('/profile/personal-info')}
          />
          <MenuItem 
            icon={<ShieldCheck size={ms(22)} color="#222222" />} 
            label="Login & security" 
            onPress={() => router.push('/profile/login-security')}
          />
          <MenuItem 
            icon={<Bell size={ms(22)} color="#222222" />} 
            label="Notifications" 
            onPress={() => router.push('/profile/notifications')}
          />
        </View>

        {/* Preferences Section */}
        <View className="mb-8">
          <ThemedText className="text-[22px] font-figtree-bold text-[#222222] mb-4">Preferences</ThemedText>
          <MenuItem 
            icon={<Moon size={ms(22)} color="#222222" />} 
            label="Appearance" 
            value={theme.charAt(0).toUpperCase() + theme.slice(1)}
            onPress={() => setThemeVisible(true)}
          />
          <MenuItem 
            icon={<Globe size={ms(22)} color="#222222" />} 
            label="Language" 
            value={languageName}
            onPress={() => setLangVisible(true)}
          />
        </View>

        {/* Support Section */}
        <View className="mb-8">
          <ThemedText className="text-[22px] font-figtree-bold text-[#222222] mb-4">Support</ThemedText>
          <MenuItem icon={<HelpCircle size={ms(22)} color="#222222" />} label="Get help" onPress={() => setHelpVisible(true)} />
          <MenuItem icon={<Info size={ms(22)} color="#222222" />} label="How Airbnb works" onPress={() => setHowVisible(true)} />
        </View>

        {/* Logout */}
        <TouchableOpacity 
          className="flex-row items-center gap-3 mt-5 py-3"
          onPress={logout}
        >
          <LogOut size={ms(22)} color="#FF385C" />
          <ThemedText className="text-[16px] font-figtree-semibold text-[#FF385C]">Log out</ThemedText>
        </TouchableOpacity>
        
        <ThemedText className="text-[12px] font-figtree text-[#717171] text-center mt-10">Version 1.2.4</ThemedText>
      </ScrollView>

      {/* ── HELP MODAL ────────────────────────────────────── */}
      <InfoModal 
        visible={helpVisible} 
        onClose={() => setHelpVisible(false)} 
        title="Get Help"
        content="Visit our Help Center to find answers to your questions about bookings, cancellations, and more. Our 24/7 support team is here to ensure your experience is smooth and enjoyable.\n\n• Help with a reservation\n• Cancellation options\n• Refund status\n• Safety concerns"
      />

      {/* ── HOW IT WORKS MODAL ────────────────────────────── */}
      <InfoModal 
        visible={howVisible} 
        onClose={() => setHowVisible(false)} 
        title="How Airbnb works"
        content="Airbnb connects people with unique places to stay and things to do. We build community through shared experiences, ensuring safety and trust in every interaction.\n\n1. Find a place: Search for unique stays.\n2. Book: Send a request or use Instant Book.\n3. Travel: Enjoy your stay and share your feedback."
      />

      {/* ── THEME MODAL ───────────────────────────────────── */}
      <ThemeModal 
        visible={themeVisible} 
        onClose={() => setThemeVisible(false)} 
        theme={theme}
        setTheme={(t) => { setTheme(t); setThemeVisible(false); }}
        title="Appearance"
      />

      {/* ── LANGUAGE MODAL ────────────────────────────────── */}
      <LanguageModal 
        visible={langVisible} 
        onClose={() => setLangVisible(false)} 
        currentLanguage={language}
        onSelect={setLanguage}
        title="Select Language"
      />
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress, value }: { icon: React.ReactNode, label: string, onPress?: () => void, value?: string }) {
  return (
    <TouchableOpacity 
      className="flex-row justify-between items-center py-4 border-b border-[#F0F0F0]"
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center gap-4">
        {icon}
        <View>
          <ThemedText className="text-[16px] font-figtree text-[#222222]">{label}</ThemedText>
          {value && <ThemedText className="text-[13px] font-figtree text-[#717171]">{value}</ThemedText>}
        </View>
      </View>
      <ChevronRight size={ms(20)} color="#717171" />
    </TouchableOpacity>
  );
}

function InfoModal({ visible, onClose, title, content }: { visible: boolean, onClose: () => void, title: string, content: string }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-[80%]">
          <View className="p-6 flex-row items-center justify-between border-b border-[#F0F0F0]">
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={ms(24)} color="#222222" />
            </TouchableOpacity>
            <ThemedText className="text-[18px] font-figtree-bold">{title}</ThemedText>
            <View className="w-8" />
          </View>
          <ScrollView className="p-6">
            <ThemedText className="text-[16px] font-figtree text-[#444444] leading-6">
              {content}
            </ThemedText>
            <TouchableOpacity 
              className="mt-10 bg-[#222222] py-4 rounded-lg items-center"
              onPress={onClose}
            >
              <ThemedText className="text-white font-figtree-bold">Got it</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
