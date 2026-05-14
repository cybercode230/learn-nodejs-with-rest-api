import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './themed-text';
import { ChevronRight, ArrowRight } from './icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define constant dimensions for the two-row layout
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.55;

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: string;
  gradientColors?: [string, string, ...string[]];
}

const ONBOARDING_DATA: OnboardingItem[] = [
  {
    id: '1',
    title: 'Find your\nnext stay',
    description: 'Explore thousands of beautiful homes and unique stays in Kigali and beyond. Your perfect getaway is just a tap away.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    gradientColors: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.3)'],
  },
  {
    id: '2',
    title: 'Book with\nconfidence',
    description: 'Verified listings, secure payments, and 24/7 support to ensure your trip is perfect from start to finish.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    gradientColors: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.3)'],
  },
  {
    id: '3',
    title: 'Experience\nKigali',
    description: 'Discover hidden gems and local favorites in the heart of Rwanda. Live like a local with our curated experiences.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
    gradientColors: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.3)'],
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [isLastSlide, setIsLastSlide] = useState(false);

  useEffect(() => {
    setIsLastSlide(currentIndex === ONBOARDING_DATA.length - 1);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const renderItem = ({ item, index }: { item: OnboardingItem; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [1, 1.1, 1],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 0, 20],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} className="bg-white">
        {/* Row 1: Image Container */}
        <View 
          style={{ 
            height: IMAGE_HEIGHT, 
            width: SCREEN_WIDTH,
            borderBottomWidth: 1,
            borderBottomColor: '#EEEEEE',
            overflow: 'hidden',
            backgroundColor: '#F7F7F7'
          }}
        >
          <Animated.View style={{ flex: 1, transform: [{ scale }], opacity }}>
            <Image
              source={{ uri: item.image }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              transition={800}
              cachePolicy="memory-disk"
            />
          </Animated.View>

          {/* Subtle Gradient Overlay */}
          <LinearGradient
            colors={item.gradientColors || ['transparent', 'rgba(0,0,0,0.2)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
            }}
          />
        </View>

        {/* Row 2: Text Content */}
        <View style={{ flex: 1, padding: 32, justifyContent: 'center' }}>
          <Animated.View style={{ transform: [{ translateY }] }}>
            <ThemedText
              type="title"
              style={{
                color: '#222222',
                marginBottom: 16,
                fontSize: 32,
                lineHeight: 38,
              }}
            >
              {item.title}
            </ThemedText>

            <ThemedText
              type="body"
              style={{
                color: '#717171',
                lineHeight: 26,
                fontSize: 18,
              }}
            >
              {item.description}
            </ThemedText>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />

      {/* Skip Button */}
      <TouchableOpacity
        onPress={handleSkip}
        activeOpacity={0.7}
        style={{
          position: 'absolute',
          top: 50,
          right: 24,
          zIndex: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <ThemedText
          type="default"
          style={{ color: '#FF385C', fontFamily: 'Figtree-SemiBold', fontSize: 14 }}
        >
          Skip
        </ThemedText>
      </TouchableOpacity>

      {/* Main FlatList */}
      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        bounces={false}
        scrollEventThrottle={16}
      />

      {/* Footer Navigation */}
      <View style={{ 
        position: 'absolute', 
        bottom: 50, 
        left: 0, 
        right: 0, 
        paddingHorizontal: 32, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        {/* Pagination Dots */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {ONBOARDING_DATA.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const scaleX = scrollX.interpolate({
              inputRange,
              outputRange: [1, 3, 1],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FF385C',
                  opacity,
                  transform: [{ scaleX }],
                }}
              />
            );
          })}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#FF385C',
            width: isLastSlide ? 150 : 60,
            height: 60,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#FF385C',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {isLastSlide ? (
              <>
                <ThemedText
                  style={{ color: '#FFFFFF', fontFamily: 'Figtree-SemiBold', fontSize: 16 }}
                >
                  Get Started
                </ThemedText>
                <ArrowRight size={20} color="#FFFFFF" />
              </>
            ) : (
              <ChevronRight size={28} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}