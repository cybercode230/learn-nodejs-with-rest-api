import React from 'react';
import { View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ms } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Calendar, Star } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useReservations, Reservation } from '@/hooks/use-reservations';
import { useAuth } from '@/hooks/use-auth';
import { useListings } from '@/hooks/use-listings';

const { width } = Dimensions.get('window');

/**
 * Google Play Store Style Trip Card
 */
function TripCard({ item, onPress }: { item: any, onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-row items-start mb-8 px-6"
      onPress={onPress}
    >
      {/* Column 1: Image (Strict Square) */}
      <Image
        source={{ uri: item.image || item.images?.[0] }}
        style={{ width: ms(100), height: ms(100), borderRadius: 12 }}
        contentFit="cover"
        transition={200}
      />
      
      {/* Column 2: Text details */}
      <View className="flex-1 ml-4 py-1">
        <View className="flex-row justify-between items-start">
          <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222] flex-1 mr-2" numberOfLines={1}>
            {item.name}
          </ThemedText>
          <View className="flex-row items-center gap-1 bg-[#F7F7F7] px-1.5 py-0.5 rounded-md">
            <Star size={10} color="#222222" fill="#222222" />
            <ThemedText className="text-[11px] font-[Figtree-Bold] text-[#222222]">
              {item.rating || '4.9'}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#717171] mt-1" numberOfLines={1}>
          {item.location}
        </ThemedText>
        
        <ThemedText className="text-[13px] font-[Figtree-Regular] text-[#717171] mt-1">
          {item.dates || 'May 15 - 20, 2024'}
        </ThemedText>
        
        <ThemedText className="text-[13px] font-[Figtree-SemiBold] text-[#222222] mt-3">
          ${item.price || item.totalPrice || '120'} total
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

type SectionItem = 
  | { type: 'header'; title: string }
  | { type: 'section_title'; title: string }
  | { type: 'trip'; data: Reservation }
  | { type: 'empty_upcoming' }
  | { type: 'recommendations' }
  | { type: 'footer' };

export default function TripsScreen() {
  const { reservations } = useReservations();
  const { user } = useAuth();
  const { allListings } = useListings();
  const router = useRouter();

  const upcomingReservations = reservations.filter(r => r.status === 'upcoming');
  const pastReservations = reservations.filter(r => r.status === 'finished');

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-20 h-20 rounded-full bg-[#F7F7F7] items-center justify-center mb-5">
            <Calendar size={ms(48)} color="#717171" />
          </View>
          <ThemedText type="title" className="text-center text-[#222222]">
            Log in to see your trips
          </ThemedText>
          <ThemedText className="text-[15px] text-[#717171] text-center mt-2 leading-5 font-[Figtree-Regular]">
            You can find your reservations here once you've logged in.
          </ThemedText>
          <TouchableOpacity
            className="mt-8 bg-[#FF385C] px-8 py-4 rounded-xl w-full items-center"
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText className="text-white text-[16px] font-[Figtree-Bold]">Log in</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderSectionHeader = (title: string) => (
    <View className="px-6 mt-10 mb-6">
      <ThemedText type="heading" className="text-[#222222]">{title}</ThemedText>
    </View>
  );

  const sections: SectionItem[] = [
    { type: 'header', title: 'Trips' },
    { type: 'section_title', title: 'Upcoming' },
    ...upcomingReservations.map(r => ({ type: 'trip' as const, data: r })),
    ...(upcomingReservations.length === 0 ? [{ type: 'empty_upcoming' as const }] : []),
    ...(pastReservations.length > 0 ? [{ type: 'section_title' as const, title: "Where you've been" }] : []),
    ...pastReservations.map(r => ({ type: 'trip' as const, data: r })),
    { type: 'section_title', title: 'Inspired by your wishlists' },
    { type: 'recommendations' },
    { type: 'footer' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={sections}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          switch (item.type) {
            case 'header':
              return (
                <View className="px-6 pt-10 pb-4">
                  <ThemedText type="title" className="text-[#222222]">{item.title}</ThemedText>
                </View>
              );
            case 'section_title':
              return renderSectionHeader(item.title);
            case 'trip':
              return <TripCard item={item.data} onPress={() => router.push(`/listing/${item.data.listingId}`)} />;
            case 'empty_upcoming':
              return (
                <View className="mx-6 bg-[#F7F7F7] rounded-3xl p-10 items-center border border-[#EBEBEB]">
                  <ThemedText className="text-[18px] font-[Figtree-Bold] text-[#222222] text-center">
                    No trips booked… yet!
                  </ThemedText>
                  <ThemedText className="text-[14px] text-[#717171] text-center mt-2 mb-6 font-[Figtree-Regular]">
                    Time to dust off your bags and start planning your next adventure.
                  </ThemedText>
                  <TouchableOpacity
                    className="bg-[#222222] px-8 py-3 rounded-xl"
                    onPress={() => router.push('/(tabs)')}
                  >
                    <ThemedText className="text-white font-[Figtree-Bold]">Start exploring</ThemedText>
                  </TouchableOpacity>
                </View>
              );
            case 'recommendations':
              return (
                <FlatList
                  horizontal
                  data={allListings.slice(0, 8)}
                  keyExtractor={(l) => l.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 24, paddingRight: 12 }}
                  renderItem={({ item: listing }) => (
                    <TouchableOpacity 
                      className="mr-5 w-[160px]"
                      onPress={() => router.push(`/listing/${listing.id}`)}
                    >
                      <Image 
                        source={{ uri: listing.images[0] }} 
                        style={{ width: ms(160), height: ms(160), borderRadius: 16 }} 
                        transition={200}
                      />
                      <View className="mt-3">
                         <ThemedText className="text-[14px] font-[Figtree-Bold] text-[#222222]">${listing.price} night</ThemedText>
                         <ThemedText className="text-[13px] font-[Figtree-Regular] text-[#717171] mt-1" numberOfLines={1}>
                           {listing.name}
                         </ThemedText>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              );
            case 'footer':
              return <View className="h-20" />;
            default:
              return null;
          }
        }}
      />
    </SafeAreaView>
  );
}
