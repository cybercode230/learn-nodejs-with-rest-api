import React, { useRef, useState } from 'react';
import { View, FlatList, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './themed-text';
import { ChevronRight } from './icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Find your next stay',
    description: 'Explore thousands of beautiful homes and unique stays in Kigali and beyond.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Book with confidence',
    description: 'Verified listings and 24/7 support to ensure your trip is perfect from start to finish.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Experience Kigali',
    description: 'Discover the hidden gems and local favorites in the heart of Rwanda.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  },
];

export default function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-end px-6 py-4">
        <TouchableOpacity onPress={handleSkip}>
          <ThemedText className="font-figtree-semibold text-gray-500">Skip</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH }} className="items-center px-8">
            <Image
              source={{ uri: item.image }}
              style={{ width: '100%', height: 400, borderRadius: 24 }}
              contentFit="cover"
            />
            <View className="mt-10 items-center">
              <ThemedText className="font-figtree-bold text-[32px] text-center mb-4">
                {item.title}
              </ThemedText>
              <ThemedText className="font-figtree text-[16px] text-gray-500 text-center leading-6">
                {item.description}
              </ThemedText>
            </View>
          </View>
        )}
      />

      <View className="px-8 pb-10 flex-row items-center justify-between">
        {/* Pagination Dots */}
        <View className="flex-row gap-2">
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === currentIndex ? 'bg-red-500 w-6' : 'bg-gray-200 w-2'
              }`}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="bg-red-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
          {currentIndex === ONBOARDING_DATA.length - 1 ? (
             <ThemedText className="text-white font-figtree-bold text-[14px]">GO</ThemedText>
          ) : (
            <ChevronRight className="text-white" size={24} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
