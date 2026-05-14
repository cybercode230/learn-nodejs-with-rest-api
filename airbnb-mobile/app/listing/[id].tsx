import React from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Share, Heart, Star, Map, User, X } from '@/components/icons';
import { ThemedText } from '@/components/themed-text';
import { ms } from 'react-native-size-matters';
import { useListings, Listing } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import { useReservations } from '@/hooks/use-reservations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}, ${d.getFullYear()}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getListingById } = useListings();
  const { user } = useAuth();
  const { addReservation } = useReservations();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [bookingModalVisible, setBookingModalVisible] = React.useState(false);
  const [successModalVisible, setSuccessModalVisible] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  // Step: 'dates' | 'guests' | 'confirm'
  const [bookingStep, setBookingStep] = React.useState<'dates' | 'guests' | 'confirm'>('dates');

  // Calendar state
  const [calMonth, setCalMonth] = React.useState(today.getMonth());
  const [calYear, setCalYear] = React.useState(today.getFullYear());
  const [checkIn, setCheckIn] = React.useState<Date | null>(null);
  const [checkOut, setCheckOut] = React.useState<Date | null>(null);

  // Guests
  const [adults, setAdults] = React.useState(1);
  const [children, setChildren] = React.useState(0);

  const totalGuests = adults + children;
  const nights = checkIn && checkOut
    ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const property = getListingById(id) as Listing;
  const propertyData = property || {
    id: id,
    name: 'Modern Apartment with Kigali View',
    location: 'Kigali City Center, Rwanda',
    price: 50,
    rating: 4.8,
    reviewsCount: 124,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    description: 'Experience the heart of Kigali from this stunning modern apartment. Featuring floor-to-ceiling windows with panoramic city views, high-end finishes, and a central location that puts you within walking distance of the best cafes, restaurants, and cultural attractions.',
    host: { name: 'Jean Paul', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', yearsHosting: 5, isSuperhost: true },
    details: { guests: 6, bedrooms: 1, beds: 1, baths: 1 }
  };

  const handleDayPress = (day: number) => {
    const selected = new Date(calYear, calMonth, day);
    if (selected < today) return; // Block past dates
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(selected);
      setCheckOut(null);
    } else {
      if (selected <= checkIn) {
        setCheckIn(selected);
      } else {
        setCheckOut(selected);
      }
    }
  };

  const getDayState = (day: number): 'past' | 'today' | 'checkIn' | 'checkOut' | 'inRange' | 'future' => {
    const d = new Date(calYear, calMonth, day);
    if (d < today) return 'past';
    if (d.getTime() === today.getTime()) return 'today';
    if (checkIn && d.getTime() === checkIn.getTime()) return 'checkIn';
    if (checkOut && d.getTime() === checkOut.getTime()) return 'checkOut';
    if (checkIn && checkOut && d > checkIn && d < checkOut) return 'inRange';
    return 'future';
  };

  const handleReserve = () => {
    if (!user) { router.push('/auth/login'); return; }
    setBookingStep('dates');
    setBookingModalVisible(true);
  };

  const confirmBooking = async () => {
    if (!checkIn || !checkOut) return;
    setIsBooking(true);
    setTimeout(async () => {
      const success = await addReservation(
        propertyData as any,
        formatDate(checkIn),
        formatDate(checkOut),
        totalGuests
      );
      setIsBooking(false);
      setBookingModalVisible(false);
      if (success) setSuccessModalVisible(true);
    }, 1500);
  };

  const bookingBarLabel = checkIn && checkOut
    ? `${formatDate(checkIn)} → ${formatDate(checkOut)}`
    : 'Select dates';


  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          <Image
            source={{ uri: propertyData.image }}
            style={{ width: SCREEN_WIDTH, height: ms(300) }}
            contentFit="cover"
          />

          <SafeAreaView className="absolute top-5 left-0 right-0">
            <View className="flex-row justify-between px-5 py-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-white/90 p-2 rounded-full shadow-sm"
              >
                <ChevronLeft size={ms(24)} color="#000000" />
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TouchableOpacity className="bg-white/90 p-2 rounded-full shadow-sm">
                  <Share size={ms(18)} color="#000000" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-white/90 p-2 rounded-full shadow-sm">
                  <Heart size={ms(18)} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View className="px-6 py-6">
          <ThemedText className="text-[28px] font-figtree-bold text-[#222222] leading-9">
            {propertyData.name}
          </ThemedText>

          <View className="flex-row items-center mt-2 gap-1">
            <Star size={ms(14)} color="#000000" fill="#000000" />
            <ThemedText className="text-[14px] font-figtree-semibold text-[#222222]">
              {propertyData.rating} · {propertyData.reviewsCount} reviews
            </ThemedText>
            <ThemedText className="text-[14px] font-figtree text-[#717171]">
              · {propertyData.location}
            </ThemedText>
          </View>

          <View className="h-[1px] bg-[#F0F0F0] my-6" />

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <ThemedText className="text-[18px] font-figtree-semibold text-[#222222]">
                Entire rental unit hosted by {propertyData.host.name}
              </ThemedText>
              <ThemedText className="text-[14px] font-figtree text-[#717171] mt-1">
                {propertyData.details.guests} guests · {propertyData.details.bedrooms} bedroom · {propertyData.details.beds} bed · {propertyData.details.baths} bath
              </ThemedText>
            </View>
            <Image
              source={{ uri: propertyData.host.image }}
              className="w-12 h-12 rounded-full"
            />
          </View>

          <View className="h-[1px] bg-[#F0F0F0] my-6" />

          <View className="gap-6">
            <View className="flex-row items-center gap-4">
              <Map size={ms(24)} color="#222222" />
              <View className="flex-1">
                <ThemedText className="text-[16px] font-figtree-semibold text-[#222222]">Great location</ThemedText>
                <ThemedText className="text-[14px] font-figtree text-[#717171] mt-1">95% of recent guests gave the location a 5-star rating.</ThemedText>
              </View>
            </View>
            <View className="flex-row items-center gap-4">
              <User size={ms(24)} color="#222222" />
              <View className="flex-1">
                <ThemedText className="text-[16px] font-figtree-semibold text-[#222222]">Experienced host</ThemedText>
                <ThemedText className="text-[14px] font-figtree text-[#717171] mt-1">{propertyData.host.name} has been hosting for {propertyData.host.yearsHosting} years.</ThemedText>
              </View>
            </View>
          </View>

          <View className="h-[1px] bg-[#F0F0F0] my-6" />

          <ThemedText className="text-[16px] font-figtree text-[#222222] leading-6">
            {propertyData.description}
          </ThemedText>
        </View>

        <View className="h-32" />
      </ScrollView>

      {/* Booking Modal — Multi-step */}
      <Modal
        visible={bookingModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[28px]" style={{ maxHeight: '90%' }}>
            {/* Modal Header */}
            <View className="flex-row justify-between items-center px-6 pt-5 pb-4 border-b border-[#F0F0F0]">
              <TouchableOpacity onPress={() => {
                if (bookingStep === 'dates') setBookingModalVisible(false);
                else if (bookingStep === 'guests') setBookingStep('dates');
                else setBookingStep('guests');
              }}>
                <X size={ms(20)} color="#222222" />
              </TouchableOpacity>
              <ThemedText className="text-[16px] font-figtree-bold text-[#222222]">
                {bookingStep === 'dates' ? 'Select dates' : bookingStep === 'guests' ? 'Add guests' : 'Confirm your stay'}
              </ThemedText>
              <View className="w-5" />
            </View>

            {/* Step Indicators */}
            <View className="flex-row px-6 pt-3 gap-2">
              {(['dates','guests','confirm'] as const).map((step, i) => (
                <View key={step} className={`h-1 flex-1 rounded-full ${bookingStep === step || (i < (['dates','guests','confirm'] as const).indexOf(bookingStep)) ? 'bg-[#FF385C]' : 'bg-[#EEEEEE]'}`} />
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="pb-4">
              {/* ── STEP 1: DATE PICKER ── */}
              {bookingStep === 'dates' && (
                <View className="px-5 pt-5 pb-2">
                  {/* Selected range summary */}
                  <View className="flex-row gap-3 mb-5">
                    <View className={`flex-1 p-3 rounded-xl border-2 ${checkIn ? 'border-[#FF385C] bg-[#FFF0F3]' : 'border-[#DDDDDD]'}`}>
                      <ThemedText className="text-[11px] font-figtree-bold text-[#717171] uppercase">Check-in</ThemedText>
                      <ThemedText className={`text-[14px] font-figtree-semibold mt-1 ${checkIn ? 'text-[#222222]' : 'text-[#AAAAAA]'}`}>
                        {checkIn ? formatDate(checkIn) : 'Add date'}
                      </ThemedText>
                    </View>
                    <View className={`flex-1 p-3 rounded-xl border-2 ${checkOut ? 'border-[#FF385C] bg-[#FFF0F3]' : 'border-[#DDDDDD]'}`}>
                      <ThemedText className="text-[11px] font-figtree-bold text-[#717171] uppercase">Check-out</ThemedText>
                      <ThemedText className={`text-[14px] font-figtree-semibold mt-1 ${checkOut ? 'text-[#222222]' : 'text-[#AAAAAA]'}`}>
                        {checkOut ? formatDate(checkOut) : 'Add date'}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Month navigation */}
                  <View className="flex-row justify-between items-center mb-3">
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => {
                        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                        else setCalMonth(m => m - 1);
                      }}
                    >
                      <ThemedText className="text-[20px] text-[#222222]">‹</ThemedText>
                    </TouchableOpacity>
                    <ThemedText className="text-[17px] font-figtree-bold text-[#222222]">
                      {MONTHS[calMonth]} {calYear}
                    </ThemedText>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => {
                        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                        else setCalMonth(m => m + 1);
                      }}
                    >
                      <ThemedText className="text-[20px] text-[#222222]">›</ThemedText>
                    </TouchableOpacity>
                  </View>

                  {/* Day headers */}
                  <View className="flex-row mb-1">
                    {DAYS.map(d => (
                      <ThemedText key={d} className="flex-1 text-center text-[12px] font-figtree-bold text-[#717171]">{d}</ThemedText>
                    ))}
                  </View>

                  {/* Calendar grid */}
                  <View className="flex-row flex-wrap">
                    {/* Empty offset cells */}
                    {Array.from({ length: firstDayOfMonth(calYear, calMonth) }).map((_, i) => (
                      <View key={`empty-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />
                    ))}
                    {/* Day cells */}
                    {Array.from({ length: daysInMonth(calYear, calMonth) }).map((_, i) => {
                      const day = i + 1;
                      const state = getDayState(day);
                      const isSelected = state === 'checkIn' || state === 'checkOut';
                      const isPast = state === 'past';
                      const isRange = state === 'inRange';
                      const isToday = state === 'today';

                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => handleDayPress(day)}
                          disabled={isPast}
                          style={{ width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' }}
                        >
                          <View className={`w-9 h-9 rounded-full items-center justify-center
                            ${isSelected ? 'bg-[#222222]' : ''}
                            ${isRange ? 'bg-[#F5F5F5]' : ''}
                          `}>
                            <ThemedText className={`text-[14px] font-figtree-medium
                              ${isPast ? 'text-[#CCCCCC]' : ''}
                              ${isSelected ? 'text-white font-figtree-bold' : ''}
                              ${isToday && !isSelected ? 'text-[#FF385C] font-figtree-bold' : ''}
                              ${!isPast && !isSelected && !isToday ? 'text-[#222222]' : ''}
                            `}>
                              {day}
                            </ThemedText>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <ThemedText className="text-[12px] font-figtree text-[#717171] text-center mt-3">
                    Tap a date to set check-in, tap again to set check-out
                  </ThemedText>
                </View>
              )}

              {/* ── STEP 2: GUEST PICKER ── */}
              {bookingStep === 'guests' && (
                <View className="px-6 pt-5 pb-2 gap-4">
                  {[
                    { label: 'Adults', sub: 'Ages 13+', value: adults, min: 1, max: propertyData.details.guests, set: setAdults },
                    { label: 'Children', sub: 'Ages 2–12', value: children, min: 0, max: Math.max(0, propertyData.details.guests - adults), set: setChildren },
                  ].map(({ label, sub, value, min, max, set }) => (
                    <View key={label} className="flex-row justify-between items-center py-4 border-b border-[#F0F0F0]">
                      <View>
                        <ThemedText className="text-[16px] font-figtree-semibold text-[#222222]">{label}</ThemedText>
                        <ThemedText className="text-[14px] font-figtree text-[#717171]">{sub}</ThemedText>
                      </View>
                      <View className="flex-row items-center gap-4">
                        <TouchableOpacity
                          onPress={() => set(v => Math.max(min, v - 1))}
                          className={`w-9 h-9 rounded-full border items-center justify-center ${value <= min ? 'border-[#DDDDDD]' : 'border-[#222222]'}`}
                        >
                          <ThemedText className={`text-[18px] ${value <= min ? 'text-[#DDDDDD]' : 'text-[#222222]'}`}>−</ThemedText>
                        </TouchableOpacity>
                        <ThemedText className="text-[16px] font-figtree-semibold text-[#222222] w-5 text-center">{value}</ThemedText>
                        <TouchableOpacity
                          onPress={() => set(v => Math.min(max, v + 1))}
                          className={`w-9 h-9 rounded-full border items-center justify-center ${value >= max ? 'border-[#DDDDDD]' : 'border-[#222222]'}`}
                        >
                          <ThemedText className={`text-[18px] ${value >= max ? 'text-[#DDDDDD]' : 'text-[#222222]'}`}>+</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <ThemedText className="text-[12px] font-figtree text-[#717171] mt-2">
                    This place allows up to {propertyData.details.guests} guests.
                  </ThemedText>
                </View>
              )}

              {/* ── STEP 3: CONFIRM ── */}
              {bookingStep === 'confirm' && (
                <View className="px-6 pt-5 pb-2">
                  <View className="flex-row gap-4 mb-5">
                    <Image source={{ uri: propertyData.image }} className="w-20 h-20 rounded-xl" />
                    <View className="flex-1 justify-center">
                      <ThemedText className="text-[15px] font-figtree-semibold text-[#222222]" numberOfLines={2}>{propertyData.name}</ThemedText>
                      <ThemedText className="text-[13px] font-figtree text-[#717171] mt-1">{propertyData.location}</ThemedText>
                    </View>
                  </View>

                  <View className="bg-[#F7F7F7] rounded-xl p-4 gap-3 mb-5">
                    <View className="flex-row justify-between">
                      <ThemedText className="text-[14px] font-figtree-semibold text-[#222222]">Check-in</ThemedText>
                      <ThemedText className="text-[14px] font-figtree text-[#717171]">{checkIn ? formatDate(checkIn) : '—'}</ThemedText>
                    </View>
                    <View className="flex-row justify-between">
                      <ThemedText className="text-[14px] font-figtree-semibold text-[#222222]">Check-out</ThemedText>
                      <ThemedText className="text-[14px] font-figtree text-[#717171]">{checkOut ? formatDate(checkOut) : '—'}</ThemedText>
                    </View>
                    <View className="flex-row justify-between">
                      <ThemedText className="text-[14px] font-figtree-semibold text-[#222222]">Guests</ThemedText>
                      <ThemedText className="text-[14px] font-figtree text-[#717171]">{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</ThemedText>
                    </View>
                  </View>

                  <View className="gap-3">
                    <ThemedText className="text-[18px] font-figtree-bold text-[#222222] mb-1">Price details</ThemedText>
                    <View className="flex-row justify-between">
                      <ThemedText className="text-[15px] font-figtree text-[#222222]">${propertyData.price} × {nights} night{nights !== 1 ? 's' : ''}</ThemedText>
                      <ThemedText className="text-[15px] font-figtree text-[#222222]">${propertyData.price * nights}</ThemedText>
                    </View>
                    <View className="flex-row justify-between pt-3 border-t border-[#F0F0F0]">
                      <ThemedText className="text-[16px] font-figtree-bold text-[#222222]">Total (USD)</ThemedText>
                      <ThemedText className="text-[16px] font-figtree-bold text-[#222222]">${propertyData.price * nights}</ThemedText>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Footer Button */}
            <View className="px-6 pb-10 pt-3 border-t border-[#F0F0F0]">
              {bookingStep === 'dates' && (
                <TouchableOpacity
                  className={`py-4 rounded-xl items-center ${checkIn && checkOut ? 'bg-[#FF385C]' : 'bg-[#DDDDDD]'}`}
                  disabled={!checkIn || !checkOut}
                  onPress={() => setBookingStep('guests')}
                >
                  <ThemedText className="text-white font-figtree-bold text-[16px]">
                    {checkIn && checkOut ? `${nights} night${nights !== 1 ? 's' : ''} selected — Next` : 'Select check-in & check-out'}
                  </ThemedText>
                </TouchableOpacity>
              )}
              {bookingStep === 'guests' && (
                <TouchableOpacity
                  className="py-4 rounded-xl items-center bg-[#FF385C]"
                  onPress={() => setBookingStep('confirm')}
                >
                  <ThemedText className="text-white font-figtree-bold text-[16px]">
                    {totalGuests} guest{totalGuests !== 1 ? 's' : ''} — Continue
                  </ThemedText>
                </TouchableOpacity>
              )}
              {bookingStep === 'confirm' && (
                <TouchableOpacity
                  className={`py-4 rounded-xl items-center ${isBooking ? 'bg-[#FF385C]/70' : 'bg-[#FF385C]'}`}
                  onPress={confirmBooking}
                  disabled={isBooking}
                >
                  <ThemedText className="text-white font-figtree-bold text-[16px]">
                    {isBooking ? 'Confirming...' : 'Confirm and pay'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
           <View className="bg-white rounded-[24px] p-8 w-full items-center">
              <View className="w-20 h-20 rounded-full bg-[#FF385C] items-center justify-center mb-6">
                 <Star size={ms(40)} color="#FFFFFF" fill="#FFFFFF" />
              </View>
              <ThemedText className="text-[24px] font-figtree-bold text-[#222222] text-center">Reservation successful!</ThemedText>
              <ThemedText className="text-[16px] font-figtree text-[#717171] text-center mt-2 mb-8">Your trip to {propertyData.location} is booked.</ThemedText>
              <TouchableOpacity 
                className="bg-[#222222] py-4 rounded-xl w-full items-center"
                onPress={() => {
                  setSuccessModalVisible(false);
                  router.push('/(tabs)/trips');
                }}
              >
                <ThemedText className="text-white font-figtree-bold text-[16px]">See my trips</ThemedText>
              </TouchableOpacity>
           </View>
        </View>
      </Modal>

      {!bookingModalVisible && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-6 pt-4 pb-10 flex-row items-center justify-between shadow-2xl">
          <View>
            <View className="flex-row items-center">
              <ThemedText className="text-[18px] font-figtree-bold text-[#222222]">${propertyData.price}</ThemedText>
              <ThemedText className="text-[16px] font-figtree text-[#222222]"> night</ThemedText>
            </View>
            <TouchableOpacity onPress={handleReserve}>
              <ThemedText className={`text-[12px] font-figtree-semibold mt-0.5 underline ${checkIn && checkOut ? 'text-[#FF385C]' : 'text-[#717171]'}`}>
                {bookingBarLabel}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="bg-[#FF385C] px-8 py-4 rounded-xl" onPress={handleReserve}>
            <ThemedText className="text-white font-figtree-bold text-[16px]">
              {checkIn && checkOut ? `Reserve · ${nights}n` : 'Reserve'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

