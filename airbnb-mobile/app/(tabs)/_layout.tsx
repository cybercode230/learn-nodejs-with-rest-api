import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { ms, s, vs } from 'react-native-size-matters';
import { Search, Heart, Briefcase, MessageSquare, User, LayoutDashboard } from '@/components/icons';
import { useInbox } from '@/hooks/use-inbox';
import { useAuth } from '@/hooks/use-auth';

/**
 * Inbox tab icon with a live red badge showing total unread count.
 * Badge disappears automatically when count reaches zero.
 */
function InboxTabIcon({ color }: { color: string }) {
  const { totalUnread } = useInbox();
  return (
    <View style={{ position: 'relative' }}>
      <MessageSquare size={ms(24)} color={color} />
      {totalUnread > 0 && (
        <View
          style={{
            position: 'absolute',
            top: ms(-6),
            right: ms(-8),
            backgroundColor: '#FF385C',
            borderRadius: ms(10),
            minWidth: ms(18),
            height: ms(18),
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: ms(4),
            borderWidth: ms(1.5),
            borderColor: '#FFFFFF',
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: ms(10),
              fontFamily: 'Figtree-Bold',
              lineHeight: ms(13),
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
  const { user } = useAuth();
  const isHost = user?.role === 'HOST';

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
          height: vs(60),
          paddingBottom: vs(8),
          paddingTop: vs(8),
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontFamily: 'Figtree-Medium',
          fontSize: ms(10),
          marginTop: vs(-2),
        },
        tabBarIconStyle: {
          marginBottom: vs(-2),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search size={ms(24)} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlists',
          href: isHost ? null : '/wishlist',
          tabBarIcon: ({ color }) => <Heart size={ms(24)} color={color} />,
        }}
      />
      <Tabs.Screen
        name="host"
        options={{
          title: 'Host',
          href: isHost ? '/host' : null,
          tabBarIcon: ({ color }) => <LayoutDashboard size={ms(24)} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color }) => <Briefcase size={ms(24)} color={color} />,
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
          tabBarIcon: ({ color }) => <User size={ms(24)} color={color} />,
        }}
      />
    </Tabs>
  );
}
