import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Search, Trash2, 
  MessageSquare, Home, RefreshCw
} from 'lucide-react';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';

const DashboardAdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINTS.REVIEWS.BASE);
      setReviews(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(ENDPOINTS.REVIEWS.BY_ID(id));
      fetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = 
      rev.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.guest?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || Math.floor(rev.rating) === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Moderate and manage all user feedback across the platform</p>
        </div>
        <button 
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search reviews, listings, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb"
          />
        </div>
        <div className="flex gap-2">
          {[5, 4, 3, 2, 1].map(r => (
            <button
              key={r}
              onClick={() => setRatingFilter(ratingFilter === r ? 'all' : r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${ratingFilter === r ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {r} <Star size={10} className={ratingFilter === r ? 'fill-white' : 'fill-amber-500'} />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
              <div className="h-20 bg-gray-50 rounded-lg" />
            </div>
          ))
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <motion.div
              key={rev.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                    <img src={rev.guest?.avatar || `https://i.pravatar.cc/100?u=${rev.guest?.id}`} alt="" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{rev.guest?.name || 'Guest'}</p>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={i < rev.rating ? 'fill-amber-500' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteReview(rev.id)}
                  className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 italic line-clamp-3">"{rev.comment}"</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Home size={12} />
                <span className="truncate">{rev.listing?.title || 'Listing Details'}</span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No reviews found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdminReviews;
