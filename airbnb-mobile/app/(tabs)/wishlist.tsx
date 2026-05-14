import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWishlist } from '@/hooks/use-wishlist';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight } from '@/components/icons';

export default function WishlistScreen() {
  const { wishlists } = useWishlist();
  const router = useRouter();

  const handleCategoryPress = (category: any) => {
    router.push({
      pathname: '/listing/wishlist-category',
      params: { name: category.name }
    });
  };

  const renderCategory = ({ item }: { item: any }) => {
    const hasItems = item.items.length > 0;
    
    return (
      <TouchableOpacity 
        style={styles.categoryRow} 
        onPress={() => handleCategoryPress(item)}
      >
        <View style={styles.imageContainer}>
          {hasItems ? (
            <Image 
              source={{ uri: item.items[0].image }} 
              style={styles.squareImage}
            />
          ) : (
            <View style={styles.emptyImage}>
               <ThemedText style={styles.emptyText}>Empty</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
          <ThemedText style={styles.itemCount}>
            {item.items.length} {item.items.length === 1 ? 'saved item' : 'saved items'}
          </ThemedText>
        </View>

        <ChevronRight size={20} color="#717171" style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Wishlists</ThemedText>
      </View>

      <FlatList
        key="wishlist-horizontal-list"
        data={wishlists}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyTitle}>No wishlists yet</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Click the heart icon on any listing to save it here.
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  squareImage: {
    width: '100%',
    height: '100%',
  },
  emptyImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#717171',
    fontSize: 12,
    fontFamily: 'Figtree-Medium',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  itemCount: {
    fontSize: 14,
    color: '#717171',
    fontFamily: 'Figtree-Regular',
    marginTop: 4,
  },
  chevron: {
    marginLeft: 8,
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Figtree-Bold',
    color: '#222222',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#717171',
    textAlign: 'center',
    fontFamily: 'Figtree-Regular',
    lineHeight: 20,
  },
});
