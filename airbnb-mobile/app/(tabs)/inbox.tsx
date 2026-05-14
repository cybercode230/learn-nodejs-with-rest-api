/**
 * Inbox Screen Layout
 * This file handles the main Inbox view, featuring a dual-tab system (Messages & Notifications)
 * with horizontal swipe gestures and real-time unread count badges.
 */
import React, { useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ms } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Bell, MessageSquare } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useInbox, formatRelativeTime } from '@/hooks/use-inbox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'messages' | 'notifications';

/**
 * InboxScreen — messages & notifications hub.
 * Two inner tabs: Messages | Notifications.
 * Supports swiping between tabs.
 */
export default function InboxScreen() {
  const router = useRouter();
  const {
    conversations,
    notifications,
    unreadMessages,
    unreadNotifications,
    markNotificationRead,
    markConversationRead,
  } = useInbox();

  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const scrollRef = useRef<ScrollView>(null);

  const handleConversationPress = (id: string) => {
    markConversationRead(id);
    router.push(`/inbox/${id}` as any);
  };

  const handleNotifPress = (id: string) => {
    markNotificationRead(id);
  };

  /** Scroll to a specific tab index */
  const scrollToTab = (tab: Tab) => {
    setActiveTab(tab);
    const index = tab === 'messages' ? 0 : 1;
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  /** Handle manual swipe / scroll end */
  const onScrollEnd = (e: any) => {
    const xOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SCREEN_WIDTH);
    setActiveTab(index === 0 ? 'messages' : 'notifications');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <View className="px-6 pt-8 pb-2">
        <ThemedText type='title' className="leading-tight">
          Inbox
        </ThemedText>

        {/* Tab switcher - Badge on top-right of text */}
        <View className="flex-row mt-6 border-b border-[#F0F0F0] gap-10">
          {/* Messages Tab */}
          <TouchableOpacity
            className="pb-3 relative items-center"
            onPress={() => scrollToTab('messages')}
          >
            <View className="relative">
              <ThemedText className={`text-[16px] ${activeTab === 'messages' ? 'font-figtree-bold text-[#222222]' : 'font-figtree-semibold text-[#717171]'}`}>
                Messages
              </ThemedText>
              {unreadMessages > 0 && (
                <View 
                  className="absolute bg-[#FF385C] rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
                  style={{ top: -6, right: -12 }}
                >
                  <ThemedText className="text-white text-[9px] font-figtree-bold text-center">
                    {unreadMessages}
                  </ThemedText>
                </View>
              )}
            </View>
            {activeTab === 'messages' && (
              <View className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#222222] rounded-t-full" />
            )}
          </TouchableOpacity>

          {/* Notifications Tab */}
          <TouchableOpacity
            className="pb-3 relative items-center"
            onPress={() => scrollToTab('notifications')}
          >
            <View className="relative">
              <ThemedText className={`text-[16px] ${activeTab === 'notifications' ? 'font-figtree-bold text-[#222222]' : 'font-figtree-semibold text-[#717171]'}`}>
                Notifications
              </ThemedText>
              {unreadNotifications > 0 && (
                <View 
                  className="absolute bg-[#FF385C] rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
                  style={{ top: -8, right: -12 }}
                >
                  <ThemedText className="text-white text-[9px] font-figtree-bold text-center">
                    {unreadNotifications}
                  </ThemedText>
                </View>
              )}
            </View>
            {activeTab === 'notifications' && (
              <View className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#222222] rounded-t-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── CONTENT (SWIPEABLE) ────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        className="flex-1"
      >
        {/* TAB 1: MESSAGES */}
        <View style={{ width: SCREEN_WIDTH }} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {conversations.length === 0 ? (
              <View className="flex-1 items-center justify-center px-10 pt-24">
                <View className="w-20 h-20 rounded-full bg-[#F7F7F7] items-center justify-center mb-4">
                  <MessageSquare size={ms(36)} color="#CCCCCC" />
                </View>
                <ThemedText className="text-[18px] font-figtree-bold text-[#222222] text-center">
                  No messages yet
                </ThemedText>
                <ThemedText className="text-[14px] font-figtree text-[#717171] text-center mt-2 leading-5">
                  Once you book a stay or a host contacts you, your conversations will appear here.
                </ThemedText>
              </View>
            ) : (
              <View className="pt-2">
                {conversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    className="flex-row items-center px-6 py-4 border-b border-[#F5F5F5]"
                    onPress={() => handleConversationPress(conv.id)}
                    activeOpacity={0.7}
                  >
                    {/* Avatar Container */}
                    <View 
                      className="relative mr-4" 
                      style={{ width: ms(56), height: ms(56) }}
                    >
                      <Image
                        source={{ 
                          uri: conv.participantAvatar || 'https://a0.muscache.com/defaults/user_pic-50x50.png' 
                        }}
                        style={{ width: '100%', height: '100%', borderRadius: 28 }}
                        className="bg-[#F0F0F0]"
                        contentFit="cover"
                        transition={200}
                      />
                      {/* Online Status Indicator */}
                      <View 
                        className="absolute bottom-0.5 right-0.5 rounded-full bg-[#4CAF50] border-2 border-white" 
                        style={{ width: ms(14), height: ms(14) }}
                      />
                    </View>

                    {/* Content Area */}
                    <View className="flex-1 min-w-0 pr-2">
                      <ThemedText className={`text-[16px] ${conv.unreadCount > 0 ? 'font-figtree-bold text-[#222222]' : 'font-figtree-semibold text-[#444444]'}`}>
                        {conv.participantName}
                      </ThemedText>
                      <ThemedText
                        className={`text-[14px] mt-0.5 ${conv.unreadCount > 0 ? 'font-figtree-semibold text-[#222222]' : 'font-figtree text-[#717171]'}`}
                        numberOfLines={1}
                      >
                        {conv.lastMessage}
                      </ThemedText>
                    </View>

                    {/* Right Side: Timer & Unread Badge */}
                    <View className="items-end">
                      <ThemedText className="text-[12px] font-figtree text-[#AAAAAA] mb-2">
                        {formatRelativeTime(conv.lastMessageTime)}
                      </ThemedText>
                      {conv.unreadCount > 0 && (
                        <View className="bg-[#FF385C] rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                          <ThemedText className="text-white text-[10px] font-figtree-bold">
                            {conv.unreadCount}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View className="h-24" />
          </ScrollView>
        </View>

        {/* TAB 2: NOTIFICATIONS */}
        <View style={{ width: SCREEN_WIDTH }} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {notifications.length === 0 ? (
              <View className="flex-1 items-center justify-center px-10 pt-24">
                <View className="w-20 h-20 rounded-full bg-[#F7F7F7] items-center justify-center mb-4">
                  <Bell size={ms(36)} color="#CCCCCC" />
                </View>
                <ThemedText className="text-[18px] font-figtree-bold text-[#222222] text-center">
                  No notifications
                </ThemedText>
                <ThemedText className="text-[14px] font-figtree text-[#717171] text-center mt-2 leading-5">
                  We'll notify you about bookings, special offers, and more.
                </ThemedText>
              </View>
            ) : (
              <View className="pt-2">
                {notifications.map((notif) => (
                  <TouchableOpacity
                    key={notif.id}
                    className={`flex-row items-start px-6 py-4 border-b border-[#F5F5F5] ${!notif.read ? 'bg-[#FFF8F8]' : 'bg-white'}`}
                    onPress={() => handleNotifPress(notif.id)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-1">
                      <ThemedText className={`text-[15px] ${!notif.read ? 'font-figtree-bold text-[#222222]' : 'font-figtree-semibold text-[#444444]'}`}>
                        {notif.title}
                      </ThemedText>
                      <ThemedText className="text-[14px] font-figtree text-[#717171] mt-1 leading-5">
                        {notif.body}
                      </ThemedText>
                      <ThemedText className="text-[12px] font-figtree text-[#AAAAAA] mt-1">
                        {formatRelativeTime(notif.timestamp)}
                      </ThemedText>
                    </View>
                    {!notif.read && (
                      <View className="w-2 h-2 rounded-full bg-[#FF385C] ml-3 mt-1.5" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View className="h-24" />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
