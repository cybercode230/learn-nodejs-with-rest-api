import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Filter } from './icons';
import { ThemedText } from './themed-text';
import { SearchModal } from './search-modal';

import { useSearch } from '@/hooks/use-search';

/**
 * Airbnb-style professional Search Header.
 * Condensed design with shadow and high-quality typography.
 * Handles the transition to the immersive Search Modal.
 */
export function SearchHeader() {
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { searchQuery } = useSearch();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) + 4 }]}>
      <View style={styles.content}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
          style={styles.searchBar}
        >
          <Search size={20} color="#FF385C" />
          <View style={styles.textContainer}>
            <ThemedText style={styles.title}>
              {searchQuery || 'Where to?'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {searchQuery ? 'Anywhere • Any week • Add guests' : 'Anywhere • Any week • Add guests'}
            </ThemedText>
          </View>
          
          <View style={styles.filterButton}>
            <Filter size={16} color="#222222" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Native Modal for immersive search experience */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SearchModal onClose={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 14,
    color: '#222222',
  },
  subtitle: {
    color: '#717171',
    fontSize: 12,
    fontFamily: 'Figtree-Regular',
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 20,
  },
});
