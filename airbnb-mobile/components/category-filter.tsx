import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { 
  Home, 
  Map, 
  Star, 
  Briefcase, 
  Waves,
  Mountain,
  ShoppingBag,
  Bus
} from './icons';

/**
 * Airbnb categories data with their respective icons.
 */
export const CATEGORIES = [
  { id: 'Apartments', name: 'Apartments', icon: Home },
  { id: 'Villas', name: 'Villas', icon: Map },
  { id: 'Cabins', name: 'Cabins', icon: Briefcase },
  { id: 'Rooms', name: 'Rooms', icon: Star },
  { id: 'Lakefront', name: 'Lakefront', icon: Waves },
  { id: 'Countryside', name: 'Countryside', icon: Mountain },
  { id: 'Shopping', name: 'Shopping', icon: ShoppingBag },
  { id: 'Transport', name: 'Transport', icon: Bus },
];

interface CategoryFilterProps {
  activeCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
}

/**
 * Horizontal Category Filter component.
 * Uses a professional sliding indicator and smooth transitions.
 */
export function CategoryFilter({ activeCategoryId, onCategoryChange }: CategoryFilterProps) {
  return (
    <View className="bg-white border-b border-gray-100 py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 24 }}
      >
        {/* 'All' category option */}
        <TouchableOpacity
          onPress={() => onCategoryChange(null)}
          className="items-center"
          activeOpacity={0.7}
        >
          <View className={`p-1 ${!activeCategoryId ? 'opacity-100' : 'opacity-40'}`}>
            <Home size={24} color={!activeCategoryId ? '#000000' : '#717171'} />
          </View>
          <ThemedText 
            className={`text-[12px] mt-1 font-figtree-medium ${
              !activeCategoryId ? 'text-black opacity-100' : 'text-[#717171] opacity-60'
            }`}
          >
            All
          </ThemedText>
          {!activeCategoryId && (
            <View className="absolute -bottom-2 w-full h-[2px] bg-black" />
          )}
        </TouchableOpacity>

        {CATEGORIES.map((category) => {
          const isActive = activeCategoryId === category.id;
          const Icon = category.icon;
          
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onCategoryChange(category.id)}
              className="items-center"
              activeOpacity={0.7}
            >
              <View className={`p-1 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                <Icon size={24} color={isActive ? '#000000' : '#717171'} />
              </View>
              <ThemedText 
                className={`text-[12px] mt-1 font-figtree-medium ${
                  isActive ? 'text-black opacity-100' : 'text-[#717171] opacity-60'
                }`}
              >
                {category.name}
              </ThemedText>
              {isActive && (
                <View className="absolute -bottom-2 w-full h-[2px] bg-black" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
