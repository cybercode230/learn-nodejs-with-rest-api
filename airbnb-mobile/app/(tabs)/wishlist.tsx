import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight, Plus, Heart } from '@/components/icons';
import { ms } from 'react-native-size-matters';

/**
 * WishlistScreen — redesigned with row-based layout.
 * Map is removed from here and moved to the category detail page.
 */
export default function WishlistScreen() {
  const { wishlists, createCategory } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // ── AUTH WALL ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Wishlists</ThemedText>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: ms(40) }}>
          <View style={{ width: ms(80), height: ms(80), borderRadius: ms(40), backgroundColor: '#F7F7F7', alignItems: 'center', justifyContent: 'center', marginBottom: ms(20) }}>
            <Heart size={ms(40)} color="#717171" />
          </View>
          <ThemedText style={{ fontSize: ms(22), fontFamily: 'Figtree-Bold', color: '#222222', textAlign: 'center', marginBottom: ms(8) }}>
            Log in to view your wishlists
          </ThemedText>
          <ThemedText style={{ fontSize: ms(14), fontFamily: 'Figtree-Regular', color: '#717171', textAlign: 'center', lineHeight: ms(22), marginBottom: ms(32) }}>
            Save your favourite places and access them anytime after logging in.
          </ThemedText>
          <TouchableOpacity
            style={{ backgroundColor: '#FF385C', borderRadius: ms(8), paddingVertical: ms(14), width: '100%', alignItems: 'center', marginBottom: ms(16) }}
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText style={{ color: '#FFFFFF', fontSize: ms(16), fontFamily: 'Figtree-Bold' }}>Log in</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <ThemedText style={{ fontSize: ms(14), fontFamily: 'Figtree-Regular', color: '#717171' }}>
              Don't have an account?{' '}
              <ThemedText style={{ fontFamily: 'Figtree-Bold', color: '#222222', textDecorationLine: 'underline' }}>Sign up</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  // ────────────────────────────────────────────────────────────────────

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
        activeOpacity={0.7}
        onPress={() => handleCategoryPress(item)}
      >
        <View style={styles.imageContainer}>
          {hasItems ? (
            <Image 
              source={{ uri: item.items[0].image || item.items[0].images?.[0] }} 
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
        data={wishlists}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity 
            style={styles.createCategoryRow}
            onPress={() => createCategory('New Category')}
          >
            <View style={styles.plusIconContainer}>
               <Plus size={24} color="#222222" />
            </View>
            <View style={styles.infoContainer}>
              <ThemedText style={styles.categoryName}>Create new wishlist</ThemedText>
            </View>
            <ChevronRight size={20} color="#717171" />
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
               <Plus size={32} color="#717171" />
            </View>
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
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: ms(32),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  createCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
    marginBottom: 8,
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
  plusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
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
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
