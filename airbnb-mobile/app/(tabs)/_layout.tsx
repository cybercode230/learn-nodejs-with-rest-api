import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { Search, Heart, Briefcase, MessageSquare, User } from '@/components/icons';
import { useInbox } from '@/hooks/use-inbox';

/**
 * Inbox tab icon with a live red badge showing total unread count.
 * Badge disappears automatically when count reaches zero.
 */
function InboxTabIcon({ color }: { color: string }) {
  const { totalUnread } = useInbox();
  return (
    <View style={{ position: 'relative' }}>
      <MessageSquare size={24} color={color} />
      {totalUnread > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -6,
            right: -8,
            backgroundColor: '#FF385C',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
            borderWidth: 1.5,
            borderColor: '#FFFFFF',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 10,
              fontFamily: 'Figtree-Bold',
              lineHeight: 13,
            }}
          >
            {totalUnread > 99 ? '99+' : String(totalUnread)}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Main Tab Layout for the Airbnb Mobile application.
 * Configured with professional styling and native feel.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF385C',
        tabBarInactiveTintColor: '#717171',
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#DDDDDD',
          elevation: 0,
          shadowOpacity: 0,
          height: 65,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontFamily: 'Figtree-Medium',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlists',
          tabBarIcon: ({ color }) => <Heart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => <Briefcase size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <InboxTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
