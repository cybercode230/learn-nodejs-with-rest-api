import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ms } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Map, Calendar, ChevronRight, Star } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { useReservations, Reservation } from '@/hooks/use-reservations';
import { useAuth } from '@/hooks/use-auth';
import { useListings } from '@/hooks/use-listings';

const { width } = Dimensions.get('window');

/**
 * TripsScreen — premium trips management experience.
 *
 * Sections:
 *  1. Bold page header
 *  2. Upcoming reservations — Play Store horizontal 2-row grid
 *  3. Where you've been — Airbnb-style listing cards
 *  4. Recommended nearby — listings matching past stay locations
 */
export default function TripsScreen() {
  const { reservations, loading } = useReservations();
  const { user } = useAuth();
  const { allListings } = useListings();
  const router = useRouter();

  const upcomingReservations = reservations.filter(r => r.status === 'upcoming');
  const pastReservations = reservations.filter(r => r.status === 'finished');

  // 2-row column chunks for horizontal Play Store grid
  const chunkedUpcoming: Reservation[][] = [];
  for (let i = 0; i < upcomingReservations.length; i += 2) {
    chunkedUpcoming.push(upcomingReservations.slice(i, i + 2));
  }

  /**
   * Derive recommended listings:
   * — find listings whose location contains any word from past/upcoming stays
   * — exclude listings already booked
   */
  const recommendedListings = useMemo(() => {
    const bookedIds = new Set(reservations.map(r => r.listingId));
    const locationWords = reservations
      .map(r => r.location.split(',')[0].trim().toLowerCase())
      .filter(Boolean);

    return allListings
      .filter(l => {
        if (bookedIds.has(l.id)) return false;
        return locationWords.some(word => l.location.toLowerCase().includes(word));
      })
      .slice(0, 6);
  }, [allListings, reservations]);

  // ── Not logged in ────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-20 h-20 rounded-full bg-[#F7F7F7] items-center justify-center mb-5">
            <Calendar size={ms(48)} color="#717171" />
          </View>
          <ThemedText className="text-[22px] font-figtree-bold text-[#222222] text-center">
            Log in to see your trips
          </ThemedText>
          <ThemedText className="text-[15px] text-[#717171] text-center mt-2 leading-5">
            You can find your reservations here once you've logged in.
          </ThemedText>
          <TouchableOpacity
            className="mt-6 bg-[#FF385C] px-8 py-4 rounded-xl w-full items-center"
            onPress={() => router.push('/auth/login')}
          >
            <ThemedText className="text-white text-[16px] font-figtree-bold">Log in</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Upcoming card (horizontal grid) ──────────────────────────
  const UpcomingCard = ({ item }: { item: Reservation }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden border border-[#EBEBEB]"
      style={{ width: width * 0.78, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}
      onPress={() => router.push(`/listing/${item.listingId}`)}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full"
        style={{ height: ms(140) }}
        contentFit="cover"
        transition={200}
      />
      {/* Status pill */}
      <View className="absolute top-3 left-3 bg-white/90 px-2.5 py-1 rounded-full">
        <ThemedText className="text-[11px] font-figtree-bold text-[#222222]">Upcoming</ThemedText>
      </View>
      <View className="p-4">
        <ThemedText className="text-[11px] font-figtree-bold text-[#717171] uppercase tracking-widest" numberOfLines={1}>
          {item.location}
        </ThemedText>
        <ThemedText className="text-[16px] font-figtree-semibold text-[#222222] mt-1" numberOfLines={1}>
          {item.name}
        </ThemedText>
        <View className="flex-row items-center gap-1.5 mt-2">
          <Calendar size={ms(12)} color="#FF385C" />
          <ThemedText className="text-[13px] font-figtree text-[#717171]">
            {item.checkIn} → {item.checkOut}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Past stay card (wishlist-style full card) ─────────────────
  const PastCard = ({ item }: { item: Reservation }) => (
    <TouchableOpacity
      className="flex-row bg-white rounded-2xl overflow-hidden mb-4 border border-[#EBEBEB]"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
      onPress={() => router.push(`/listing/${item.listingId}`)}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: ms(110), height: ms(110) }}
        contentFit="cover"
      />
      <View className="flex-1 p-4 justify-between">
        <View>
          <ThemedText className="text-[11px] font-figtree-bold text-[#717171] uppercase" numberOfLines={1}>
            {item.location}
          </ThemedText>
          <ThemedText className="text-[15px] font-figtree-semibold text-[#222222] mt-0.5" numberOfLines={2}>
            {item.name}
          </ThemedText>
          <ThemedText className="text-[13px] font-figtree text-[#717171] mt-1">
            {item.checkIn} – {item.checkOut} · {item.guests} guest{item.guests !== 1 ? 's' : ''}
          </ThemedText>
        </View>
        <View className="flex-row items-center gap-1 mt-2">
          <View className="bg-[#F7F7F7] px-2.5 py-1 rounded-full">
            <ThemedText className="text-[12px] font-figtree-semibold text-[#222222]">
              ${item.totalPrice} total
            </ThemedText>
          </View>
        </View>
      </View>
      <View className="justify-center pr-4">
        <ChevronRight size={ms(18)} color="#AAAAAA" />
      </View>
    </TouchableOpacity>
  );

  // ── Recommended listing card ──────────────────────────────────
  const RecommendedCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl overflow-hidden mr-4 border border-[#EBEBEB]"
      style={{ width: width * 0.58, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 }}
      onPress={() => router.push(`/listing/${item.id}`)}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full"
        style={{ height: ms(130) }}
        contentFit="cover"
        transition={200}
      />
      <View className="p-3">
        <ThemedText className="text-[11px] font-figtree-bold text-[#717171] uppercase" numberOfLines={1}>
          {item.location}
        </ThemedText>
        <ThemedText className="text-[14px] font-figtree-semibold text-[#222222] mt-0.5" numberOfLines={1}>
          {item.name}
        </ThemedText>
        <View className="flex-row items-center gap-1 mt-1.5">
          <Star size={ms(11)} color="#222222" fill="#222222" />
          <ThemedText className="text-[12px] font-figtree-semibold text-[#222222]">{item.rating}</ThemedText>
          <ThemedText className="text-[12px] font-figtree text-[#717171]">({item.reviewsCount})</ThemedText>
        </View>
        <ThemedText className="text-[13px] font-figtree-bold text-[#222222] mt-1">
          <ThemedText className="font-figtree-bold">${item.price}</ThemedText>
          <ThemedText className="font-figtree text-[#717171]"> night</ThemedText>
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── PAGE HEADER ────────────────────────────────────── */}
        <View className="px-6 pt-8 pb-2">
          <ThemedText type='title' className="font-bold text-[#222222] leading-tight">Trips</ThemedText>
          <ThemedText className="text-[15px] font-figtree text-[#717171] mt-1">
            {reservations.length > 0
              ? `${reservations.length} reservation${reservations.length !== 1 ? 's' : ''}`
              : 'Your travel history lives here'}
          </ThemedText>
        </View>

        {/* ── UPCOMING RESERVATIONS ──────────────────────────── */}
        {upcomingReservations.length > 0 ? (
          <View className="mt-6">
            {/* Category-link style section header */}
            <View className="flex-row items-center justify-between px-6 mb-4">
              <View className="flex-row items-center gap-2">
                <View className="w-1 h-5 rounded-full bg-[#FF385C]" />
                <ThemedText className="text-[20px] font-figtree-bold text-[#222222]">
                  Upcoming
                </ThemedText>
              </View>
              <TouchableOpacity className="flex-row items-center gap-1">
                <ThemedText className="text-[13px] font-figtree-semibold text-[#717171]">See all</ThemedText>
                <ChevronRight size={ms(14)} color="#717171" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: ms(24), paddingRight: ms(16), paddingBottom: ms(8), gap: ms(14) }}
              snapToInterval={width * 0.78 + ms(14)}
              decelerationRate="fast"
            >
              {chunkedUpcoming.map((pair, idx) => (
                <View key={idx} style={{ gap: ms(14) }}>
                  {pair.map(item => <UpcomingCard key={item.id} item={item} />)}
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View className="mx-6 mt-6 bg-[#F7F7F7] rounded-2xl p-8 items-center">
            <ThemedText className="text-[18px] font-figtree-bold text-[#222222] text-center">
              No trips booked… yet!
            </ThemedText>
            <ThemedText className="text-[14px] font-figtree text-[#717171] text-center mt-2 leading-5">
              Time to dust off your bags and start planning your next adventure.
            </ThemedText>
            <TouchableOpacity
              className="mt-5 bg-[#222222] px-6 py-3 rounded-xl"
              onPress={() => router.push('/(tabs)')}
            >
              <ThemedText className="text-white text-[14px] font-figtree-bold">Start exploring</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* ── WHERE YOU'VE BEEN ──────────────────────────────── */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-1 h-5 rounded-full bg-[#222222]" />
              <ThemedText className="text-[20px] font-figtree-bold text-[#222222]">
                Where you've been
              </ThemedText>
            </View>
          </View>

          {reservations.length === 0 ? (
            <View className="px-6">
              <ThemedText className="text-[14px] font-figtree text-[#717171]">
                Your completed stays will appear here.
              </ThemedText>
            </View>
          ) : (
            <View className="px-6">
              {reservations.map(res => (
                <PastCard key={res.id} item={res} />
              ))}

              <TouchableOpacity
                className="py-3.5 items-center border border-[#DDDDDD] rounded-xl mb-2"
                onPress={() => {}}
              >
                <ThemedText className="text-[14px] font-figtree-semibold text-[#222222]">See all stays</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── RECOMMENDED NEARBY ─────────────────────────────── */}
        {recommendedListings.length > 0 && (
          <View className="mt-8">
            <View className="px-6 mb-1">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-1 h-5 rounded-full bg-[#FF385C]" />
                <ThemedText className="text-[20px] font-figtree-bold text-[#222222]">
                  Recommended nearby
                </ThemedText>
              </View>
              <ThemedText className="text-[13px] font-figtree text-[#717171]">
                More places in areas you've stayed
              </ThemedText>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: ms(24), paddingRight: ms(16), paddingTop: ms(14), paddingBottom: ms(8) }}
            >
              {recommendedListings.map(item => (
                <RecommendedCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>
        )}

        <View className="h-28" />
      </ScrollView>
    </SafeAreaView>
  );
}
