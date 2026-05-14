import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, TextInput, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { X, Plus, Heart } from './icons';
import { ThemedText } from './themed-text';
import { useWishlist } from '@/hooks/use-wishlist';
import { Image } from 'expo-image';

const { height } = Dimensions.get('window');

interface WishlistModalProps {
  isVisible: boolean;
  onClose: () => void;
  listing: any;
}

export function WishlistModal({ isVisible, onClose, listing }: WishlistModalProps) {
  const { wishlists, addToWishlist, createCategory } = useWishlist();
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSaveToCategory = (categoryName: string) => {
    addToWishlist(listing, categoryName);
    onClose();
  };

  const handleCreateAndSave = () => {
    if (newCategoryName.trim()) {
      createCategory(newCategoryName.trim());
      addToWishlist(listing, newCategoryName.trim());
      setNewCategoryName('');
      setIsCreatingNew(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color="#000000" />
              </TouchableOpacity>
              <ThemedText style={styles.headerTitle}>Save to wishlist</ThemedText>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.body}>
              {!isCreatingNew ? (
                <>
                  <TouchableOpacity 
                    style={styles.createItem}
                    onPress={() => setIsCreatingNew(true)}
                  >
                    <View style={styles.plusIconContainer}>
                      <Plus size={24} color="#FFFFFF" />
                    </View>
                    <ThemedText style={styles.createLabel}>Create new wishlist</ThemedText>
                  </TouchableOpacity>

                  <FlatList
                    data={wishlists}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.wishlistItem}
                        onPress={() => handleSaveToCategory(item.name)}
                      >
                        <View style={styles.wishlistImageContainer}>
                          {item.items.length > 0 ? (
                            <Image 
                              source={{ uri: item.items[0].image }} 
                              style={styles.wishlistImage}
                            />
                          ) : (
                            <View style={styles.wishlistImagePlaceholder}>
                               <Heart size={24} color="#DDDDDD" />
                            </View>
                          )}
                        </View>
                        <ThemedText style={styles.wishlistName}>{item.name}</ThemedText>
                      </TouchableOpacity>
                    )}
                  />
                </>
              ) : (
                <View style={styles.createContainer}>
                  <ThemedText style={styles.inputLabel}>Name</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Name your wishlist"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    autoFocus
                    maxLength={50}
                  />
                  <ThemedText style={styles.charCount}>{newCategoryName.length}/50 characters</ThemedText>
                  
                  <View style={styles.createFooter}>
                    <TouchableOpacity 
                      onPress={() => setIsCreatingNew(false)}
                      style={styles.clearButton}
                    >
                      <ThemedText type="link">Clear</ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={handleCreateAndSave}
                      style={[styles.createButton, !newCategoryName.trim() && styles.disabledButton]}
                      disabled={!newCategoryName.trim()}
                    >
                      <ThemedText style={styles.createButtonText}>Create and save</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    height: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Figtree-Bold',
    fontSize: 16,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  createItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  plusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  createLabel: {
    fontFamily: 'Figtree-SemiBold',
    fontSize: 16,
    color: '#222222',
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wishlistImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  wishlistImage: {
    width: '100%',
    height: '100%',
  },
  wishlistImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistName: {
    fontFamily: 'Figtree-Medium',
    fontSize: 16,
    color: '#222222',
  },
  createContainer: {
    flex: 1,
  },
  inputLabel: {
    color: '#717171',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontSize: 18,
    fontFamily: 'Figtree-Regular',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingVertical: 8,
    color: '#222222',
  },
  charCount: {
    color: '#717171',
    fontSize: 12,
    marginTop: 8,
  },
  createFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  clearButton: {
    paddingVertical: 12,
  },
  createButton: {
    backgroundColor: '#222222',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#DDDDDD',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Figtree-Bold',
    fontSize: 16,
  }
});
