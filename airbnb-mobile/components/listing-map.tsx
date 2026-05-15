import React, { useState } from 'react';
import { View, TouchableOpacity, useWindowDimensions, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Listing } from '@/hooks/use-listings';
import { ThemedText } from './themed-text';
import { Image } from 'expo-image';
import { Star, X, List } from './icons';
import { ms } from 'react-native-size-matters';

interface MapViewProps {
  listings: Listing[];
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
}

/**
 * ListingMap — compatible with Expo Go using react-native-maps.
 */
export function ListingMap({ listings, onClose, onSelectListing }: MapViewProps) {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const initialRegion = {
    latitude: -1.9441,
    longitude: 30.0619,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View className="flex-1">
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        showsPointsOfInterest={false}
      >
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={{
              latitude: listing.coordinates.latitude,
              longitude: listing.coordinates.longitude,
            }}
            onPress={() => setSelectedListing(listing)}
            tracksViewChanges={false}
          >
            <View className="items-center justify-center">
              <View 
                className={`bg-white rounded-2xl border border-[#DDDDDD] shadow-sm ${selectedListing?.id === listing.id ? 'bg-[#222222] border-[#222222]' : ''}`}
                style={{ paddingHorizontal: ms(8), paddingVertical: ms(4) }}
              >
                <ThemedText 
                  className={`font-[Figtree-Bold] ${selectedListing?.id === listing.id ? 'text-white' : 'text-[#222222]'}`}
                  style={{ fontSize: ms(12) }}
                >
                  ${listing.price}
                </ThemedText>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Close Button */}
      <TouchableOpacity 
        className="absolute left-5 bg-white rounded-full items-center justify-center shadow-lg" 
        style={{ top: ms(50), width: ms(40), height: ms(40) }}
        onPress={onClose}
      >
        <X size={ms(20)} color="#000000" />
      </TouchableOpacity>

      {/* Selected Listing Card Popup */}
      {selectedListing && (
        <TouchableOpacity 
          activeOpacity={1}
          className="absolute w-full px-5"
          style={{ bottom: ms(95) }}
          onPress={() => onSelectListing(selectedListing)}
        >
          <View className="bg-white rounded-2xl flex-row w-full overflow-hidden shadow-2xl">
            <Image 
              source={{ uri: selectedListing.images[0] }} 
              style={{ width: ms(110), height: ms(110) }} 
            />
            <View className="flex-1 p-3 justify-center">
               <View className="flex-row justify-between items-start">
                  <ThemedText 
                    className="font-[Figtree-Bold] text-[#222222] flex-1 mr-2" 
                    style={{ fontSize: ms(14) }}
                    numberOfLines={1}
                  >
                    {selectedListing.name}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setSelectedListing(null)}>
                     <X size={ms(16)} color="#717171" />
                  </TouchableOpacity>
               </View>
               <View className="flex-row items-center mt-1 gap-1">
                  <Star size={ms(12)} color="#222222" fill="#222222" />
                  <ThemedText 
                    className="font-[Figtree-SemiBold] text-[#222222]"
                    style={{ fontSize: ms(12) }}
                  >
                    {selectedListing.rating}
                  </ThemedText>
               </View>
               <ThemedText 
                 className="font-[Figtree-Bold] text-[#222222] mt-2"
                 style={{ fontSize: ms(14) }}
               >
                 ${selectedListing.price} night
               </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom Toggle Button (Show List) */}
      <TouchableOpacity 
        className="absolute self-center bg-[#222222] flex-row items-center rounded-full shadow-xl"
        style={{ bottom: ms(35), paddingHorizontal: ms(20), paddingVertical: ms(12), gap: ms(8) }}
        activeOpacity={0.9}
        onPress={onClose}
      >
        <ThemedText className="text-white font-[Figtree-Bold] text-[14px]">Show list</ThemedText>
        <List size={ms(18)} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
