import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, User, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card } from '../../../shared/components';

const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {
    listingTitle: "Luxury Villa in Musanze",
    location: "Musanze, Northern Province",
    checkIn: "2026-06-15",
    checkOut: "2026-06-20",
    totalPrice: 2250,
    guests: 2
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8"
          leftIcon={<ChevronLeft size={20} />}
        >
          Back to listing
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-12 text-center shadow-xl border-none">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle size={48} />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-500 mb-10 text-lg">Your stay at {bookingData.listingTitle} is all set.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Calendar size={24} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Dates</p>
                    <p className="font-bold text-gray-900">{bookingData.checkIn} to {bookingData.checkOut}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><MapPin size={24} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Location</p>
                    <p className="font-bold text-gray-900">{bookingData.location}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><User size={24} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Guests</p>
                    <p className="font-bold text-gray-900">{bookingData.guests} guests</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-3 rounded-xl text-green-600 font-bold text-xl">$</div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Total Paid</p>
                    <p className="font-bold text-gray-900">${bookingData.totalPrice}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="px-8 py-3"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="px-8 py-3"
              >
                Explore More Stays
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
