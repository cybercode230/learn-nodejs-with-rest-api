import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, FlatList, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/hooks/use-auth';
import { ms } from 'react-native-size-matters';
import { Plus, Briefcase, ChevronRight, X, ImageIcon, Trash2, Check, Clock } from '@/components/icons';
import { useRouter } from 'expo-router';
import { useHostListings } from '@/hooks/use-listings';
import { useReceivedReservations } from '@/hooks/use-reservations';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export default function HostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { listings, createListing, uploadPhotos, deleteListing, loading: listingsLoading } = useHostListings();
  const { reservations, confirmReservation, cancelReservation, loading: resLoading } = useReceivedReservations();
  const { width } = useWindowDimensions();

  // Navigation state
  const [view, setView] = useState<'dashboard' | 'listings' | 'reservations'>('dashboard');

  // Create Listing Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    guests: '',
    type: 'APARTMENT',
    amenities: '',
  });
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);

  const handlePickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedPhotos(result.assets);
    }
  };

  const handleCreateListing = async () => {
    try {
      const data = {
        ...newListing,
        pricePerNight: parseFloat(newListing.pricePerNight),
        guests: parseInt(newListing.guests),
        amenities: newListing.amenities.split(',').map(s => s.trim()),
      };

      const createdListing = await createListing(data);
      
      if (selectedPhotos.length > 0) {
        await uploadPhotos({ listingId: createdListing.id, photos: selectedPhotos });
      }

      Alert.alert('Success', 'Listing created successfully');
      setCreateModalVisible(false);
      setNewListing({
        title: '',
        description: '',
        location: '',
        pricePerNight: '',
        guests: '',
        type: 'APARTMENT',
        amenities: '',
      });
      setSelectedPhotos([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create listing');
    }
  };

  const renderDashboard = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Host Dashboard</ThemedText>
        <ThemedText style={styles.subtitle}>Welcome back, {user?.name}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Your Listings</ThemedText>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => setCreateModalVisible(true)}
        >
          <View style={styles.iconContainer}>
            <Plus size={24} color="#222222" />
          </View>
          <View style={styles.actionInfo}>
            <ThemedText style={styles.actionTitle}>Create new listing</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Add a new property to your portfolio</ThemedText>
          </View>
          <ChevronRight size={20} color="#717171" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => setView('listings')}
        >
          <View style={styles.iconContainer}>
            <Briefcase size={24} color="#222222" />
          </View>
          <View style={styles.actionInfo}>
            <ThemedText style={styles.actionTitle}>Manage Listings</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Edit or update your existing properties</ThemedText>
          </View>
          <ChevronRight size={20} color="#717171" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Reservations</ThemedText>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => setView('reservations')}
        >
          <View style={styles.iconContainer}>
            <Briefcase size={24} color="#222222" />
          </View>
          <View style={styles.actionInfo}>
            <ThemedText style={styles.actionTitle}>Manage Bookings</ThemedText>
            <ThemedText style={styles.actionSubtitle}>View and manage upcoming guest reservations</ThemedText>
          </View>
          <ChevronRight size={20} color="#717171" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderManageListings = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setView('dashboard')}>
          <X size={24} color="#222222" />
        </TouchableOpacity>
        <ThemedText style={styles.subTitle}>My Listings</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.listingItem}>
            <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
            <View style={styles.listingInfo}>
              <ThemedText style={styles.listingTitle}>{item.name}</ThemedText>
              <ThemedText style={styles.listingSubtitle}>{item.location}</ThemedText>
              <ThemedText style={styles.listingPrice}>${item.price} / night</ThemedText>
            </View>
            <View style={styles.listingActions}>
              <TouchableOpacity onPress={() => router.push(`/listing/${item.id}`)} style={styles.iconBtn}>
                <ChevronRight size={20} color="#717171" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                Alert.alert('Delete', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteListing(item.id) }
                ]);
              }} style={styles.iconBtn}>
                <Trash2 size={20} color="#FF385C" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText>No listings yet.</ThemedText>
          </View>
        }
      />
    </View>
  );

  const renderManageReservations = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => setView('dashboard')}>
          <X size={24} color="#222222" />
        </TouchableOpacity>
        <ThemedText style={styles.subTitle}>Reservations</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.resItem}>
            <View style={styles.resHeader}>
              <ThemedText style={styles.resTitle}>{item.listingName}</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? '#E7F6EC' : '#F7F7F7' }]}>
                <ThemedText style={[styles.statusText, { color: item.status === 'confirmed' ? '#008A05' : '#717171' }]}>
                  {item.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.resGuest}>Guest: {item.guestName}</ThemedText>
            <ThemedText style={styles.resDates}>{item.checkIn} - {item.checkOut}</ThemedText>
            <ThemedText style={styles.resPrice}>Total: ${item.totalPrice}</ThemedText>
            
            {item.status === 'pending' && (
              <View style={styles.resActions}>
                <TouchableOpacity 
                  style={[styles.resBtn, styles.confirmBtn]}
                  onPress={() => confirmReservation(item.id)}
                >
                  <Check size={18} color="white" />
                  <ThemedText style={styles.resBtnText}>Confirm</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.resBtn, styles.cancelBtn]}
                  onPress={() => cancelReservation(item.id)}
                >
                  <X size={18} color="#222222" />
                  <ThemedText style={[styles.resBtnText, { color: '#222222' }]}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText>No reservations yet.</ThemedText>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {view === 'dashboard' && renderDashboard()}
      {view === 'listings' && renderManageListings()}
      {view === 'reservations' && renderManageReservations()}

      {/* Create Listing Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <X size={24} color="#222222" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Create Listing</ThemedText>
            <TouchableOpacity onPress={handleCreateListing}>
              <ThemedText style={styles.saveBtn}>Save</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContent}>
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Title</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Modern Beach Villa"
                value={newListing.title}
                onChangeText={(text) => setNewListing({ ...newListing, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="A beautiful villa..."
                multiline
                numberOfLines={4}
                value={newListing.description}
                onChangeText={(text) => setNewListing({ ...newListing, description: text })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <ThemedText style={styles.label}>Price / Night</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="350"
                  keyboardType="numeric"
                  value={newListing.pricePerNight}
                  onChangeText={(text) => setNewListing({ ...newListing, pricePerNight: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <ThemedText style={styles.label}>Guests</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="6"
                  keyboardType="numeric"
                  value={newListing.guests}
                  onChangeText={(text) => setNewListing({ ...newListing, guests: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Location</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Malibu, CA"
                value={newListing.location}
                onChangeText={(text) => setNewListing({ ...newListing, location: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Property Type</ThemedText>
              <View style={styles.typeSelector}>
                {['APARTMENT', 'VILLA', 'ROOM', 'CABIN'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeBtn, newListing.type === type && styles.typeBtnActive]}
                    onPress={() => setNewListing({ ...newListing, type })}
                  >
                    <ThemedText style={[styles.typeText, newListing.type === type && styles.typeTextActive]}>
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Amenities (comma separated)</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="WiFi, Pool, Beach Access"
                value={newListing.amenities}
                onChangeText={(text) => setNewListing({ ...newListing, amenities: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Photos (up to 5)</ThemedText>
              <TouchableOpacity style={styles.photoUpload} onPress={handlePickPhotos}>
                <ImageIcon size={32} color="#717171" />
                <ThemedText style={styles.uploadText}>
                  {selectedPhotos.length > 0 ? `${selectedPhotos.length} photos selected` : 'Select photos'}
                </ThemedText>
              </TouchableOpacity>
              <View style={styles.photoGrid}>
                {selectedPhotos.map((photo, index) => (
                  <Image key={index} source={{ uri: photo.uri }} style={{
                    width: (width - 56) / 3,
                    height: (width - 56) / 3,
                    borderRadius: 8,
                  }} />
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: ms(32),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  subtitle: {
    fontSize: ms(16),
    fontFamily: 'Figtree-Regular',
    color: '#717171',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: ms(20),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: ms(16),
    fontFamily: 'Figtree-Bold',
    color: '#222222',
  },
  actionSubtitle: {
    fontSize: ms(12),
    fontFamily: 'Figtree-Regular',
    color: '#717171',
    marginTop: 2,
  },
  // Manage Listings Styles
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  subTitle: {
    fontSize: 18,
    fontFamily: 'Figtree-Bold',
  },
  listContent: {
    padding: 20,
  },
  listingItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listingTitle: {
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
  },
  listingSubtitle: {
    fontSize: 14,
    color: '#717171',
  },
  listingPrice: {
    fontSize: 14,
    fontFamily: 'Figtree-Bold',
    marginTop: 4,
  },
  listingActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  iconBtn: {
    padding: 8,
  },
  // Reservation Styles
  resItem: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resTitle: {
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Figtree-Bold',
  },
  resGuest: {
    fontSize: 14,
    fontFamily: 'Figtree-Medium',
  },
  resDates: {
    fontSize: 14,
    color: '#717171',
  },
  resPrice: {
    fontSize: 14,
    fontFamily: 'Figtree-Bold',
    marginTop: 4,
  },
  resActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  resBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  confirmBtn: {
    backgroundColor: '#222222',
  },
  cancelBtn: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#222222',
  },
  resBtnText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Figtree-Bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Figtree-Bold',
  },
  saveBtn: {
    fontSize: 16,
    fontFamily: 'Figtree-Bold',
    color: '#FF385C',
  },
  formContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Figtree-Bold',
    marginBottom: 8,
    color: '#222222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Figtree-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  typeBtnActive: {
    backgroundColor: '#222222',
    borderColor: '#222222',
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Figtree-Medium',
    color: '#222222',
  },
  typeTextActive: {
    color: 'white',
  },
  photoUpload: {
    height: 120,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
  },
  uploadText: {
    marginTop: 8,
    color: '#717171',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  photoThumb: {
    // Moved to inline style to use dynamic width
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
});
