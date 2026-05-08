import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { 
  Star, Share, Heart, Wifi, Car, Home, 
  Bath,Check, ChevronRight, Info,
  User, MessageSquare,Shield, Award, Minus, Plus, Laptop, Tv, Tent, Utensils,X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, ImageGalleryModal } from '../../../shared/components';
import { useAuth } from '../../../contexts/AuthContext';
import ListingCard from '../components/ListingCard';
import { useListingDetails } from '../hooks/useListingDetails';

const BookingModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  listing: any; 
  dates: { checkIn: Date | null; checkOut: Date | null };
  guests: any;
  pricePerNight: number;
  total: number;
}> = ({ isOpen, onClose, listing, dates, guests, pricePerNight, total }) => {
  const [step, setStep] = useState<'summary' | 'confirm' | 'message' | 'payment' | 'done'>('summary');
  const [message, setMessage] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  const [isBooking, setIsBooking] = useState(false);

  if (!isOpen) return null;

  const handleBooking = async () => {
    setIsBooking(true);
    // Mock booking creation
    try {
      await api.post(ENDPOINTS.BOOKINGS.BASE, {
        listingId: listing.id,
        startDate: dates.checkIn,
        endDate: dates.checkOut,
        totalGuests: guests.adults + guests.children,
        totalPrice: total,
        message: message
      });
      // Store payment info mock
      localStorage.setItem('last_booking_payment', JSON.stringify({ listingId: listing.id, ...cardData }));
      setStep('done');
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const steps = ['summary', 'confirm', 'message', 'payment'];
  const currentStepIdx = steps.indexOf(step);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {steps.map((s, i) => (
                <div key={s} className={`h-1 rounded-full transition-all ${i <= currentStepIdx ? 'w-6 bg-airbnb' : 'w-2 bg-gray-100'}`} />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400 ml-2">Step {currentStepIdx + 1} of 4</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'summary' && (
              <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex gap-6">
                  <img src={listing.photos?.[0]?.url} className="w-32 h-32 rounded-2xl object-cover shadow-md" alt="" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{listing.location}</p>
                    <div className="flex items-center gap-1 mt-4 text-sm font-bold">
                      <Star size={14} className="fill-gray-900" /> 4.95 • {listing.guests} guests
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Check-in</p>
                    <p className="font-bold">{dayjs(dates.checkIn).format('MMM D, YYYY')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Checkout</p>
                    <p className="font-bold">{dayjs(dates.checkOut).format('MMM D, YYYY')}</p>
                  </div>
                </div>
                <Button className="w-full py-4 rounded-2xl" onClick={() => setStep('confirm')}>Next Step</Button>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900">Confirm details</h2>
                <div className="space-y-4">
                  <div className="flex justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-bold">Total Guests</p>
                      <p className="text-sm text-gray-500">{guests.adults + guests.children} guests</p>
                    </div>
                    <button className="text-sm font-bold underline" onClick={onClose}>Edit</button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="font-bold">Cancellation policy</p>
                    <p className="text-sm text-gray-500 mt-1">Free cancellation for 48 hours. After that, cancel before check-in for a partial refund.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 py-4" onClick={() => setStep('summary')}>Back</Button>
                  <Button className="flex-2 py-4" onClick={() => setStep('message')}>Continue</Button>
                </div>
              </motion.div>
            )}

            {step === 'message' && (
              <motion.div key="message" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <img src={listing.host?.avatar} className="w-12 h-12 rounded-full" alt="" />
                  <div>
                    <h3 className="font-bold">Message {listing.host?.name}</h3>
                    <p className="text-xs text-gray-500">Ask a question or say hello</p>
                  </div>
                </div>
                <textarea 
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-sm focus:outline-none focus:ring-1 focus:ring-airbnb min-h-[150px] resize-none"
                  placeholder="Hi! I'm visiting for a conference and love your place..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 py-4" onClick={() => setStep('confirm')}>Back</Button>
                  <Button className="flex-2 py-4" onClick={() => setStep('payment')}>Continue to Payment</Button>
                </div>
                <button className="w-full text-center text-sm font-bold text-gray-400 hover:text-gray-600 underline" onClick={() => setStep('payment')}>Skip this step</button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-black text-gray-900">Payment</h2>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-gray-100 rounded border border-gray-200" />
                    <div className="w-8 h-5 bg-gray-100 rounded border border-gray-200" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400">Card Number</label>
                      <input 
                        type="text" placeholder="0000 0000 0000 0000" 
                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-airbnb outline-none font-mono text-sm"
                        value={cardData.number}
                        onChange={e => setCardData({...cardData, number: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-airbnb outline-none font-mono text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400">CVV</label>
                        <input type="password" placeholder="***" className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-airbnb outline-none font-mono text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center border-t border-gray-100 mt-6">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-black text-2xl text-airbnb">${total}</span>
                  </div>
                </div>
                <Button className="w-full py-5 rounded-2xl text-lg shadow-xl shadow-airbnb/20" onClick={handleBooking} isLoading={isBooking}>
                  Confirm & Pay
                </Button>
                <button className="w-full text-center text-sm font-bold text-gray-400 hover:text-gray-600" onClick={() => setStep('message')}>Back</button>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10 space-y-6">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/30">
                  <Check size={48} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Booking confirmed!</h2>
                  <p className="text-gray-500 mt-2">Your stay at {listing.title} is reserved.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl text-left space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Confirmation Code</p>
                  <p className="font-mono text-xl font-black tracking-widest text-gray-900">HM-{(Math.random() * 1000000).toFixed(0)}</p>
                </div>
                <Button className="w-full py-4 rounded-2xl" onClick={onClose}>Done</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ListingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // -- HOOK DATA --
  const { listing, reviews, nearbyListings, loading, error, setReviews } = useListingDetails(id);

  // -- UI STATE --
  const [showGallery, setShowGallery] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // -- BOOKING STATE --
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(new Date());
  const [checkOut, setCheckOut] = useState<Date | null>(new Date(Date.now() + 86400000 * 5)); // +5 days
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });

  // -- REVIEWS FORM STATE --
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // -- REVIEWS DATA --
  const reviewStats = {
    overall: 4.67,
    count: reviews.length || 3,
    categories: [
      { label: "Cleanliness", rating: 4.3 },
      { label: "Accuracy", rating: 4.7 },
      { label: "Check-in", rating: 4.7 },
      { label: "Communication", rating: 4.7 },
      { label: "Location", rating: 4.7 },
      { label: "Value", rating: 4.3 },
    ]
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/listings/${id}`);
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/listings/${id}/reviews`, newReview);
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalGuests = guests.adults + guests.children;
  const pricePerNight = listing?.pricePerNight || 950;
  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)) : 0;

  // -- RENDER HELPERS --
  const getAmenityIcon = (a: string) => {
    const map: any = { 'WiFi': Wifi, 'Kitchen': Utensils, 'Workspace': Laptop, 'TV': Tv, 'Parking': Car, 'Pets': Tent, 'Washer': Bath };
    const Icon = map[a] || Check;
    return <Icon size={24} className="text-gray-700" />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-airbnb rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Stay...</p>
      </div>
    </div>
  );

  if (error || !listing) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Info size={40} className="text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Listing not found'}</h2>
      <Button onClick={() => navigate('/')} className="mt-4">Back to home</Button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-airbnb/20">
      <div className="container mx-auto px-4 md:px-10 lg:px-20 py-8 max-w-7xl">
        
        {/* SECTION: TITLE & HEADER */}
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900 mb-2">{listing.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Star size={14} className="fill-gray-900" />
              <span>{reviewStats.overall} •</span>
              <span className="underline cursor-pointer">{reviewStats.count} reviews</span>
              <span>•</span>
              <span className="underline cursor-pointer">{listing.location}</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" leftIcon={<Share size={16} />}>Share</Button>
              <Button variant="ghost" size="sm" leftIcon={<Heart size={16} />}>Save</Button>
            </div>
          </div>
        </div>

        {/* SECTION: IMAGE GRID */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden mb-8 relative group">
          <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => { setGalleryStartIndex(0); setShowGallery(true); }}>
            <img src={listing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'} className="w-full h-full object-cover hover:brightness-95 transition-all" alt="" />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="relative cursor-pointer hidden md:block" onClick={() => { setGalleryStartIndex(i); setShowGallery(true); }}>
              <img src={listing.photos?.[i]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'} className="w-full h-full object-cover hover:brightness-95 transition-all" alt="" />
            </div>
          ))}
          <button onClick={() => setShowGallery(true)} className="absolute bottom-6 right-6 bg-white border border-gray-900 px-4 py-1.5 rounded-lg font-bold text-sm shadow-md hover:bg-gray-50 flex items-center gap-2">
            Show all photos
          </button>
        </div>

        {/* SECTION: MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8">
            {/* 1. Host Basic Info */}
            <div className="flex justify-between items-start pb-6 border-b border-gray-100">
              <div>
                <h2 className="text-[22px] font-bold">Entire rental unit in {listing.location.split(',')[0]}</h2>
                <p className="text-gray-600 font-medium">{listing.guests} guests • 1 bedroom • 1 bed • 1 bath</p>
                <div className="flex items-center gap-2 mt-2 text-sm font-bold">
                   <Star size={14} className="fill-gray-900" />
                   <span>{reviewStats.overall} •</span>
                   <span className="underline">{reviewStats.count} reviews</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden shadow-inner">
                  {listing.host?.avatar ? <img src={listing.host.avatar} className="w-full h-full object-cover" alt="" /> : <User size={32} className="m-auto mt-2 text-gray-400" />}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-airbnb rounded-full p-1 border-2 border-white">
                  <Shield size={10} className="text-white" />
                </div>
              </div>
            </div>

            {/* 2. Listing Highlights */}
            <div className="py-8 border-b border-gray-100 space-y-6">
               <div className="flex gap-6">
                 <Award size={24} className="mt-1" />
                 <div>
                   <h3 className="font-bold">Perfect ratings for long stays</h3>
                   <p className="text-gray-500 text-sm">100% of long-term guests who stayed here in the past year rated it 5 stars overall.</p>
                 </div>
               </div>
               <div className="flex gap-6">
                 <Utensils size={24} className="mt-1" />
                 <div>
                   <h3 className="font-bold">Outdoor entertainment</h3>
                   <p className="text-gray-500 text-sm">The alfresco dining and outdoor seating are great for summer trips.</p>
                 </div>
               </div>
               <div className="flex gap-6">
                 <Check size={24} className="mt-1" />
                 <div>
                   <h3 className="font-bold">Self check-in</h3>
                   <p className="text-gray-500 text-sm">You can check in with the building staff.</p>
                 </div>
               </div>
            </div>

            {/* 3. Detailed Description */}
            <div className="py-8 border-b border-gray-100">
              <h2 className="text-xl font-bold mb-4">{listing.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to your bright, spacious private apartment in Kacyiru, the vibrant heart of Kigali.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You're a 5-minute walk from the Niyo Art Center, Public Library, American Embassy, top restaurants, and bars.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Relax in your airy space featuring a king-size bed, 50" Smart TV, and a well-stocked kitchen. Enjoy your morning coffee or evening drink on the cool balcony with a stunning views.
              </p>
              <button className="mt-4 font-bold underline flex items-center gap-1">Show more <ChevronRight size={16} /></button>
            </div>

            {/* 4. Where you'll sleep */}
            <div className="py-8 border-b border-gray-100">
               <h2 className="text-[22px] font-bold mb-6">Where you'll sleep</h2>
               <div className="w-52 p-6 border border-gray-200 rounded-xl">
                  <Home className="mb-4" size={24} />
                  <h3 className="font-bold mb-1">Bedroom</h3>
                  <p className="text-sm text-gray-600">1 king bed, 1 hammock</p>
               </div>
            </div>

            {/* 5. Amenities */}
            <div className="py-8 border-b border-gray-100">
              <h2 className="text-[22px] font-bold mb-6">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                {listing.amenities?.slice(0, 8).map(a => (
                  <div key={a} className="flex items-center gap-4 text-gray-700">
                    {getAmenityIcon(a)}
                    <span className="text-base font-normal">{a}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-8 border-gray-900 font-bold px-6 py-2.5">Show all 51 amenities</Button>
            </div>
          </div>

          {/* SECTION: STICKY BOOKING CARD */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28">
              <Card className="p-6 shadow-xl border-gray-200 rounded-xl" hoverable={false}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-2xl font-bold">${pricePerNight}</span>
                    <span className="text-gray-500 text-base ml-1">night</span>
                  </div>
                  <div className="text-[11px] font-bold text-airbnb">Act fast, only 7 hours left!</div>
                </div>

                {/* DATE & GUEST PICKERS */}
                <div className="border border-gray-400 rounded-xl overflow-hidden mb-4 relative">
                  <div className="grid grid-cols-2 divide-x divide-gray-400 border-b border-gray-400 relative">
                    <button onClick={() => setShowCalendar(!showCalendar)} className="p-3 text-left hover:bg-gray-50">
                      <p className="text-[9px] font-black uppercase">Check-in</p>
                      <p className="text-sm">{checkIn ? dayjs(checkIn).format('MM/DD/YYYY') : 'Add date'}</p>
                    </button>
                    <button onClick={() => setShowCalendar(!showCalendar)} className="p-3 text-left hover:bg-gray-50">
                      <p className="text-[9px] font-black uppercase">Checkout</p>
                      <p className="text-sm">{checkOut ? dayjs(checkOut).format('MM/DD/YYYY') : 'Add date'}</p>
                    </button>

                    {/* CALENDAR DROPDOWN */}
                    <AnimatePresence>
                      {showCalendar && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-[-1px] mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-50 min-w-[320px]"
                        >
                          <div className="flex justify-between items-center mb-6">
                            <div>
                               <h4 className="font-bold text-lg">Select dates</h4>
                               <p className="text-xs text-gray-500">Add your travel dates for exact pricing</p>
                            </div>
                            <button onClick={() => setShowCalendar(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={18}/></button>
                          </div>

                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Check-in</label>
                                 <input 
                                   type="date" 
                                   className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-airbnb focus:outline-none"
                                   value={checkIn ? dayjs(checkIn).format('YYYY-MM-DD') : ''}
                                   onChange={(e) => {
                                     const d = dayjs(e.target.value);
                                     if (d.isValid()) setCheckIn(d.toDate());
                                   }}
                                 />
                               </div>
                               <div>
                                 <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Checkout</label>
                                 <input 
                                   type="date" 
                                   className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-airbnb focus:outline-none"
                                   value={checkOut ? dayjs(checkOut).format('YYYY-MM-DD') : ''}
                                   onChange={(e) => {
                                     const d = dayjs(e.target.value);
                                     if (d.isValid()) setCheckOut(d.toDate());
                                   }}
                                 />
                               </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                               <button onClick={() => { setCheckIn(null); setCheckOut(null); }} className="text-sm font-bold underline">Clear dates</button>
                               <Button size="sm" onClick={() => setShowCalendar(false)}>Apply</Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button 
                    onClick={() => setShowGuestPicker(!showGuestPicker)}
                    className="w-full p-3 text-left hover:bg-gray-50 relative"
                  >
                    <p className="text-[9px] font-black uppercase">Guests</p>
                    <p className="text-sm">{totalGuests} guest{totalGuests > 1 ? 's' : ''}{guests.infants > 0 ? `, ${guests.infants} infant` : ''}{guests.pets > 0 ? `, ${guests.pets} pet` : ''}</p>
                    <ChevronRight size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${showGuestPicker ? 'rotate-90' : ''}`} />
                  </button>

                  {/* GUEST PICKER DROPDOWN */}
                  <AnimatePresence>
                    {showGuestPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 space-y-4"
                      >
                         {[
                           { label: 'Adults', sub: 'Age 13+', key: 'adults', max: 2 },
                           { label: 'Children', sub: 'Ages 2–12', key: 'children', max: 2 },
                           { label: 'Infants', sub: 'Under 2', key: 'infants', max: 5 },
                           { label: 'Pets', sub: 'Bringing a service animal?', key: 'pets', max: 5 }
                         ].map(type => (
                           <div key={type.key} className="flex justify-between items-center">
                             <div>
                               <p className="font-bold text-sm">{type.label}</p>
                               <p className="text-xs text-gray-500 underline cursor-pointer">{type.sub}</p>
                             </div>
                             <div className="flex items-center gap-3">
                               <button 
                                 onClick={() => setGuests({...guests, [type.key]: Math.max(0, (guests as any)[type.key] - 1)})}
                                 className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-900 disabled:opacity-20"
                                 disabled={(guests as any)[type.key] === 0}
                               ><Minus size={14} /></button>
                               <span className="w-4 text-center text-sm font-medium">{(guests as any)[type.key]}</span>
                               <button 
                                 onClick={() => setGuests({...guests, [type.key]: (guests as any)[type.key] + 1})}
                                 className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-900"
                               ><Plus size={14} /></button>
                             </div>
                           </div>
                         ))}
                         <p className="text-[11px] text-gray-500 leading-tight pt-2">
                           This place has a maximum of 2 guests, not including infants. If you're bringing more than 2 pets, please let your host know.
                         </p>
                         <button onClick={() => setShowGuestPicker(false)} className="w-full text-right font-bold underline text-sm pt-2">Close</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button 
                  className="w-full py-3 text-base font-bold shadow-lg bg-airbnb"
                  onClick={() => {
                    if (!isAuthenticated) navigate(`/login?redirect=/listings/${id}`);
                    else setShowBookingModal(true);
                  }}
                >
                  Reserve
                </Button>
                <p className="text-center text-[13px] text-gray-500 mt-4">You won't be charged yet</p>

                {/* PRICE BREAKDOWN */}
                <div className="mt-6 space-y-3">
                   <div className="flex justify-between text-sm text-gray-700 font-medium">
                      <span className="underline">${pricePerNight} x {nights} nights</span>
                      <span>${pricePerNight * nights}</span>
                   </div>
                   <div className="flex justify-between text-sm text-gray-700 font-medium">
                      <span className="underline">Cleaning fee</span>
                      <span>$45</span>
                   </div>
                   <div className="flex justify-between text-sm text-gray-700 font-medium border-b border-gray-100 pb-4">
                      <span className="underline">Airbnb service fee</span>
                      <span>$82</span>
                   </div>
                   <div className="flex justify-between text-base font-bold pt-2">
                      <span>Total</span>
                      <span>${pricePerNight * nights + 127}</span>
                   </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* SECTION: REVIEWS DETAILED */}
        <div className="py-12 border-t border-gray-100 mt-16">
           <div className="flex flex-col md:flex-row md:items-center gap-2 text-[22px] font-bold mb-8">
              <div className="flex items-center gap-1">
                <Star size={24} className="fill-gray-900" />
                <span>{reviewStats.overall} • {reviewStats.count} reviews</span>
              </div>
           </div>

           {/* Rating Bars */}
           <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-12 border-b border-gray-100 pb-12">
              {reviewStats.categories.map(cat => (
                <div key={cat.label} className="border-r border-gray-100 last:border-none pr-4">
                   <p className="text-[13px] font-bold mb-1">{cat.label}</p>
                   <p className="text-base font-bold">{cat.rating}</p>
                   <div className="flex gap-1 mt-1">
                      <Star size={10} className="fill-gray-900" />
                   </div>
                </div>
              ))}
           </div>

           {/* Review List */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12">
              {reviews.length > 0 ? reviews.map((rev, i) => (
                <div key={i} className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        {rev.guest.avatar ? <img src={rev.guest.avatar} className="w-full h-full object-cover" alt="" /> : <User size={24} className="m-auto mt-2 text-gray-400" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[15px]">{rev.guest.name}</h4>
                        <p className="text-[13px] text-gray-500 font-medium">{rev.guest.yearsOnAirbnb || 'New guest'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                      <div className="flex gap-0.5"><Star size={10} className="fill-gray-900"/><Star size={10} className="fill-gray-900"/><Star size={10} className="fill-gray-900"/><Star size={10} className="fill-gray-900"/><Star size={10} className="fill-gray-900"/></div>
                      <span>• {new Date(rev.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className="text-gray-700 leading-relaxed text-base">{rev.comment}</p>
                </div>
              )) : (
                <div className="col-span-2 py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                   <MessageSquare className="mx-auto text-gray-300 mb-2" size={32} />
                   <p className="text-gray-500 font-medium">No reviews yet for this stay.</p>
                </div>
              )}
           </div>

           {/* Review Submission Form */}
           {isAuthenticated && (
             <div className="mt-16 p-8 bg-[#F7F7F7] rounded-3xl border border-gray-100">
                <h3 className="text-xl font-bold mb-6">Write a review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-bold">Rating</span>
                     <select 
                       value={newReview.rating} 
                       onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}
                       className="p-2 rounded-lg border border-gray-300"
                     >
                       {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                     </select>
                  </div>
                  <textarea 
                    className="w-full p-6 rounded-2xl border border-gray-300 min-h-[150px] focus:ring-2 focus:ring-airbnb focus:outline-none"
                    placeholder="Describe your experience..."
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    required
                  />
                  <Button type="submit" isLoading={submittingReview} disabled={submittingReview}>Post Review</Button>
                </form>
             </div>
           )}
        </div>

        {/* SECTION: MEET YOUR HOST */}
        <div className="py-12 border-t border-gray-100">
           <h2 className="text-[22px] font-bold mb-8">Meet your host</h2>
           <div className="bg-[#F0EFE9] rounded-3xl p-10 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="col-span-1 flex flex-col items-center bg-white rounded-3xl p-8 shadow-sm">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-md">
                       <img src={listing.host?.avatar || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"} className="w-full h-full object-cover" alt="" />
                    </div>
                    <h3 className="text-2xl font-bold">{listing.host?.name || 'Ishimwe'}</h3>
                    <p className="text-sm font-bold flex items-center gap-1"><Shield size={14} className="text-airbnb" /> Host</p>
                 </div>
                 <div className="col-span-2 space-y-6">
                    <div className="flex gap-12">
                       <div><p className="text-2xl font-bold">286</p><p className="text-[11px] font-bold uppercase text-gray-500">Reviews</p></div>
                       <div><p className="text-2xl font-bold">4.66</p><p className="text-[11px] font-bold uppercase text-gray-500">Rating</p></div>
                       <div><p className="text-2xl font-bold">7</p><p className="text-[11px] font-bold uppercase text-gray-500">Years hosting</p></div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-sm font-medium leading-relaxed">
                          I am a full-time host, I love creating cozy places for people visiting Kigali and making sure the stay is enjoyable. I also help my guests plan for the safari and tours in Rwanda and East Africa.
                       </p>
                       <div className="space-y-2 text-sm font-bold">
                          <p>Speaks English and French</p>
                          <p>Response rate: 100%</p>
                          <p>Responds within an hour</p>
                       </div>
                       <Button className="bg-gray-900 text-white rounded-xl px-8">Message host</Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* SECTION: NEARBY STAYS */}
        {nearbyListings.length > 0 && (
          <div className="py-12 border-t border-gray-100">
            <h2 className="text-[22px] font-bold mb-8">More stays nearby</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyListings.map(l => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <ImageGalleryModal
        images={listing.photos?.map(p => p.url) || []}
        isOpen={showGallery}
        initialIndex={galleryStartIndex}
        onClose={() => setShowGallery(false)}
      />

      <BookingModal 
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        listing={listing}
        dates={{ checkIn, checkOut }}
        guests={guests}
        pricePerNight={pricePerNight}
        total={pricePerNight * nights + 127}
      />
    </div>
  );
};

export default ListingDetailsPage;