import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, Clock, CheckCircle, XCircle, AlertCircle, 
  ChevronRight, Search, Download, Eye, MoreVertical,
  CheckSquare, Square, Trash2, Check, X, Star
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useBookings } from '../hooks/useBookings';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';



const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    CONFIRMED: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle size={12} /> },
    PENDING:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-700',    icon: <AlertCircle size={12} /> },
    CANCELLED: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-600',     icon: <XCircle size={12} /> },
    COMPLETED: { label: 'Completed', cls: 'bg-blue-50 text-blue-700',     icon: <CheckCircle size={12} /> },
  };
  const { label, cls, icon } = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium ${cls}`}>
      {icon} {label}
    </span>
  );
};

const BookingDetailsModal: React.FC<{ 
  booking: any; 
  isOpen: boolean; 
  onClose: () => void;
  role: string;
}> = ({ booking, isOpen, onClose, role }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Booking Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <img 
              src={booking.listing?.photos?.[0]?.url || '/placeholder.png'} 
              className="w-24 h-24 rounded-xl object-cover shadow-sm" 
              alt="" 
            />
            <div>
              <h4 className="font-bold text-lg">{booking.listing?.title}</h4>
              <p className="text-sm text-gray-500">{booking.listing?.location}</p>
              <div className="mt-2">
                <StatusBadge status={booking.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-50">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-gray-400">Check-in</p>
              <p className="font-bold text-sm">{new Date(booking.checkIn).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-gray-400">Checkout</p>
              <p className="font-bold text-sm">{new Date(booking.checkOut).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 font-medium">
                {role === 'GUEST' ? 'Host' : 'Guest'}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                  <img src={role === 'GUEST' ? booking.listing?.host?.avatar : booking.guest?.avatar} alt="" />
                </div>
                <p className="text-sm font-bold">
                  {role === 'GUEST' ? booking.listing?.host?.name : booking.guest?.name}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 font-medium">Total Amount</p>
              <p className="text-lg font-black text-gray-900">${booking.totalPrice}</p>
            </div>
          </div>

          <button className="w-full py-4 rounded-xl border border-gray-100 hover:bg-gray-50 font-bold transition-all" onClick={onClose}>Close Details</button>
        </div>
      </motion.div>
    </div>
  );
};

const ReviewModal: React.FC<{ 
  booking: any; 
  isOpen: boolean; 
  onClose: () => void;
}> = ({ booking, isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post(ENDPOINTS.LISTINGS.REVIEWS(booking.listing.id), {
        rating,
        comment,
        bookingId: booking.id
      });
      alert('Review submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. You might have already reviewed this stay.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Add Review & Rating</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
             <img src={booking.listing?.photos?.[0]?.url} className="w-12 h-12 rounded-lg object-cover" />
             <div>
                <p className="text-sm font-bold truncate max-w-[200px]">{booking.listing?.title}</p>
                <p className="text-[10px] text-gray-500">Stayed {new Date(booking.checkOut).toLocaleDateString()}</p>
             </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700">Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setRating(s)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${rating >= s ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-300'}`}
                >
                  <Star size={20} className={rating >= s ? 'fill-amber-600' : ''} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700">Your experience</p>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your stay..."
              className="w-full h-32 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-airbnb resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
             <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Cancel</button>
             <button 
              disabled={isSubmitting || !comment}
              onClick={handleSubmit} 
              className="flex-1 py-3 bg-airbnb text-white rounded-xl font-bold text-sm shadow-lg shadow-airbnb/20 disabled:opacity-50"
            >
               {isSubmitting ? 'Posting...' : 'Post Review'}
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const DashboardBookings: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'GUEST';
  const [viewScope, setViewScope] = useState<'me' | 'all'>(role === 'GUEST' ? 'me' : 'all');
  const { bookings, isLoading, updateBookingStatus, deleteBooking, getBookingStats, hasPermission } = useBookings(viewScope);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);
  const [viewingBooking, setViewingBooking] = useState<any | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guest?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.listing?.host?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = getBookingStats();

  const toggleSelectAll = () => {
    if (selectedBookings.size === filteredBookings.length) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(filteredBookings.map(b => b.id)));
    }
  };

  const toggleSelectBooking = (id: string) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBookings(newSelected);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: any) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
    setStatusMenuOpen(null);
  };

  const handleBulkStatusUpdate = async (newStatus: any) => {
    const bookingIds = Array.from(selectedBookings);
    for (const id of bookingIds) {
      await handleStatusUpdate(id, newStatus);
    }
    setSelectedBookings(new Set());
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await updateBookingStatus(bookingId, 'CANCELLED');
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
    setActionMenuOpen(null);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('ADMIN ALERT: Are you sure you want to PERMANENTLY DELETE this booking record? This action cannot be undone.')) {
      try {
        await deleteBooking(bookingId);
      } catch (error) {
        console.error('Failed to delete booking:', error);
      }
    }
    setActionMenuOpen(null);
  };

  const exportReport = () => {
    const headers = ['Booking ID', 'Guest Name', 'Listing', 'Check In', 'Check Out', 'Amount', 'Status'];
    const rows = bookings.map(b => [
      b.id, b.guest?.name || 'N/A', b.listing?.title || 'N/A', b.checkIn, b.checkOut, `$${b.totalPrice}`, b.status
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your reservations and guest requests</p>
        </div>
        <button 
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* View Toggle */}
      {(role === 'ADMIN' || role === 'HOST') && (
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setViewScope('me')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewScope === 'me' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            {role === 'HOST' ? 'My Trips' : 'My Items'}
          </button>
          <button
            onClick={() => setViewScope('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewScope === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            {role === 'HOST' ? 'My Guests' : 'All Platform Bookings'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Confirmed</p>
          <p className="text-xl font-bold text-emerald-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-xl font-bold text-blue-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Cancelled</p>
          <p className="text-xl font-bold text-rose-600">{stats.cancelled}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-xl font-bold text-gray-900">${stats.totalRevenue}</p>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedBookings.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900 rounded-lg p-3 flex items-center justify-between"
          >
            <span className="text-white text-sm font-medium">
              {selectedBookings.size} booking{selectedBookings.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              {hasPermission && (
                <button
                  onClick={() => handleBulkStatusUpdate('CONFIRMED')}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                >
                  Confirm All
                </button>
              )}
              <button
                onClick={() => handleBulkStatusUpdate('CANCELLED')}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors"
              >
                Cancel All
              </button>
              <button
                onClick={() => setSelectedBookings(new Set())}
                className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by guest or listing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb focus:ring-1 focus:ring-airbnb"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === status 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-4 py-3">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {selectedBookings.size === filteredBookings.length && filteredBookings.length > 0 ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">
                  {role === 'GUEST' ? 'Listing & Host' : 'Listing & Guest'}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Dates</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="animate-pulse flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-100 rounded w-1/4" />
                          <div className="h-2 bg-gray-100 rounded w-1/3" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedBookings.length > 0 ? (
                paginatedBookings.map((booking) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelectBooking(booking.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedBookings.has(booking.id) ? (
                          <CheckSquare size={16} className="text-airbnb" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                          {booking.listing?.photos?.[0]?.url ? (
                            <img src={booking.listing.photos[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <CalendarCheck size={14} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{booking.listing?.title || 'Listing'}</p>
                          <p className="text-xs text-gray-500">
                            {role === 'GUEST' ? (booking.listing?.host?.name || 'Host') : (booking.guest?.name || 'Guest')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock size={12} className="text-gray-400" />
                        <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">${booking.totalPrice}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setStatusMenuOpen(statusMenuOpen === booking.id ? null : booking.id)}
                          className="flex items-center gap-1"
                        >
                          <StatusBadge status={booking.status} />
                          {booking.status === 'PENDING' && hasPermission && (
                            <ChevronRight size={12} className="text-gray-400 rotate-90" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {statusMenuOpen === booking.id && booking.status === 'PENDING' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-10 min-w-[120px]"
                            >
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                className="w-full px-3 py-2 text-left text-xs text-emerald-600 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                              >
                                <Check size={12} /> Confirm
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                                className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                              >
                                <X size={12} /> Cancel
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === booking.id ? null : booking.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical size={14} className="text-gray-500" />
                        </button>
                        
                        <AnimatePresence>
                          {actionMenuOpen === booking.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-10 min-w-[140px]"
                            >
                                <button 
                                  onClick={() => { setViewingBooking(booking); setActionMenuOpen(null); }}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye size={12} /> View Details
                                </button>
                                
                                {role === 'GUEST' && booking.status === 'COMPLETED' && (
                                  <button 
                                    onClick={() => { setReviewingBooking(booking); setActionMenuOpen(null); }}
                                    className="w-full px-3 py-2 text-left text-xs text-airbnb hover:bg-airbnb/5 flex items-center gap-2"
                                  >
                                    <Star size={12} /> Add Review & Rating
                                  </button>
                                )}

                                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                                  <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                  >
                                    <X size={12} /> Cancel Booking
                                  </button>
                                )}

                                {role === 'ADMIN' && (
                                  <button
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-400 hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                                  >
                                    <Trash2 size={12} /> Force Delete
                                  </button>
                                )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <CalendarCheck size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No bookings found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white p-4 rounded-xl border border-gray-100">
           <div className="text-xs font-medium text-gray-500">
              Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</span> of <span className="text-gray-900 font-bold">{filteredBookings.length}</span> results
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <div className="flex gap-1">
                 {Array.from({ length: totalPages }).map((_, i) => (
                   <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-airbnb text-white shadow-md shadow-airbnb/20' : 'hover:bg-gray-50 text-gray-600'}`}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
           </div>
        </div>
      )}

      <BookingDetailsModal 
        isOpen={!!viewingBooking} 
        onClose={() => setViewingBooking(null)} 
        booking={viewingBooking}
        role={role}
      />

      <ReviewModal 
        isOpen={!!reviewingBooking}
        onClose={() => setReviewingBooking(null)}
        booking={reviewingBooking}
      />
    </div>
  );
};

export default DashboardBookings;