import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Star, Heart } from '@/components/icons';
import { ThemedText } from './themed-text';
import { useRouter } from 'expo-router';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { WishlistModal } from './wishlist-modal';
import { useState } from 'react';

export interface Listing {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  rating: number;
  image: string;
  distance: string;
  dates: string;
}

/**
 * Reusable Listing Card Component.
 * Implements smooth image transitions and professional typography.
 * Handles navigation to detail view using Expo Router.
 */
export function ListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { isSaved, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const saved = isSaved(listing.id);

  const handlePress = () => {
    router.push({
      pathname: '/listing/[id]',
      params: { id: listing.id }
    });
  };

  const handleHeartPress = (e: any) => {
    e.stopPropagation(); // Prevent navigation to details
    
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

  return (
    <>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handlePress}
        style={styles.container}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: listing.image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          <TouchableOpacity 
            style={styles.heartButton}
            activeOpacity={0.7}
            onPress={handleHeartPress}
          >
            <Heart 
              size={24} 
              color={saved ? "#FF385C" : "#FFFFFF"} 
              fill={saved ? "#FF385C" : "rgba(0,0,0,0.5)"} 
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
              <Star size={14} color="#000000" fill="#000000" />
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
        listing={listing} 
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
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    fontSize: 17,
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
    fontSize: 15,
    color: '#222222',
  },
  name: {
    color: '#717171',
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    marginTop: 2,
  },
  details: {
    color: '#717171',
    fontFamily: 'Figtree-Regular',
    fontSize: 15,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontFamily: 'Figtree-Bold',
    fontSize: 16,
    color: '#222222',
  },
  night: {
    fontFamily: 'Figtree-Regular',
    fontSize: 16,
    color: '#222222',
  },
});
