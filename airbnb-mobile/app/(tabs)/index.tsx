import React from 'react';
import { View, FlatList, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ListingCard, Listing } from '@/components/listing-card';
import { Search, Settings } from '@/components/icons';

const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    location: 'Kigali City Center, Rwanda',
    name: 'Modern Apartment with View',
    price: 50,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    distance: '2 kilometers away',
    dates: 'May 15 - 20',
  },
  {
    id: '2',
    location: 'Nyarutarama, Kigali',
    name: 'Luxury Villa with Pool',
    price: 120,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    distance: '5 kilometers away',
    dates: 'Jun 1 - 7',
  },
  {
    id: '3',
    location: 'Lake Kivu, Gisenyi',
    name: 'Lakeside Retreat',
    price: 85,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
    distance: '150 kilometers away',
    dates: 'Jul 10 - 15',
  },
  {
    id: '4',
    location: 'Musanze, Rwanda',
    name: 'Mountain View Cabin',
    price: 110,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    distance: '90 kilometers away',
    dates: 'Aug 20 - 25',
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header / Search Bar Mockup */}
      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white rounded-full px-4 py-3 border border-gray-200 shadow-sm">
          <Search size={20} className="text-black" />
          <View className="ml-3 flex-1">
            <ThemedText className="font-figtree-semibold text-[14px]">Where to?</ThemedText>
            <ThemedText className="text-gray-500 text-[12px]">Anywhere • Any week • Add guests</ThemedText>
          </View>
          <View className="p-2 border border-gray-200 rounded-full">
            <Settings size={16} className="text-black" />
          </View>
        </View>
      </View>

      <FlatList
        data={MOCK_LISTINGS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        renderItem={({ item }) => <ListingCard listing={item} />}
        ListHeaderComponent={
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <ThemedText className="font-figtree-bold text-[28px]">Airbnb Kigali</ThemedText>
              <ThemedText className="text-gray-500 font-figtree">Created by cyuzuzojosue</ThemedText>
            </View>
            <Image
              source={require('@/assets/logos/logo.svg')}
              style={{ width: 40, height: 40 }}
              contentFit="contain"
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}
