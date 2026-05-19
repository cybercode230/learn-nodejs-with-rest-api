/**
 * Inbox Data Provider & Hooks with WebSocket Real-time Messaging for Web
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { ENV } from '../config/env';
import { useAuth } from './AuthContext';
import { decrypt } from '../shared/utils/encryption';

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
  type: 'booking' | 'message' | 'payout' | 'review' | 'system' | 'new_message' | 'price_drop' | 'listing_approved' | 'listing_rejected';
  link?: string;
}

interface InboxContextType {
  conversations: Conversation[];
  notifications: AppNotification[];
  totalUnread: number;
  unreadMessages: number;
  unreadNotifications: number;
  markConversationRead: (conversationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string, listingId?: string) => void;
  getConversation: (id: string) => Conversation | undefined;
  refreshInbox: () => Promise<void>;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Derived counts
  const unreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const totalUnread = unreadMessages + unreadNotifications;

  // Refresh Inbox Data (Conversations + Real Backend Notifications)
  const refreshInbox = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      // 1. Fetch Conversations
      const convRes = await api.get(ENDPOINTS.MESSAGES.CONVERSATIONS);
      const apiConversations = convRes.data || [];

      // Fetch history for each conversation to populate initial message details
      const detailedConversations = await Promise.all(
        apiConversations.map(async (conv: any) => {
          try {
            const histRes = await api.get(ENDPOINTS.MESSAGES.HISTORY(conv.participantId));
            return {
              id: conv.id,
              participantId: conv.participantId,
              participantName: conv.participantName,
              participantAvatar: conv.participantAvatar || "https://a0.muscache.com/defaults/user_pic-50x50.png",
              lastMessage: conv.lastMessage,
              lastMessageTime: conv.lastMessageTime,
              unreadCount: conv.unreadCount || 0,
              messages: histRes.data || []
            };
          } catch {
            return {
              id: conv.id,
              participantId: conv.participantId,
              participantName: conv.participantName,
              participantAvatar: conv.participantAvatar || "https://a0.muscache.com/defaults/user_pic-50x50.png",
              lastMessage: conv.lastMessage,
              lastMessageTime: conv.lastMessageTime,
              unreadCount: conv.unreadCount || 0,
              messages: []
            };
          }
        })
      );

      setConversations(detailedConversations);

      // 2. Fetch Notifications from database
      const notifRes = await api.get(ENDPOINTS.NOTIFICATIONS.BASE);
      const dbNotifications = notifRes.data || [];

      // 3. Fetch Bookings and map them to dynamic notifications for extra context
      let mappedNotifs: AppNotification[] = dbNotifications.map((n: any) => {
        let link = '/dashboard';
        if (n.type === 'new_message' || n.type === 'message') {
          link = '/dashboard/messages';
        } else if (n.type === 'booking') {
          link = '/dashboard/bookings';
        }

        return {
          id: n.id,
          title: n.title,
          body: n.body,
          timestamp: n.createdAt,
          read: n.isRead,
          type: n.type,
          link
        };
      });

      // Fetch Bookings list to complement
      try {
        const bookingsRes = await api.get(ENDPOINTS.BOOKINGS.BASE);
        const bookingsList = bookingsRes.data.data || bookingsRes.data || [];
        const extraNotifs: AppNotification[] = bookingsList.map((b: any) => {
          const isHost = user?.role === 'HOST';
          if (isHost) {
            const paymentMethod = b.paymentMethod || 'Credit Card';
            return {
              id: `booking_${b.id}`,
              title: 'New Booking Request 📅',
              body: `${b.guest?.name || 'A guest'} requested to book "${b.listing?.title || 'listing'}" via ${paymentMethod}.`,
              timestamp: b.createdAt,
              read: b.status !== 'pending',
              type: 'booking',
              link: '/dashboard/bookings'
            };
          } else {
            return {
              id: `booking_${b.id}`,
              title: b.status === 'CONFIRMED' ? 'Booking Confirmed! 🎉' : b.status === 'CANCELLED' ? 'Booking Cancelled ❌' : 'Booking Pending ⏳',
              body: `Your booking at "${b.listing?.title || 'listing'}" is ${b.status.toLowerCase()}.`,
              timestamp: b.createdAt,
              read: true,
              type: 'booking',
              link: '/dashboard/bookings'
            };
          }
        });

        // Mix both, avoid duplicates
        const uniqueNotifs = [...mappedNotifs];
        extraNotifs.forEach((en) => {
          if (!uniqueNotifs.some((un) => un.id === en.id)) {
            uniqueNotifs.push(en);
          }
        });

        // Sort descending
        uniqueNotifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(uniqueNotifs);
      } catch {
        setNotifications(mappedNotifs);
      }
    } catch (err) {
      console.error('[InboxProvider] Error refreshing inbox data:', err);
    }
  }, [isAuthenticated, user?.role]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      refreshInbox();
    } else {
      setConversations([]);
      setNotifications([]);
    }
  }, [isAuthenticated, refreshInbox]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!isAuthenticated) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      return;
    }

    let active = true;
    let ws: WebSocket;

    const connectWS = () => {
      try {
        const encryptedToken = localStorage.getItem('token');
        if (!encryptedToken || !active) return;
        const token = decrypt(encryptedToken);
        if (!token) return;

        // Derive ws url dynamically from api client's baseURL
        const wsUrl = ENV.API_URL
          .replace('/api/v1', '')
          .replace('http://', 'ws://')
          .replace('https://', 'wss://');

        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WebSocket] Connection opened. Authenticating...');
          ws.send(JSON.stringify({ type: 'auth', token }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'msg_received') {
              const msg = data.message;
              const senderName = data.senderName || 'Guest';

              setConversations((prev) => {
                const existing = prev.find((c) => c.participantId === msg.senderId);
                const newMsg: Message = {
                  id: msg.id,
                  senderId: msg.senderId,
                  text: msg.content,
                  timestamp: msg.createdAt,
                  read: false
                };

                if (existing) {
                  return prev.map((c) =>
                    c.participantId === msg.senderId
                      ? {
                          ...c,
                          lastMessage: msg.content,
                          lastMessageTime: msg.createdAt,
                          unreadCount: c.unreadCount + 1,
                          messages: [...c.messages, newMsg]
                        }
                      : c
                  );
                } else {
                  return [
                    ...prev,
                    {
                      id: `conv_${msg.senderId}`,
                      participantId: msg.senderId,
                      participantName: senderName,
                      participantAvatar: 'https://a0.muscache.com/defaults/user_pic-50x50.png',
                      lastMessage: msg.content,
                      lastMessageTime: msg.createdAt,
                      unreadCount: 1,
                      messages: [newMsg]
                    }
                  ];
                }
              });
            }
          } catch (err) {
            console.error('[WebSocket] Error parsing message payload:', err);
          }
        };

        ws.onclose = () => {
          console.log('[WebSocket] Connection closed. Reconnecting in 5s...');
          if (active) {
            setTimeout(connectWS, 5000);
          }
        };

        ws.onerror = (err) => {
          console.error('[WebSocket] Socket error:', err);
        };
      } catch (err) {
        console.error('[WebSocket] Setup failed:', err);
      }
    };

    connectWS();

    return () => {
      active = false;
      if (ws) ws.close();
    };
  }, [isAuthenticated]);

  const markConversationRead = useCallback(async (conversationId: string) => {
    const participantId = conversationId.startsWith('conv_')
      ? conversationId.replace('conv_', '')
      : conversationId;

    // Optimistically update
    setConversations((prev) =>
      prev.map((c) =>
        c.participantId === participantId
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map((m) => ({ ...m, read: true }))
            }
          : c
      )
    );
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await api.put(ENDPOINTS.NOTIFICATIONS.READ_ALL);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    if (id.startsWith('booking_')) {
      // Local only
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      return;
    }
    try {
      await api.put(ENDPOINTS.NOTIFICATIONS.READ(id));
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string, listingId?: string) => {
    const participantId = conversationId.startsWith('conv_')
      ? conversationId.replace('conv_', '')
      : conversationId;

    const payload = {
      type: 'message',
      receiverId: participantId,
      content: text,
      listingId: listingId || null
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn('[WebSocket] Sending message failed: socket offline.');
    }

    // Optimistically append message
    const tempMsg: Message = {
      id: `temp_${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: new Date().toISOString(),
      read: true
    };

    setConversations((prev) => {
      const existing = prev.find((c) => c.participantId === participantId);
      if (existing) {
        return prev.map((c) =>
          c.participantId === participantId
            ? {
                ...c,
                lastMessage: text,
                lastMessageTime: tempMsg.timestamp,
                messages: [...c.messages, tempMsg]
              }
            : c
        );
      } else {
        return [
          ...prev,
          {
            id: `conv_${participantId}`,
            participantId: participantId,
            participantName: 'Guest',
            participantAvatar: 'https://a0.muscache.com/defaults/user_pic-50x50.png',
            lastMessage: text,
            lastMessageTime: tempMsg.timestamp,
            unreadCount: 0,
            messages: [tempMsg]
          }
        ];
      }
    });
  }, []);

  const getConversation = useCallback(
    (id: string) => {
      const participantId = id.startsWith('conv_') ? id.replace('conv_', '') : id;
      return conversations.find((c) => c.participantId === participantId);
    },
    [conversations]
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
        refreshInbox
      }}
    >
      {children}
    </InboxContext.Provider>
  );
};

export const useInbox = () => {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error('useInbox must be used within an InboxProvider');
  return ctx;
};
