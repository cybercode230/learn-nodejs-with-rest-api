/**
 * Inbox Data Provider & Hooks
 * This file contains the InboxContext, mock conversation data, and the useInbox hook
 * for managing messages and notifications state across the app.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  senderId: string;    // 'me' | userId
  text: string;
  timestamp: string;   // ISO string
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string; // ISO string
  unreadCount: number;
  messages: Message[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string; // ISO string
  read: boolean;
  type: 'booking' | 'promo' | 'system' | 'review';
}

interface InboxContextType {
  conversations: Conversation[];
  notifications: AppNotification[];
  /** Total unread across all chats + unread notifications */
  totalUnread: number;
  unreadMessages: number;
  unreadNotifications: number;
  /** Mark all messages in a conversation as read */
  markConversationRead: (conversationId: string) => void;
  /** Mark all notifications as read */
  markAllNotificationsRead: () => void;
  /** Mark one notification as read */
  markNotificationRead: (id: string) => void;
  /** Send a message in a conversation */
  sendMessage: (conversationId: string, text: string) => void;
  /** Get a single conversation by id */
  getConversation: (id: string) => Conversation | undefined;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participantId: 'host_1',
    participantName: 'Jean Paul',
    participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Your reservation is confirmed! See you on August 15th 🎉',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    unreadCount: 2,
    messages: [
      {
        id: 'msg_1',
        senderId: 'host_1',
        text: 'Hello! Thank you for booking my place.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: true,
      },
      {
        id: 'msg_2',
        senderId: 'host_1',
        text: 'Your reservation is confirmed! See you on August 15th 🎉',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
      },
    ],
  },
  {
    id: 'conv_2',
    participantId: 'host_2',
    participantName: 'Amina Uwase',
    participantAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    lastMessage: 'Hi! Feel free to reach out if you need anything.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    unreadCount: 0,
    messages: [
      {
        id: 'msg_3',
        senderId: 'me',
        text: 'Hi Amina, is early check-in possible?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true,
      },
      {
        id: 'msg_4',
        senderId: 'host_2',
        text: 'Hi! Feel free to reach out if you need anything.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: true,
      },
    ],
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: 'Booking confirmed!',
    body: 'Your stay at Luxury Villa with Volcano View is confirmed for Aug 15–20.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    type: 'booking',
  },
  {
    id: 'notif_2',
    title: 'Special offer nearby',
    body: 'Properties in Musanze are 20% off this weekend. Don\'t miss out!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    type: 'promo',
  },
  {
    id: 'notif_3',
    title: 'Leave a review',
    body: 'How was your stay? Share your experience with future guests.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    type: 'review',
  },
];

// ── Context ────────────────────────────────────────────────────────────────────

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Derived counts
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const totalUnread = unreadMessages + unreadNotifications;

  /** Mark all messages in a conversation as read and reset its badge. */
  const markConversationRead = useCallback((conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              unreadCount: 0,
              messages: conv.messages.map(m => ({ ...m, read: true })),
            }
          : conv,
      ),
    );
  }, []);

  /** Mark every notification as read. */
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  /** Mark a single notification as read. */
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  /** Append a new outgoing message to a conversation. */
  const sendMessage = useCallback((conversationId: string, text: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: new Date().toISOString(),
      read: true,
    };
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: text,
              lastMessageTime: newMsg.timestamp,
            }
          : conv,
      ),
    );
  }, []);

  const getConversation = useCallback(
    (id: string) => conversations.find(c => c.id === id),
    [conversations],
  );

  return (
    <InboxContext.Provider
      value={{
        conversations,
        notifications,
        totalUnread,
        unreadMessages,
        unreadNotifications,
        markConversationRead,
        markAllNotificationsRead,
        markNotificationRead,
        sendMessage,
        getConversation,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error('useInbox must be used within an InboxProvider');
  return ctx;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format a timestamp into a human-readable relative string. */
export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
