import React, { useState, useMemo, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, Modal, FlatList, TextInput,SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { 
  ChevronLeft, Share, Heart, Star, Map as MapIcon, User, X, 
  ChevronRight, Wifi, Car, Wind, Mountain, Briefcase, ChefHat, 
  ShieldAlert, ShieldCheck, Flag, Search, Check, Clock, Calendar
} from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ms, vs } from 'react-native-size-matters';
import { useListings, useListingDetail, Listing, Review } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import { useReservations } from '@/hooks/use-reservations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * PropertyDetails — Highly immersive, feature-rich listing detail page.
 * Implements Airbnb-style image swiping, AI reviews, and detailed property sections.
 */
export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { listing: property, loading: isPropertyLoading } = useListingDetail(id);
  const { user, isAuthenticated } = useAuth();
  const { addReservation } = useReservations();
  
  // UI States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageGridVisible, setImageGridVisible] = useState(false);
  const [selectedViewerImage, setSelectedViewerImage] = useState<string | null>(null);
  const [descModalVisible, setDescModalVisible] = useState(false);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [amenitiesModalVisible, setAmenitiesModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportStep, setReportStep] = useState(1);
  const [searchReview, setSearchReview] = useState('');

  // Booking states
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const onImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const filteredReviews = useMemo(() => {
    if (!property?.reviews) return [];
    if (!searchReview) return property.reviews;
    return property.reviews.filter((r: Review) => 
      r.comment.toLowerCase().includes(searchReview.toLowerCase()) ||
      r.user.toLowerCase().includes(searchReview.toLowerCase())
    );
  }, [property?.reviews, searchReview]);

  // Average Scores Calculation
  const avgScores = useMemo(() => {
    if (!property?.reviews?.length) return null;
    const totals = { cleanliness: 0, accuracy: 0, communication: 0, location: 0, checkin: 0, value: 0 };
    property.reviews.forEach((r: Review) => {
      if (r.scores) {
        totals.cleanliness += r.scores.cleanliness;
        totals.accuracy += r.scores.accuracy;
        totals.communication += r.scores.communication;
        totals.location += r.scores.location;
        totals.checkin += r.scores.checkin;
        totals.value += r.scores.value;
      }
    });
    const count = property.reviews.filter((r: Review) => r.scores).length || 1;
    return {
      cleanliness: (totals.cleanliness / count).toFixed(1),
      accuracy: (totals.accuracy / count).toFixed(1),
      communication: (totals.communication / count).toFixed(1),
      location: (totals.location / count).toFixed(1),
      checkin: (totals.checkin / count).toFixed(1),
      value: (totals.value / count).toFixed(1),
    };
  }, [property?.reviews]);

  if (isPropertyLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  if (!property) return null;
 
  const ScoreBar = ({ label, score }: { label: string, score: any }) => (
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-1">
        <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#222222]">{label}</ThemedText>
      </View>
      <View className="flex-row items-center gap-3">
        <View className="w-32 h-1 bg-[#EEEEEE] rounded-full overflow-hidden">
          <View 
            className="h-full bg-[#222222] rounded-full" 
            style={{ width: `${(parseFloat(score) / 5) * 100}%` }} 
          />
        </View>
        <ThemedText className="text-[12px] font-[Figtree-Bold] text-[#222222] w-6">{score}</ThemedText>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── IMAGE CAROUSEL ────────────────────────────────── */}
        <View className="relative">
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onImageScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={1} onPress={() => setImageGridVisible(true)}>
                <Image
                  source={{ uri: item }}
                  style={{ width: SCREEN_WIDTH, height: ms(300) }}
                  contentFit="cover"
                />
              </TouchableOpacity>
            )}
          />

          {/* Top Controls */}
          <SafeAreaView className="absolute top-0 left-0 right-0 z-20">
            <View className="flex-row justify-between px-5 py-4">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="bg-white p-2 rounded-full shadow-md items-center justify-center"
                style={{ width: ms(40), height: ms(40) }}
              >
                <ChevronLeft size={ms(22)} color="#000000" />
              </TouchableOpacity>
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  className="bg-white p-2 rounded-full shadow-md items-center justify-center"
                  style={{ width: ms(40), height: ms(40) }}
                >
                  <Share size={ms(18)} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-white p-2 rounded-full shadow-md items-center justify-center"
                  style={{ width: ms(40), height: ms(40) }}
                >
                  <Heart size={ms(18)} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          {/* Image Count Indicator */}
          <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1 rounded-md z-10">
            <ThemedText className="text-white text-[12px] font-[Figtree-SemiBold]">
              {activeImageIndex + 1} / {property.images.length}
            </ThemedText>
          </View>
        </View>

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        <View className="px-6 py-6">
          <ThemedText className="text-[28px] font-[Figtree-Bold] text-[#222222] leading-9">
            {property.name}
          </ThemedText>

          <View className="flex-row items-center mt-2 gap-1">
            <Star size={ms(14)} color="#000000" fill="#000000" />
            <ThemedText className="text-[14px] font-[Figtree-SemiBold] text-[#222222]">
              {property.rating} · {property.reviewsCount} reviews
            </ThemedText>
            <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#717171]">
              · {property.location}
            </ThemedText>
          </View>

          <View className="h-[1px] bg-[#F0F0F0] my-6" />

          {/* Host Info */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <ThemedText className="text-[18px] font-[Figtree-SemiBold] text-[#222222]">
                {property.type} hosted by {property.host.name}
              </ThemedText>
              <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#717171] mt-1">
                {property.details.guests} guests · {property.details.bedrooms} bedroom · {property.details.beds} bed · {property.details.baths} bath
              </ThemedText>
            </View>
            <Image source={{ uri: property.host.image }} className="w-12 h-12 rounded-full" />
          </View>

          <View className="h-[1px] bg-[#F0F0F0] my-6" />

          {/* Description */}
          <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222] leading-6" numberOfLines={3}>
            {property.description}
          </ThemedText>
          <TouchableOpacity onPress={() => setDescModalVisible(true)} className="mt-2 flex-row items-center gap-1">
            <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222] underline">Show more</ThemedText>
            <ChevronRight size={16} color="#222222" />
          </TouchableOpacity>

          <View className="h-[1px] bg-[#F0F0F0] my-6" />

          {/* AI Summary Section */}
          <View className="bg-[#F7F7F7] p-5 rounded-2xl border border-[#EBEBEB]">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="bg-[#FF385C] p-1.5 rounded-lg">
                <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222]">AI-powered summary</ThemedText>
            </View>
            <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#484848] italic leading-5">
              "{property.aiSummary}"
            </ThemedText>
          </View>

          <View className="h-[1px] bg-[#F0F0F0] my-8" />

          {/* Reviews Preview */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Star size={ms(18)} color="#222222" fill="#222222" />
              <ThemedText className="text-[20px] font-[Figtree-Bold] text-[#222222]">
                {property.rating} · {property.reviewsCount} reviews
              </ThemedText>
            </View>
            <TouchableOpacity onPress={() => setReviewsModalVisible(true)}>
              <ThemedText className="text-[14px] font-[Figtree-Bold] text-[#222222] underline">Show all</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
            {property.reviews.slice(0, 5).map((review: Review) => (
              <View key={review.id} className="w-72 mr-4 p-5 rounded-2xl border border-[#EBEBEB] bg-white">
                <View className="flex-row items-center gap-3 mb-3">
                  <Image source={{ uri: review.userImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }} className="w-10 h-10 rounded-full" />
                  <View>
                    <ThemedText className="text-[15px] font-[Figtree-Bold] text-[#222222]">{review.user}</ThemedText>
                    <ThemedText className="text-[12px] font-[Figtree-Regular] text-[#717171]">{review.date}</ThemedText>
                  </View>
                </View>
                <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#222222] leading-5" numberOfLines={3}>
                  {review.comment}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

          <View className="h-[1px] bg-[#F0F0F0] my-8" />

          {/* Amenities Section */}
          <ThemedText className="text-[20px] font-[Figtree-Bold] text-[#222222] mb-5">What this place offers</ThemedText>
          <View className="gap-4">
            {property.amenities.slice(0, 5).map((amenity: any) => (
              <View key={amenity.id} className="flex-row items-center gap-4">
                <View className="w-6 items-center"><ThemedText>✨</ThemedText></View>
                <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222]">{amenity.name}</ThemedText>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => setAmenitiesModalVisible(true)} className="mt-6 py-3 px-6 border border-[#222222] rounded-xl self-start">
            <ThemedText className="text-[14px] font-[Figtree-Bold] text-[#222222]">Show all {property.amenities.length} amenities</ThemedText>
          </TouchableOpacity>

          <View className="h-[1px] bg-[#F0F0F0] my-8" />

          {/* Safety & Property */}
          <ThemedText className="text-[20px] font-[Figtree-Bold] text-[#222222] mb-5">Safety & property</ThemedText>
          <View className="gap-4">
            <View className="flex-row items-center gap-4">
              <ShieldCheck size={20} color="#222222" />
              <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222]">Carbon monoxide alarm</ThemedText>
            </View>
            <View className="flex-row items-center gap-4">
              <ShieldAlert size={20} color="#222222" />
              <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222]">Smoke alarm not reported</ThemedText>
            </View>
          </View>

          <View className="h-[1px] bg-[#F0F0F0] my-8" />

          {/* Report Listing */}
          <TouchableOpacity onPress={() => setReportModalVisible(true)} className="flex-row items-center gap-3">
            <Flag size={20} color="#717171" />
            <ThemedText className="text-[14px] font-[Figtree-SemiBold] text-[#717171] underline">Report this listing</ThemedText>
          </TouchableOpacity>

        </View>

        <View className="h-32" />
      </ScrollView>

      {/* ── FOOTER BOOKING BAR ──────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-6 pt-4 pb-10 flex-row items-center justify-between shadow-2xl">
        <View>
          <View className="flex-row items-center">
            <ThemedText className="text-[18px] font-[Figtree-Bold] text-[#222222]">${property.price}</ThemedText>
            <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222]"> night</ThemedText>
          </View>
          <ThemedText className="text-[12px] font-[Figtree-SemiBold] mt-0.5 underline text-[#717171]">
            {property.dates}
          </ThemedText>
        </View>

        <TouchableOpacity className="bg-[#FF385C] px-8 py-4 rounded-xl" onPress={() => {
          if (!isAuthenticated) {
            router.push('/auth/login');
            return;
          }
          setBookingModalVisible(true);
        }}>
          <ThemedText className="text-white font-[Figtree-Bold] text-[16px]">Reserve</ThemedText>
        </TouchableOpacity>
      </View>

      {/* ── MODALS ─────────────────────────────────────── */}

      {/* 0. Booking Modal */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[28px] p-6 h-[70%]">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <X size={24} color="#222222" />
              </TouchableOpacity>
              <ThemedText className="text-[16px] font-[Figtree-Bold]">Confirm and pay</ThemedText>
              <View className="w-6" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row gap-4 mb-6 pb-6 border-b border-[#EBEBEB]">
                <Image source={{ uri: property.images[0] }} className="w-24 h-24 rounded-xl" />
                <View className="flex-1 justify-center">
                  <ThemedText className="text-[12px] font-[Figtree-Regular] text-[#717171]">{property.type} in {property.location}</ThemedText>
                  <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222] mt-1">{property.name}</ThemedText>
                  <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#222222] mt-2">⭐ {property.rating} ({property.reviewsCount} reviews)</ThemedText>
                </View>
              </View>

              <ThemedText className="text-[20px] font-[Figtree-Bold] text-[#222222] mb-4">Your trip</ThemedText>
              
              <View className="flex-row justify-between mb-4">
                <View>
                  <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222]">Dates</ThemedText>
                  <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#717171]">Oct 15 - Oct 20</ThemedText>
                </View>
                <TouchableOpacity><ThemedText className="text-[14px] font-[Figtree-Bold] underline text-[#222222]">Edit</ThemedText></TouchableOpacity>
              </View>

              <View className="flex-row justify-between mb-6 pb-6 border-b border-[#EBEBEB]">
                <View>
                  <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222]">Guests</ThemedText>
                  <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#717171]">1 guest</ThemedText>
                </View>
                <TouchableOpacity><ThemedText className="text-[14px] font-[Figtree-Bold] underline text-[#222222]">Edit</ThemedText></TouchableOpacity>
              </View>

              <ThemedText className="text-[20px] font-[Figtree-Bold] text-[#222222] mb-4">Price details</ThemedText>
              <View className="flex-row justify-between mb-2">
                <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222]">${property.price} x 5 nights</ThemedText>
                <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222]">${property.price * 5}</ThemedText>
              </View>
              <View className="flex-row justify-between mb-4 pb-4 border-b border-[#EBEBEB]">
                <ThemedText className="text-[16px] font-[Figtree-Regular] underline text-[#222222]">Airbnb service fee</ThemedText>
                <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222]">$45</ThemedText>
              </View>

              <View className="flex-row justify-between mb-8">
                <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222]">Total (USD)</ThemedText>
                <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222]">${property.price * 5 + 45}</ThemedText>
              </View>

              <TouchableOpacity 
                className="bg-[#FF385C] py-4 rounded-xl items-center"
                onPress={async () => {
                  try {
                    // Use real Booking API format: ISO strings
                    const checkInDate = "2025-08-01T14:00:00Z";
                    const checkOutDate = "2025-08-07T11:00:00Z";
                    
                    const success = await addReservation(property, checkInDate, checkOutDate, 1);
                    if (success) {
                      setBookingModalVisible(false);
                      router.push('/(tabs)/trips');
                    }
                  } catch (error) {
                    console.error("Booking failed", error);
                  }
                }}
              >
                <ThemedText className="text-white font-[Figtree-Bold] text-[16px]">Confirm and pay</ThemedText>
              </TouchableOpacity>
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 1. Image Grid Modal */}
      <Modal visible={imageGridVisible} animationType="slide">
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-5 py-4 flex-row items-center justify-between border-b border-[#F0F0F0]">
            <TouchableOpacity onPress={() => setImageGridVisible(false)}>
              <ChevronLeft size={24} color="#222222" />
            </TouchableOpacity>
            <ThemedText className="text-[16px] font-[Figtree-Bold]">All images</ThemedText>
            <View className="w-6" />
          </View>
          <ScrollView className="p-2">
            <View className="flex-row flex-wrap">
              {property.images.map((img: string, idx: number) => (
                <TouchableOpacity 
                  key={idx} 
                  style={{ width: '50%', aspectRatio: 1, padding: 2 }}
                  onPress={() => setSelectedViewerImage(img)}
                >
                  <Image source={{ uri: img }} style={{ flex: 1, borderRadius: 8 }} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 2. Swipable Image Viewer */}
      <Modal visible={!!selectedViewerImage} transparent animationType="fade">
        <View className="flex-1 bg-black justify-center">
          <SafeAreaView className="absolute top-0 left-0 right-0 z-20">
             <TouchableOpacity onPress={() => setSelectedViewerImage(null)} className="p-5">
                <X size={28} color="#FFFFFF" />
             </TouchableOpacity>
          </SafeAreaView>
          
          <FlatList
            data={property.images}
            horizontal
            pagingEnabled
            initialScrollIndex={property.images.indexOf(selectedViewerImage || '')}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, justifyContent: 'center' }}>
                <Image 
                  source={{ uri: item }} 
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT / 1.5 }} 
                  contentFit="contain" 
                />
              </View>
            )}
          />
        </View>
      </Modal>

      {/* 3. Description Modal */}
      <Modal visible={descModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[28px] h-[80%] p-6">
            <TouchableOpacity onPress={() => setDescModalVisible(false)} className="mb-6">
              <X size={24} color="#222222" />
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
               <ThemedText className="text-[24px] font-[Figtree-Bold] text-[#222222] mb-4">About this space</ThemedText>
               <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222] leading-7">{property.description}</ThemedText>
               <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. Full Reviews Modal */}
      <Modal visible={reviewsModalVisible} animationType="slide">
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-[#F0F0F0] flex-row items-center gap-4">
             <TouchableOpacity onPress={() => setReviewsModalVisible(false)}>
                <X size={24} color="#222222" />
             </TouchableOpacity>
             <View className="flex-1 bg-[#F7F7F7] flex-row items-center px-4 py-2 rounded-full">
                <Search size={18} color="#717171" />
                <TextInput 
                  placeholder="Search reviews" 
                  className="flex-1 ml-2 font-[Figtree-Regular] text-[14px]"
                  value={searchReview}
                  onChangeText={setSearchReview}
                />
             </View>
          </View>
          
          <ScrollView className="p-6">
             <View className="flex-row items-center gap-2 mb-6">
                <Star size={24} color="#222222" fill="#222222" />
                <ThemedText className="text-[32px] font-[Figtree-Bold] text-[#222222]">{property.rating}</ThemedText>
                <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#717171] mt-3">· {property.reviewsCount} reviews</ThemedText>
             </View>

             {avgScores && (
               <View className="mb-8">
                  <ScoreBar label="Cleanliness" score={avgScores.cleanliness} />
                  <ScoreBar label="Accuracy" score={avgScores.accuracy} />
                  <ScoreBar label="Communication" score={avgScores.communication} />
                  <ScoreBar label="Location" score={avgScores.location} />
                  <ScoreBar label="Check-in" score={avgScores.checkin} />
                  <ScoreBar label="Value" score={avgScores.value} />
               </View>
             )}

             <View className="gap-8">
                {filteredReviews.length > 0 ? filteredReviews.map((review: Review) => (
                   <View key={review.id} className="border-b border-[#F0F0F0] pb-8">
                      <View className="flex-row items-center gap-4 mb-4">
                         <Image source={{ uri: review.userImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' }} className="w-12 h-12 rounded-full" />
                         <View>
                            <ThemedText className="text-[16px] font-[Figtree-Bold] text-[#222222]">{review.user}</ThemedText>
                            <ThemedText className="text-[13px] font-[Figtree-Regular] text-[#717171]">{review.date}</ThemedText>
                         </View>
                      </View>
                      <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#484848] leading-6">{review.comment}</ThemedText>
                   </View>
                )) : (
                  <View className="items-center py-20">
                     <ThemedText className="text-[18px] font-[Figtree-Bold] text-[#222222]">No reviews found</ThemedText>
                     <ThemedText className="text-[14px] font-[Figtree-Regular] text-[#717171] mt-1 text-center">We couldn't find any reviews matching "{searchReview}"</ThemedText>
                  </View>
                )}
             </View>
             <View className="h-20" />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 5. Report Listing Modal (Flow) */}
      <Modal visible={reportModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[28px] p-6 h-[60%]">
             <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => { if(reportStep > 1) setReportStep(1); else setReportModalVisible(false); }}>
                   {reportStep > 1 ? <ChevronLeft size={24} /> : <X size={24} />}
                </TouchableOpacity>
                <ThemedText className="text-[16px] font-[Figtree-Bold]">Report this listing</ThemedText>
                <View className="w-6" />
             </View>

             {reportStep === 1 ? (
               <View>
                  <ThemedText className="text-[20px] font-[Figtree-Bold] text-[#222222] mb-4">Why are you reporting this listing?</ThemedText>
                  <View className="gap-1">
                     {['It\'s inaccurate or incorrect', 'It\'s not a real place to stay', 'It\'s offensive', 'Something else'].map((reason: string) => (
                        <TouchableOpacity key={reason} onPress={() => setReportStep(2)} className="py-4 border-b border-[#F0F0F0] flex-row justify-between items-center">
                           <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#222222]">{reason}</ThemedText>
                           <ChevronRight size={18} color="#717171" />
                        </TouchableOpacity>
                     ))}
                  </View>
               </View>
             ) : (
               <View className="items-center py-10">
                  <View className="bg-green-100 p-4 rounded-full mb-6">
                     <Check size={40} color="#008A05" />
                  </View>
                  <ThemedText className="text-[22px] font-[Figtree-Bold] text-[#222222] text-center">Thanks for letting us know</ThemedText>
                  <ThemedText className="text-[16px] font-[Figtree-Regular] text-[#717171] text-center mt-2">Your feedback helps us keep the Airbnb community safe.</ThemedText>
                  <TouchableOpacity onPress={() => setReportModalVisible(false)} className="mt-8 bg-[#222222] px-8 py-3 rounded-xl">
                     <ThemedText className="text-white font-[Figtree-Bold]">Done</ThemedText>
                  </TouchableOpacity>
               </View>
             )}
          </View>
        </View>
      </Modal>

    </View>
  );
}
