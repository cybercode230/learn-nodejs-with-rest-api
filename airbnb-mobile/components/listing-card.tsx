import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Star, Heart } from '@/components/icons';
import { ThemedText } from './themed-text';
import { useRouter } from 'expo-router';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { WishlistModal } from './wishlist-modal';
import { ms } from 'react-native-size-matters';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export interface Listing {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  rating: number;
  images: string[];
  distance: string;
  dates: string;
}

/**
 * Reusable Listing Card Component.
 */
export function ListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { isSaved, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const saved = isSaved(listing.id);

  const handlePress = () => {
    router.push({
      pathname: '/listing/[id]',
      params: { id: listing.id }
    });
  };

  const handleHeartPress = (e: any) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (saved) {
      removeFromWishlist(listing.id);
    } else {
      setModalVisible(true);
    }
  };

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveIndex(Math.round(index));
  };

  return (
    <>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handlePress}
        style={styles.container}
      >
        <View style={styles.imageContainer}>
          <FlatList
            data={listing.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            keyExtractor={(item, index) => `${listing.id}-img-${index}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            )}
          />
          
          {/* Pagination Indicators */}
          <View style={styles.pagination}>
            {listing.images.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { opacity: i === activeIndex ? 1 : 0.6, scaleX: i === activeIndex ? 1.2 : 1 }
                ]} 
              />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.heartButton}
            activeOpacity={0.7}
            onPress={handleHeartPress}
          >
            <Heart 
              size={ms(24)} 
              color={saved ? "#FF385C" : "#FFFFFF"} 
              fill={saved ? "#FF385C" : "rgba(0,0,0,0.4)"} 
              strokeWidth={2} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.location} numberOfLines={1}>
              {listing.location}
            </ThemedText>
            
            <View style={styles.ratingRow}>
              <Star size={ms(14)} color="#000000" fill="#000000" />
              <ThemedText style={styles.rating}>
                {listing.rating.toFixed(1)}
              </ThemedText>
            </View>
          </View>
          
          <ThemedText style={styles.name} numberOfLines={1}>
            {listing.name}
          </ThemedText>

          <ThemedText style={styles.details}>
            {listing.distance}
          </ThemedText>
          
          <ThemedText style={styles.details}>
            {listing.dates}
          </ThemedText>
          
          <View style={styles.priceRow}>
            <ThemedText style={styles.price}>
              ${listing.price}
            </ThemedText>
            <ThemedText style={styles.night}> night</ThemedText>
          </View>
        </View>
      </TouchableOpacity>

      <WishlistModal 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        listing={listing as any} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
  },
  image: {
    width: CARD_WIDTH,
    aspectRatio: 1,
  },
  pagination: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  infoContainer: {
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    fontFamily: 'Figtree-Bold',
    fontSize: ms(16),
    color: '#222222',
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: ms(14),
    color: '#222222',
  },
  name: {
    color: '#717171',
    fontFamily: 'Figtree-Regular',
    fontSize: ms(14),
    marginTop: 2,
  },
  details: {
    color: '#717171',
    fontFamily: 'Figtree-Regular',
    fontSize: ms(14),
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontFamily: 'Figtree-Bold',
    fontSize: ms(15),
    color: '#222222',
  },
  night: {
    fontFamily: 'Figtree-Regular',
    fontSize: ms(15),
    color: '#222222',
  },
});
