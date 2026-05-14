import React, { useState,useEffect } from 'react';
import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { 
  Star, Share, Heart, Wifi, Car, Home, 
  Bath,Check, ChevronRight, ChevronLeft, Info,
  User, Award, Minus, Plus, Laptop, Tv, Tent, Utensils,X, Sparkles, Trophy, Copy, Globe, Mail, MessageCircle, Wind, Trash2, Edit3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, ImageGalleryModal, AIChatWidget } from '../../../shared/components';
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
}> = ({ isOpen, onClose, listing, dates, total }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'summary' | 'message' | 'done' | 'conflict'>('summary');
  const [message, setMessage] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [conflictData, setConflictData] = useState<{ message: string, suggestion: string } | null>(null);

  const handleBooking = async () => {
    setIsBooking(true);
    try {
      await api.post(ENDPOINTS.BOOKINGS.BASE, {
        listingId: listing.id,
        checkIn: dates.checkIn?.toISOString(),
        checkOut: dates.checkOut?.toISOString(),
        message: message
      });
      setStep('done');
    } catch (err: any) {
      console.error('Booking failed:', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else if (err.response?.status === 409) {
        setStep('conflict');
        setConflictData(err.response.data);
      } else {
        alert(err.response?.data?.message || 'Failed to send booking request. Please try again.');
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (!isOpen) return null;

  const steps = ['summary', 'message', 'done'];
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
              {['summary', 'message'].map((s, _) => (
                <div key={s} className={`h-1 rounded-full transition-all ${step === 'done' || (s === 'summary' || (s === 'message' && step === 'message')) ? 'w-6 bg-airbnb' : 'w-2 bg-gray-100'}`} />
              ))}
            </div>
            <span className="text-[10px] font-black text-gray-400 ml-2">
              {step === 'done' ? 'Completed' : `Step ${currentStepIdx + 1} of 2`}
            </span>
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
                    <p className="text-[10px] font-black text-gray-400">Check-in</p>
                    <p className="font-bold">{dayjs(dates.checkIn).format('MMM D, YYYY')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400">Checkout</p>
                    <p className="font-bold">{dayjs(dates.checkOut).format('MMM D, YYYY')}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                   <span className="font-bold">Estimated Total</span>
                   <span className="font-black text-xl text-airbnb">${total}</span>
                </div>
                <Button className="w-full py-4 rounded-2xl" onClick={() => setStep('message')}>Continue</Button>
              </motion.div>
            )}

            {step === 'message' && (
              <motion.div key="message" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src={listing.host?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="font-bold">Message {listing.host?.name || 'the host'}</h3>
                    <p className="text-xs text-gray-500">Ask a question or say hello</p>
                  </div>
                </div>
                <textarea 
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-sm focus:outline-none focus:ring-1 focus:ring-airbnb min-h-[150px] resize-none"
                  placeholder="Hi! I'm interested in staying at your place. I'm visiting for..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1 py-4" onClick={() => setStep('summary')}>Back</Button>
                  <Button className="flex-2 py-4 shadow-lg shadow-airbnb/20" onClick={handleBooking} isLoading={isBooking}>
                    Request to Book
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'conflict' && (
              <motion.div key="conflict" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                   <Info size={40} />
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">Dates are unavailable</h2>
                   <p className="text-gray-500 mt-2 text-sm">{conflictData?.message}</p>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl text-left border border-amber-100">
                   <p className="text-xs font-black text-amber-600 tracking-widest mb-2">Our AI Suggestion</p>
                   <p className="text-sm text-amber-900 font-medium leading-relaxed">{conflictData?.suggestion}</p>
                </div>
                <div className="flex gap-3">
                   <Button variant="outline" className="flex-1 py-4" onClick={() => setStep('summary')}>Change Dates</Button>
                   <Button className="flex-1 py-4" onClick={onClose}>Close</Button>
                </div>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div key="done" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10 space-y-6">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/30">
                  <Check size={48} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Request sent!</h2>
                  <p className="text-gray-500 mt-2">Your booking request for {listing.title} has been sent to the host.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl text-left space-y-2 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400">What happens next?</p>
                  <p className="text-sm text-gray-600">The host will review your request and confirm the dates. You'll receive an email notification once they take action.</p>
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
  const { isAuthenticated, user } = useAuth();
  
  // -- HOOK DATA --
  const { 
    listing, 
    reviews, 
    nearbyListings, 
    loading, 
    error, 
    submitReview,
  } = useListingDetails(id);

  // -- UI STATE --
  const [showGallery, setShowGallery] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // -- BOOKING STATE --
  const [checkIn, setCheckIn] = useState<Date | null>(new Date());
  const [checkOut, setCheckOut] = useState<Date | null>(new Date(Date.now() + 86400000 * 5)); // +5 days
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });

  // -- REVIEWS FORM STATE --
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  useEffect(() => {
    const fetchAiSummary = async () => {
      if (!reviews || reviews.length === 0) return;
      
      setLoadingAiSummary(true);
      try {
        const res = await api.get(ENDPOINTS.AI.REVIEW_SUMMARY(id!));
        setAiSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch AI summary:", err);
      } finally {
        setLoadingAiSummary(false);
      }
    };
    fetchAiSummary();

    const saved = JSON.parse(localStorage.getItem('saved_listings') || '[]');
    setIsSaved(saved.includes(id));
  }, [id]);

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/listings/${id}`);
      return;
    }
    const saved = JSON.parse(localStorage.getItem('saved_listings') || '[]');
    let newSaved;
    if (saved.includes(id)) {
      newSaved = saved.filter((i: string) => i !== id);
    } else {
      newSaved = [...saved, id];
    }
    localStorage.setItem('saved_listings', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
  };


  // -- REVIEWS DATA --
  const reviewStats = {
    overall: 4.67,
    count: reviews.length || 3,
    categories: []
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/listings/${id}`);
      return;
    }

    setSubmittingReview(true);
    const res = await submitReview(newReview.rating, newReview.comment);
    setSubmittingReview(false);
    
    if (res.success) {
      setNewReview({ rating: 5, comment: '' });
      alert('Review submitted successfully!');
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await api.delete(ENDPOINTS.LISTINGS.DETAILS(id!));
      alert('Listing deleted successfully');
      navigate('/dashboard/listings');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete listing');
    }
  };



  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-airbnb rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400 tracking-widest">Loading Stay...</p>
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

  const totalGuests = guests.adults + guests.children;
  const pricePerNight = listing?.pricePerNight || 0;
  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))) : 1; 
  const cleaningFee = (listing as any)?.cleaningFee || 0;
  const serviceFee = (listing as any)?.serviceFee || 0;
  const total = (pricePerNight * nights) + cleaningFee + serviceFee;

  const getAmenityIcon = (a: string) => {
    const map: any = { 
      'WiFi': Wifi, 'Wifi': Wifi, 'Kitchen': Utensils, 'Workspace': Laptop, 'TV': Tv, 'Tv': Tv,
      'Parking': Car, 'Pets': Tent, 'Washer': Bath, 'Bath': Bath, 'Pool': Sparkles, 'Beach Access': Home,
      'Air Conditioning': Wind, 'AC': Wind, 'Gym': Trophy, 'Self check-in': Award
    };
    const Icon = map[a] || Check;
    return <Icon size={24} className="text-gray-700" />;
  };

  const description = listing.description || "";
  const shortDesc = description.slice(0, 150);

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-airbnb/20">
      <div className="container mx-auto px-4 md:px-10 lg:px-20 py-8 max-w-7xl">
        
        {/* BACK BUTTON */}
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 font-bold text-sm hover:underline">
          <ChevronLeft size={16} /> Back
        </button>

        {/* SECTION 1: HEADER TITLE BAR */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <h1 className="text-[26px] font-bold text-gray-900">{listing.title}</h1>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 font-bold underline text-sm hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
              >
                <Share size={16} /> Share
              </button>
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 font-bold underline text-sm px-2 py-1 rounded-md transition-colors ${isSaved ? 'text-airbnb' : 'hover:bg-gray-50'}`}
              >
                <Heart size={16} className={isSaved ? 'fill-airbnb' : ''} /> {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-gray-900" />
                <span>{reviews.length > 0 ? reviewStats.overall : 'New'}</span>
              </div>
              {reviews.length > 0 && (
                <>
                  <span>•</span>
                  <span className="underline cursor-pointer">{reviews.length} reviews</span>
                </>
              )}
              <span>•</span>
              <span className="underline cursor-pointer">{listing.location}</span>
            </div>
            
            {(isAuthenticated && (user?.role === 'ADMIN' || user?.id === listing.host?.id)) && (
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/dashboard/listings`)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
                >
                  <Edit3 size={14} /> Edit Listing
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-100 transition-all"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: PHOTO GALLERY */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[450px] rounded-xl overflow-hidden mb-12 relative">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8">
            {/* SECTION 3: HOST INFO + DETAILS */}
            <div className="flex justify-between items-start pb-8 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold">Entire rental unit hosted by {listing.host?.name || 'Owner'}</h2>
                <p className="text-gray-600 mt-1">{listing.guests} guests • 1 bedroom • 1 bed • 1 bath</p>
                <div className="flex items-center gap-4 mt-6 text-sm font-bold text-gray-900">
                  <div className="flex items-center gap-2"><Check size={18} /> Self check-in</div>
                  <div className="flex items-center gap-2"><Check size={18} /> Free cancellation</div>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                {listing.host?.avatar ? <img src={listing.host.avatar} className="w-full h-full object-cover" alt="" /> : <User size={32} className="m-auto mt-2 text-gray-400" />}
              </div>
            </div>

            {/* SECTION 4: DESCRIPTION */}
            <div className="py-8 border-b border-gray-100">
              <p className="text-gray-700 leading-relaxed text-base">
                {showMoreDesc ? description : shortDesc + (description.length > 150 ? '...' : '')}
              </p>
              {description.length > 150 && (
                <button onClick={() => setShowMoreDesc(!showMoreDesc)} className="mt-4 font-bold underline flex items-center gap-1">
                  {showMoreDesc ? 'Show less' : 'Read more'} <ChevronRight className={showMoreDesc ? "-rotate-90" : "rotate-90"} size={16} />
                </button>
              )}
            </div>

            {/* SECTION 5: AMENITIES */}
            <div className="py-8 border-b border-gray-100">
              <h2 className="text-xl font-bold mb-6">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                {(listing.amenities || []).slice(0, 6).map(a => (
                  <div key={a} className="flex items-center gap-4 text-gray-700">
                    {getAmenityIcon(a)}
                    <span className="text-base">{a}</span>
                  </div>
                ))}
              </div>
              {(listing.amenities || []).length > 6 && (
                <button className="mt-8 border border-gray-900 rounded-xl px-6 py-2.5 font-bold hover:bg-gray-50 transition-colors">
                  Show all {(listing.amenities || []).length} amenities
                </button>
              )}
            </div>

            {/* SECTION AI SUMMARY: PREMUIM LOOK */}
            {aiSummary && (
              <div className="py-12 border-b border-gray-100">
                <div className="bg-gradient-to-br from-airbnb/5 to-purple-50 rounded-[2.5rem] p-10 border border-airbnb/10 relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/40 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-airbnb">
                        <Sparkles size={24} className="fill-current" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Guest Insights</h2>
                        <p className="text-xs font-black text-airbnb/60 tracking-widest mt-0.5">AI-Powered Review Summary</p>
                      </div>
                    </div>

                    {loadingAiSummary ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
                        <div className="space-y-6">
                          <div className="h-32 bg-white/40 rounded-3xl" />
                          <div className="h-8 w-48 bg-gray-100 rounded-full" />
                        </div>
                        <div className="space-y-8">
                          <div className="h-24 bg-white/40 rounded-3xl" />
                          <div className="h-24 bg-white/40 rounded-3xl" />
                        </div>
                      </div>
                    ) : aiSummary ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <div className="p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm">
                            <p className="text-lg font-medium text-gray-800 leading-relaxed italic">
                              "{aiSummary.summary}"
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 px-2">
                             <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="" />
                                  </div>
                                ))}
                             </div>
                             <p className="text-xs font-bold text-gray-500">Based on {aiSummary.totalReviews} guest reviews</p>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <div>
                            <h4 className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-4">What guests loved</h4>
                            <div className="flex flex-wrap gap-2">
                              {aiSummary.positives?.map((p: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-bold text-gray-700">
                                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Check size={12} strokeWidth={4} />
                                  </div>
                                  {p}
                                </div>
                              ))}
                            </div>
                          </div>

                          {aiSummary.negatives && aiSummary.negatives.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-black text-gray-400 tracking-[0.2em] mb-4">Things to note</h4>
                              <div className="flex flex-wrap gap-2">
                                {aiSummary.negatives.map((n: string, i: number) => (
                                  <div key={i} className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-gray-100 text-sm font-medium text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                      <Info size={12} strokeWidth={3} />
                                    </div>
                                    {n}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-white/40 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">No review insights available yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: REVIEWS (SIMPLIFIED) */}
            <div className="py-12 border-b border-gray-100">
               <div className="flex items-center gap-2 text-xl font-bold mb-8">
                  <Star size={24} className="fill-gray-900" />
                  <span>{reviews.length > 0 ? `${reviewStats.overall} • ${reviews.length} reviews` : 'No reviews yet'}</span>
               </div>
               
               {/* Simplified reviews list - max 2 */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {reviews.slice(0, 2).map((rev, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                             {rev.guest.avatar ? <img src={rev.guest.avatar} className="w-full h-full object-cover" alt="" /> : <User size={20} className="m-auto mt-2" />}
                          </div>
                          <div>
                             <p className="font-bold text-sm">{rev.guest.name}</p>
                             <p className="text-xs text-gray-500">{new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                          </div>
                       </div>
                       <p className="text-gray-700 leading-relaxed line-clamp-3">{rev.comment}</p>
                    </div>
                  ))}
               </div>
               
               {isAuthenticated && (
                 <div className="mt-8 pt-8 border-t border-gray-100">
                    <h3 className="font-bold mb-4">Write a review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                       <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} type="button" onClick={() => setNewReview({ ...newReview, rating: s })} className={newReview.rating >= s ? "text-airbnb" : "text-gray-300"}>
                               <Star size={18} className={newReview.rating >= s ? "fill-airbnb" : ""} />
                            </button>
                          ))}
                       </div>
                       <textarea 
                          className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-airbnb outline-none"
                          placeholder="Share your thoughts about this place..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                       />
                       <Button type="submit" size="sm" isLoading={submittingReview}>Post Review</Button>
                    </form>
                 </div>
               )}
            </div>

            {/* SECTION 7: HOST PROFILE */}
            <div className="py-12 border-b border-gray-100">
              <h2 className="text-[22px] font-bold mb-8">Meet your host</h2>
              <div className="bg-gray-50 rounded-3xl p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="flex flex-col items-center text-center space-y-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-w-[200px]">
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-inner">
                      <img src={listing.host?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} className="w-full h-full object-cover" alt={listing.host?.name} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{listing.host?.name || 'John Doe'}</h3>
                      <p className="text-sm font-bold text-gray-500">Host</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center md:text-left">
                      <div><p className="text-xl font-bold">286</p><p className="text-[10px] font-black text-gray-400">Reviews</p></div>
                      <div><p className="text-xl font-bold">4.8</p><p className="text-[10px] font-black text-gray-400">Rating</p></div>
                      <div><p className="text-xl font-bold">5</p><p className="text-[10px] font-black text-gray-400">Years hosting</p></div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed text-sm">
                      I'm a full-time host who loves creating cozy spaces. I enjoy helping guests plan their trips and ensuring they have a memorable stay.
                    </p>
                    
                    <div className="space-y-2 text-sm font-medium">
                      <p className="flex items-center gap-2"><Globe size={16} className="text-gray-400" /> Languages: English, French</p>
                      <p className="flex items-center gap-2"><MessageCircle size={16} className="text-gray-400" /> Response rate: 100%</p>
                    </div>
                    
                    <Button variant="outline" className="border-gray-900 rounded-xl px-8 py-2.5 font-bold">Message host</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 8: STICKY BOOKING CARD */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28">
              <Card className="p-6 shadow-xl border border-gray-200 rounded-2xl" hoverable={false}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-xl font-bold">${pricePerNight}</span>
                    <span className="text-gray-500 text-sm ml-1">night</span>
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1 text-sm font-bold">
                       <Star size={12} className="fill-gray-900" />
                       <span>{reviewStats.overall}</span>
                    </div>
                  )}
                </div>

                <div className="border border-gray-400 rounded-xl overflow-hidden mb-4">
                   <div className="grid grid-cols-2 divide-x divide-gray-400 border-b border-gray-400">
                      <div className="p-3 text-left">
                        <p className="text-[9px] font-black">Check-in</p>
                        <input 
                          type="date" 
                          className="text-xs bg-transparent border-none outline-none w-full p-0 cursor-pointer"
                          value={checkIn ? dayjs(checkIn).format('YYYY-MM-DD') : ''}
                          min={dayjs().format('YYYY-MM-DD')}
                          onChange={(e) => {
                            const newCheckIn = new Date(e.target.value);
                            setCheckIn(newCheckIn);
                            // Ensure checkout is at least 1 day after check-in
                            if (checkOut && dayjs(checkOut).isBefore(dayjs(newCheckIn).add(1, 'day'))) {
                              setCheckOut(dayjs(newCheckIn).add(1, 'day').toDate());
                            }
                          }}
                        />
                      </div>
                      <div className="p-3 text-left">
                        <p className="text-[9px] font-black">Checkout</p>
                        <input 
                          type="date" 
                          className="text-xs bg-transparent border-none outline-none w-full p-0 cursor-pointer"
                          value={checkOut ? dayjs(checkOut).format('YYYY-MM-DD') : ''}
                          min={checkIn ? dayjs(checkIn).add(1, 'day').format('YYYY-MM-DD') : dayjs().add(1, 'day').format('YYYY-MM-DD')}
                          onChange={(e) => setCheckOut(new Date(e.target.value))}
                        />
                      </div>
                   </div>
                   <div className="p-3 flex justify-between items-center bg-white">
                      <div>
                        <p className="text-[9px] font-black">Guests</p>
                        <p className="text-xs">{totalGuests} guests</p>
                        {totalGuests >= listing.guests && (
                          <p className="text-[9px] text-airbnb font-bold mt-0.5">Max capacity reached</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                         <button 
                           onClick={() => setGuests({ ...guests, adults: Math.max(1, guests.adults - 1) })}
                           className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900"
                         >
                           <Minus size={12} />
                         </button>
                         <span className="text-sm font-bold w-4 text-center">{guests.adults}</span>
                         <button 
                           onClick={() => {
                             if (totalGuests < listing.guests) {
                               setGuests({ ...guests, adults: guests.adults + 1 });
                             }
                           }}
                           className={`w-7 h-7 rounded-full border flex items-center justify-center ${totalGuests >= listing.guests ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-300 hover:border-gray-900'}`}
                           disabled={totalGuests >= listing.guests}
                         >
                           <Plus size={12} />
                         </button>
                      </div>
                   </div>
                </div>

                <Button 
                  className="w-full py-3.5 bg-airbnb font-bold text-base shadow-lg"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate(`/login?redirect=/listings/${id}`);
                    } else {
                      setShowBookingModal(true);
                    }
                  }}
                >
                  Reserve
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4 font-medium">You won't be charged yet</p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="underline">${pricePerNight} x {nights} nights</span>
                    <span>${pricePerNight * nights}</span>
                  </div>
                  {cleaningFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="underline">Cleaning fee</span>
                      <span>${cleaningFee}</span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="underline">Service fee</span>
                      <span>${serviceFee}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center font-bold text-lg">
                   <span>Total</span>
                   <span>${total}</span>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* SECTION 11: NEARBY STAYS */}
        {nearbyListings.length > 0 && (
          <div className="py-12 border-t border-gray-100 mt-12 overflow-hidden">
            <h2 className="text-[22px] font-bold mb-8">More stays nearby</h2>
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x no-scrollbar">
              {nearbyListings.map(l => (
                <div key={l.id} className="min-w-[280px] snap-start">
                  <ListingCard listing={l} />
                </div>
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

      <AIChatWidget 
        listingId={id} 
        initialMessage={`Hi! I can help you with questions about "${listing.title}". Ask me about amenities, location, or availability!`} 
      />

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg">Share this place</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-4 p-4 border border-gray-100 rounded-2xl mb-6">
                  <img src={listing.photos?.[0]?.url} className="w-16 h-16 rounded-xl object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm">{listing.title}</p>
                    <p className="text-xs text-gray-500 truncate">{listing.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }} className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><Copy size={20} /></div>
                      <span className="text-xs font-bold">Copy Link</span>
                   </button>
                   <button className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Globe size={20} /></div>
                      <span className="text-xs font-bold">Messenger</span>
                   </button>
                   <button className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><MessageCircle size={20} /></div>
                      <span className="text-xs font-bold">WhatsApp</span>
                   </button>
                   <button className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><Mail size={20} /></div>
                      <span className="text-xs font-bold">Email</span>
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListingDetailsPage;