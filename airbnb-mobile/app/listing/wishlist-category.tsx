import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Share as RNShare } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Share, MoreHorizontal, Heart, Star } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useWishlist, WishlistItem } from '@/hooks/use-wishlist';
import { Image } from 'expo-image';

import { ms } from 'react-native-size-matters';

/**
 * Reusable Header for screens like Wishlist Category or Listing Detail.
 */
export function ScreenHeader({ onBack, title, showRightIcons = true }: { onBack: () => void, title?: string, showRightIcons?: boolean }) {
  const handleShare = async () => {
    try {
      await RNShare.share({
        message: `Check out my wishlist: ${title}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={[styles.header, { marginTop: ms(4) }]}>
      <TouchableOpacity onPress={onBack} style={styles.iconButton}>
        <ChevronLeft size={ms(24)} color="#222222" />
      </TouchableOpacity>
      
      {showRightIcons && (
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Share size={ms(20)} color="#222222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MoreHorizontal size={ms(20)} color="#222222" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function WishlistCategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const { wishlists, removeFromWishlist } = useWishlist();
  const [sortType, setSortType] = React.useState<'date' | 'type'>('date');

  const category = wishlists.find(c => c.name === name);
  const items = React.useMemo(() => {
    let result = [...(category?.items || [])];
    if (sortType === 'type') {
      result.sort((a, b) => a.location.localeCompare(b.location));
    } else {
      result.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }
    return result;
  }, [category, sortType]);

  const groupItemsByDate = (items: WishlistItem[]) => {
    const groups: { [key: string]: WishlistItem[] } = {};
    items.forEach(item => {
      const date = new Date(item.savedAt);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[1][0].savedAt).getTime() - new Date(a[1][0].savedAt).getTime());
  };

  const groupedItems = groupItemsByDate(items);

  const renderItem = (item: WishlistItem) => (
    <View style={styles.card} key={item.id}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" transition={200} />
        <TouchableOpacity 
          style={styles.heartButton}
          onPress={() => removeFromWishlist(item.listingId)}
        >
          <Heart size={ms(22)} color="#FF385C" fill="#FF385C" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <ThemedText style={styles.location}>{item.location}</ThemedText>
          <View style={styles.ratingRow}>
            <Star size={ms(12)} color="#222222" fill="#222222" />
            <ThemedText style={styles.rating}>{item.rating.toFixed(1)}</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.itemName} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={styles.dates}>{item.dates}</ThemedText>
        
        <View style={styles.priceRow}>
          <ThemedText style={styles.price}>${item.price}</ThemedText>
          <ThemedText style={styles.night}> night</ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader onBack={() => router.back()} title={name} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.pageTitle}>{name}</ThemedText>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, sortType === 'date' && styles.activeChip]}
            onPress={() => setSortType('date')}
          >
            <ThemedText style={[styles.filterText, sortType === 'date' && styles.activeFilterText]}>By Date</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, sortType === 'type' && styles.activeChip]}
            onPress={() => setSortType('type')}
          >
            <ThemedText style={[styles.filterText, sortType === 'type' && styles.activeFilterText]}>By Location</ThemedText>
          </TouchableOpacity>
        </View>

        {groupedItems.length > 0 ? (
          sortType === 'date' ? (
            groupedItems.map(([dateKey, items]) => (
              <View key={dateKey} style={styles.dateGroup}>
                <ThemedText style={styles.dateHeader}>Saved in {dateKey}</ThemedText>
                <View style={styles.itemsGrid}>
                  {items.map(renderItem)}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.itemsGrid}>
              {items.map(renderItem)}
            </View>
          )
        ) : (
          <View style={styles.emptyState}>
             <ThemedText style={styles.emptyText}>No items saved yet.</ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
  },
  iconButton: {
    padding: ms(8),
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  scrollContent: {
    paddingHorizontal: ms(24),
    paddingTop: ms(12),
  },
  pageTitle: {
    fontSize: ms(32),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
    marginBottom: ms(24),
    textAlign: 'left',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: ms(10),
    marginBottom: ms(32),
  },
  filterChip: {
    paddingHorizontal: ms(16),
    paddingVertical: ms(8),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  activeChip: {
    backgroundColor: '#222222',
    borderColor: '#222222',
  },
  filterText: {
    fontSize: ms(14),
    fontFamily: 'Figtree-SemiBold',
    color: '#222222',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  dateGroup: {
    marginBottom: ms(40),
  },
  dateHeader: {
    fontSize: ms(18),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
    marginBottom: ms(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: ms(10),
  },
  itemsGrid: {
    flexDirection: 'column',
    gap: ms(24),
  },
  card: {
    width: '100%',
    marginBottom: ms(8),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: ms(12),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F7F7F7',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: ms(12),
    right: ms(12),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: ms(20),
    padding: ms(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    marginTop: ms(12),
    alignItems: 'flex-start',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  location: {
    fontSize: ms(16),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  rating: {
    fontSize: ms(14),
    fontFamily: 'Figtree-Medium',
    color: '#222222',
  },
  itemName: {
    fontSize: ms(14),
    color: '#717171',
    fontFamily: 'Figtree-Regular',
    marginTop: ms(2),
  },
  dates: {
    fontSize: ms(14),
    color: '#717171',
    fontFamily: 'Figtree-Regular',
    marginTop: ms(2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(8),
  },
  price: {
    fontSize: ms(16),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  night: {
    fontSize: ms(16),
    color: '#222222',
    fontFamily: 'Figtree-Regular',
  },
  emptyState: {
    marginTop: ms(60),
    alignItems: 'center',
  },
  emptyText: {
    color: '#717171',
    fontSize: ms(16),
    fontFamily: 'Figtree-Medium',
  }
});
