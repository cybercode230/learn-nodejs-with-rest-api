import React, { useState } from 'react';
import { View, FlatList, StatusBar, StyleSheet, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { ListingCard } from '@/components/listing-card';
import { SearchHeader } from '@/components/search-header';
import { CategoryFilter } from '@/components/category-filter';
import { useListings, Listing } from '@/hooks/use-listings';
import { ThemedText } from '@/components/themed-text';
import { Search } from '@/components/icons';
import { useRouter } from 'expo-router';

/**
 * HomeScreen (Explore) - The primary entry point for discovery.
 */
export default function HomeScreen() {
  const { listings, loading, selectedCategory, setSelectedCategory } = useListings();
  const router = useRouter();

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Search size={48} color="#717171" />
      </View>
      <ThemedText type="heading" style={styles.emptyTitle}>
        No results found
      </ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Try adjusting your filters or searching for something else.
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Sticky Headers */}
      <SearchHeader />
      <CategoryFilter 
        activeCategoryId={selectedCategory} 
        onCategoryChange={setSelectedCategory} 
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <ListingCard listing={item as any} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#222222',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#717171',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
