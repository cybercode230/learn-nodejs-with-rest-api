import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Star, Heart } from '@/components/icons';
import { ThemedText } from './themed-text';

export interface Listing {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  distance: string;
  dates: string;
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <TouchableOpacity className="mb-6">
      <View className="relative">
        <Image
          source={{ uri: listing.image }}
          style={{ width: '100%', aspectRatio: 1, borderRadius: 12 }}
          contentFit="cover"
        />
        <TouchableOpacity className="absolute top-3 right-3">
          <Heart className="text-white" size={24} fill="rgba(0,0,0,0.3)" />
        </TouchableOpacity>
      </View>
      
      <View className="mt-3">
        <View className="flex-row justify-between items-center">
          <ThemedText className="font-figtree-semibold text-[16px] flex-1 mr-2" numberOfLines={1}>
            {listing.location}
          </ThemedText>
          <View className="flex-row items-center gap-1">
            <Star className="text-black" size={14} fill="black" />
            <ThemedText className="font-figtree text-[14px]">
              {listing.rating.toFixed(1)}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText className="text-gray-500 font-figtree text-[14px]">
          {listing.distance}
        </ThemedText>
        <ThemedText className="text-gray-500 font-figtree text-[14px]">
          {listing.dates}
        </ThemedText>
        
        <View className="flex-row items-center mt-1">
          <ThemedText className="font-figtree-bold text-[16px]">
            ${listing.price}
          </ThemedText>
          <ThemedText className="font-figtree text-[16px]"> night</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}
