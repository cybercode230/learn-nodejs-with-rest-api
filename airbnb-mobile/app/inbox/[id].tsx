/**
 * Chat Screen Implementation
 * This file manages the individual conversation view, including message threading,
 * profile headers, and keyboard-aware message input.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ms } from 'react-native-size-matters';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useInbox, formatRelativeTime } from '@/hooks/use-inbox';
import { useAuth } from '@/hooks/use-auth';

/**
 * ChatScreen — individual conversation view.
 * Opened from InboxScreen via /inbox/[id].
 *
 * Features:
 * - Message bubbles (me = right/dark, them = left/light)
 * - Text input with Send button (disabled while empty)
 * - Marks conversation as read on mount
 * - Empty state when no messages yet
 * - Auto-scrolls to bottom on new messages
 */
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { getConversation, sendMessage, markConversationRead } = useInbox();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const conversation = getConversation(id);

  // Mark as read when entering the chat
  useEffect(() => {
    if (id) markConversationRead(id);
  }, [id]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [conversation?.messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !id) return;
    sendMessage(id, trimmed);
    setText('');
  };

  if (!conversation) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ThemedText className="text-[16px] font-figtree text-[#717171]">
          Conversation not found.
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── HEADER ───────────────────────────────────────── */}
        <View className="flex-row items-center px-4 py-3 border-b border-[#F0F0F0] bg-white">
          <TouchableOpacity
            className="mr-3 p-1"
            onPress={() => router.back()}
          >
            <ChevronLeft size={ms(24)} color="#222222" />
          </TouchableOpacity>

          <Image
            source={{ 
              uri: conversation.participantAvatar || 'https://a0.muscache.com/defaults/user_pic-50x50.png' 
            }}
            style={{ width: ms(44), height: ms(44), borderRadius: ms(22) }}
            className="bg-[#F0F0F0] mr-3"
            contentFit="cover"
            transition={200}
          />

          <View className="flex-1">
            <ThemedText className="text-[17px] font-figtree-bold text-[#222222]">
              {conversation.participantName}
            </ThemedText>
            <View className="flex-row items-center gap-1.5">
              <View className="w-2 h-2 rounded-full bg-[#4CAF50]" />
              <ThemedText className="text-[12px] font-figtree text-[#717171]">Active now</ThemedText>
            </View>
          </View>
        </View>

        {/* ── MESSAGES ─────────────────────────────────────── */}
        {conversation.messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-10">
            <ThemedText className="text-[40px] mb-4">💬</ThemedText>
            <ThemedText className="text-[18px] font-figtree-bold text-[#222222] text-center">
              Start the conversation
            </ThemedText>
            <ThemedText className="text-[14px] font-figtree text-[#717171] text-center mt-2 leading-5">
              Say hi to {conversation.participantName} — they're usually quick to respond.
            </ThemedText>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: ms(16), gap: ms(10) }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {conversation.messages.map((msg, index) => {
              const isMe = msg.senderId === 'me';
              const prevMsg = conversation.messages[index - 1];
              const showTimestamp =
                !prevMsg ||
                new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() > 5 * 60 * 1000;

              return (
                <View key={msg.id}>
                  {/* Timestamp divider */}
                  {showTimestamp && (
                    <View className="items-center my-2">
                      <ThemedText className="text-[11px] font-figtree text-[#AAAAAA]">
                        {formatRelativeTime(msg.timestamp)}
                      </ThemedText>
                    </View>
                  )}

                  {/* Bubble */}
                  <View className={`flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <Image
                        source={{ 
                          uri: conversation.participantAvatar || 'https://a0.muscache.com/defaults/user_pic-50x50.png' 
                        }}
                        style={{ width: ms(32), height: ms(32), borderRadius: ms(16) }}
                        className="mr-2 mt-1 bg-[#F0F0F0]"
                        contentFit="cover"
                        transition={200}
                      />
                    )}
                    <View
                      className={`max-w-[78%] px-4 py-3 rounded-2xl ${
                        isMe
                          ? 'bg-[#222222] rounded-br-sm'
                          : 'bg-[#F5F5F5] rounded-bl-sm'
                      }`}
                    >
                      <ThemedText
                        className={`text-[14px] font-figtree leading-5 ${
                          isMe ? 'text-white' : 'text-[#222222]'
                        }`}
                      >
                        {msg.text}
                      </ThemedText>
                    </View>
                    {isMe && (
                      <Image
                        source={{ 
                          uri: user?.avatar || 'https://a0.muscache.com/defaults/user_pic-50x50.png' 
                        }}
                        style={{ width: ms(32), height: ms(32), borderRadius: ms(16) }}
                        className="ml-2 mt-1 bg-[#F0F0F0]"
                        contentFit="cover"
                        transition={200}
                      />
                    )}
                  </View>
                </View>
              );
            })}
            <View className="h-2" />
          </ScrollView>
        )}

        {/* ── INPUT BAR ────────────────────────────────────── */}
        <View className="flex-row items-end px-4 py-3 border-t border-[#F0F0F0] bg-white gap-3">
          <View className="flex-1 bg-[#F5F5F5] rounded-2xl px-4 py-3 min-h-[44px] max-h-24">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message..."
              placeholderTextColor="#AAAAAA"
              multiline
              style={{
                fontFamily: 'Figtree-Regular',
                fontSize: ms(14),
                color: '#222222',
                padding: 0,
                margin: 0,
              }}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>

          <TouchableOpacity
            className={`w-11 h-11 rounded-full items-center justify-center ${
              text.trim().length > 0 ? 'bg-[#FF385C]' : 'bg-[#EEEEEE]'
            }`}
            onPress={handleSend}
            disabled={text.trim().length === 0}
          >
            <Send size={ms(18)} color={text.trim().length > 0 ? '#FFFFFF' : '#AAAAAA'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
