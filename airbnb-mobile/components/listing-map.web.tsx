/**
 * @file listing-map.web.tsx
 * @description Web-safe stub for ListingMap.
 * react-native-maps imports native-only codegen modules that cannot be bundled
 * for web. Metro automatically picks this .web.tsx file on the web platform,
 * so the native listing-map.tsx (and react-native-maps) are never touched.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Listing } from '@/hooks/use-listings';
import { ThemedText } from './themed-text';

interface MapViewProps {
  listings: Listing[];
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
}

export function ListingMap({ listings, onClose }: MapViewProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>
        Map view is not available on web.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    color: '#717171',
  },
});
