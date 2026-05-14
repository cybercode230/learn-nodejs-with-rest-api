import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useListings } from '../../../contexts/ListingContext';
import { useNavigate } from 'react-router-dom';

interface NormalSearchProps {
  onClose?: () => void;
}

type ListingType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CABIN' | '';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

const NormalSearch: React.FC<NormalSearchProps> = ({ onClose }) => {
  const { searchListings, filters } = useListings();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    location: filters.location || '',
    type: filters.type || '' as ListingType,
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    guests: filters.guests || '1',
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use the backend-connected searchListings from context
    await searchListings(formData);
    navigate('/search-results');
    if (onClose) onClose();
  };

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startingDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const isSelectedDate = (date: Date) => {
    if (dateRange.startDate && date.toDateString() === dateRange.startDate.toDateString()) return 'start';
    if (dateRange.endDate && date.toDateString() === dateRange.endDate.toDateString()) return 'end';
    if (dateRange.startDate && dateRange.endDate && date > dateRange.startDate && date < dateRange.endDate) return 'between';
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      setDateRange({ startDate: date, endDate: null });
    } else {
      if (date >= dateRange.startDate) setDateRange({ ...dateRange, endDate: date });
      else setDateRange({ startDate: date, endDate: null });
    }
  };

  const formatDateLabel = () => {
    if (dateRange.startDate && dateRange.endDate) {
      return `${dateRange.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return "Add dates";
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4">
      <form
        onSubmit={handleSearch}
        className="bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center p-2 h-16 divide-x divide-gray-100"
      >
        {/* Location */}
        <div
          className={`flex-1 px-6 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors ${activeTab === 'location' ? 'bg-white shadow-md' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-900">Location</label>
          <input
            type="text"
            placeholder="Where to?"
            className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-gray-400"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            autoFocus={activeTab === 'location'}
          />
        </div>

        {/* Dates */}
        <div
          className={`flex-1 px-6 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors ${activeTab === 'dates' ? 'bg-white shadow-md' : ''}`}
          onClick={() => setActiveTab('dates')}
        >
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-900">Check in / out</label>
          <div className="text-sm font-medium text-gray-400 truncate">{formatDateLabel()}</div>
        </div>

        {/* Price/Type Toggle (Mini) */}
        <div
          className={`flex-1 px-6 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors ${activeTab === 'filters' ? 'bg-white shadow-md' : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-900">Price & Type</label>
          <div className="text-sm font-medium text-gray-400 truncate">
            {formData.type || "Any type"} • ${formData.minPrice || 0}+
          </div>
        </div>

        {/* Guests */}
        <div
          className={`flex-1 px-6 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors ${activeTab === 'guests' ? 'bg-white shadow-md' : ''}`}
          onClick={() => setActiveTab('guests')}
        >
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-900">Who</label>
          <input
            type="number"
            min="1"
            className="w-full bg-transparent border-none outline-none text-sm font-medium"
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-airbnb text-white p-4 rounded-full hover:bg-airbnb/90 transition-all flex items-center justify-center ml-2 shadow-md hover:scale-105 active:scale-95"
        >
          <Search size={20} strokeWidth={3} />
        </button>
      </form>

      {/* Dropdown Modals */}
      <AnimatePresence>
        {activeTab === 'dates' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl z-[9999] p-8 border border-gray-100 mx-auto max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
              <span className="font-bold text-lg">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
              <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => <div key={day} className="text-center text-xs font-black text-gray-400 py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <div key={index} className="aspect-square">
                  {date ? (
                    <button
                      type="button"
                      onClick={() => handleDateClick(date)}
                      className={`w-full h-full rounded-full text-sm font-bold transition-all ${isSelectedDate(date) === 'start' || isSelectedDate(date) === 'end' ? 'bg-airbnb text-white' : isSelectedDate(date) === 'between' ? 'bg-airbnb/10 text-airbnb' : 'hover:bg-gray-100'}`}
                    >
                      {date.getDate()}
                    </button>
                  ) : <div />}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'filters' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-1/4 right-1/4 mt-3 bg-white rounded-3xl shadow-2xl z-[9999] p-6 border border-gray-100"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Property Type</label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold outline-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ListingType })}
                >
                  <option value="">Any Stay</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="CABIN">Cabin</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Price Range</label>
                <div className="flex gap-3">
                  <input
                    type="number" placeholder="Min"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold outline-none"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  />
                  <input
                    type="number" placeholder="Max"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold outline-none"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  />
                </div>
              </div>
              <button onClick={() => setActiveTab(null)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">Apply</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close modals */}
      {activeTab && (
        <div
          className="fixed inset-0 z-[9998] bg-transparent"
          onClick={() => setActiveTab(null)}
        />
      )}
    </div>
  );
};

export default NormalSearch;
