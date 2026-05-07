import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Plus, Edit, Trash2, Eye, MoreVertical, 
  Search, AlertCircle, CheckSquare, Square,
  MapPin, Star, Upload, X, Image as ImageIcon,
  Users, Wifi, Coffee, ParkingCircle, Wind, Waves, Tv, Utensils,
  Building2, CalendarCheck, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useListings } from '../../../contexts/ListingContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useListingsManagement } from '../hooks/useListingsManagement';
import type { Listing } from '../../../shared/types';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';

// Helper function to get amenity icon
const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'WiFi': <Wifi size={12} />,
    'Pool': <Waves size={12} />,
    'Parking': <ParkingCircle size={12} />,
    'Air Conditioning': <Wind size={12} />,
    'TV': <Tv size={12} />,
    'Kitchen': <Utensils size={12} />,
    'Coffee Maker': <Coffee size={12} />,
  };
  return iconMap[amenity] || <Wifi size={12} />;
};

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      
      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-gray-900 text-white'
              : page === '...'
              ? 'cursor-default text-gray-400'
              : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// Edit Modal Component with Image Management
const EditListingModal: React.FC<{
  listing: Listing;
  onClose: () => void;
  onUpdate: (data: any) => Promise<void>;
  onUpload: (file: File) => Promise<void>;
  onDeletePhoto: (photoId: string) => Promise<void>;
  isUploading: boolean;
}> = ({ listing, onClose, onUpdate, onUpload, onDeletePhoto, isUploading }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'photos'>('details');
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description,
    pricePerNight: listing.pricePerNight,
    guests: listing.guests,
    location: listing.location,
    amenities: [...(listing.amenities || [])],
  });
  const [saving, setSaving] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const photos = listing.photos || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdate(formData);
    setSaving(false);
  };

  const addAmenity = () => {
    if (newAmenity && !formData.amenities.includes(newAmenity)) {
      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity] });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      await onUpload(file);
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      setDeletingId(photoId);
      await onDeletePhoto(photoId);
      setDeletingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Edit Listing - {listing.title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-airbnb border-b-2 border-airbnb'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Listing Details
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'photos'
                ? 'text-airbnb border-b-2 border-airbnb'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Photos ({photos.length}/5)
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          {activeTab === 'details' ? (
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per night</label>
                  <input
                    type="number"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                  <input
                    type="number"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.amenities.map((amenity) => (
                    <span key={amenity} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                      {getAmenityIcon(amenity)}
                      {amenity}
                      <button type="button" onClick={() => removeAmenity(amenity)} className="hover:text-red-500">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    placeholder="Add amenity..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb"
                  />
                  <button type="button" onClick={addAmenity} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
                    <img src={photo.url} alt="Listing" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingId === photo.id}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {deletingId === photo.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                ))}
                
                {photos.length < 5 && (
                  <label className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center aspect-square cursor-pointer hover:border-airbnb transition-colors">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    {uploading || isUploading ? (
                      <div className="w-6 h-6 border-2 border-airbnb border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs text-gray-500 mt-2">Upload Photo</span>
                      </>
                    )}
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">Maximum 5 photos. Upload one at a time.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main DashboardListings Component - Table View with Pagination
const DashboardListings: React.FC = () => {
  const { user } = useAuth();
  const { refreshListings } = useListings();
  const { updateListing, deleteListing, uploadPhoto, deletePhoto, isLoading: isActionLoading } = useListingsManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<Listing | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Fetch listings with pagination
  const fetchListings = useCallback(async (page: number, search?: string) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: itemsPerPage,
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await api.get(ENDPOINTS.LISTINGS.BASE, { params });
      const { data, meta } = response.data;
      
      // Filter for current host only
      const hostListings = data.filter((l: Listing) => l.hostId === user?.id);
      setListings(hostListings);
      setTotalPages(Math.ceil(meta.total / itemsPerPage));
      setTotalItems(meta.total);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, itemsPerPage]);

  // Fetch listings on page change or search
  useEffect(() => {
    fetchListings(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchListings]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredListings = listings;

  // Calculate stats from all host listings (not just current page)
  const [allListingsStats, setAllListingsStats] = useState({ total: 0, avgPrice: 0, totalBookings: 0, totalReviews: 0 });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(ENDPOINTS.LISTINGS.BASE, { params: { limit: 100 } });
        const allListings = response.data.data.filter((l: Listing) => l.hostId === user?.id);
        const avgPrice = allListings.length > 0 
          ? Math.round(allListings.reduce((sum: number, l: Listing) => sum + (l.pricePerNight || 0), 0) / allListings.length)
          : 0;
        const totalBookings = allListings.reduce((sum: number, l: Listing) => sum + (l._count?.bookings || 0), 0);
        const totalReviews = allListings.reduce((sum: number, l: Listing) => sum + (l._count?.reviews || 0), 0);
        
        setAllListingsStats({
          total: allListings.length,
          avgPrice,
          totalBookings,
          totalReviews,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, [user?.id, refreshListings]);

  const toggleSelectAll = () => {
    if (selectedListings.size === filteredListings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(filteredListings.map(l => l.id)));
    }
  };

  const toggleSelectListing = (id: string) => {
    const newSelected = new Set(selectedListings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedListings(newSelected);
  };

  const handleDelete = async (listingId: string) => {
    const result = await deleteListing(listingId);
    if (result.success) {
      await fetchListings(currentPage, searchTerm);
      selectedListings.delete(listingId);
      setSelectedListings(new Set(selectedListings));
    }
    setShowDeleteModal(null);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedListings) {
      await deleteListing(id);
    }
    await fetchListings(currentPage, searchTerm);
    setSelectedListings(new Set());
  };

  const handleUpdate = async (listingId: string, data: any) => {
    const result = await updateListing(listingId, data);
    if (result.success) {
      await fetchListings(currentPage, searchTerm);
      setShowEditModal(null);
    }
  };

  const handleUploadPhoto = async (listingId: string, file: File) => {
    setIsUploading(true);
    const result = await uploadPhoto(listingId, file);
    if (result.success) {
      await fetchListings(currentPage, searchTerm);
    }
    setIsUploading(false);
  };

  const handleDeletePhoto = async (listingId: string, photoId: string) => {
    const result = await deletePhoto(listingId, photoId);
    if (result.success) {
      await fetchListings(currentPage, searchTerm);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Location', 'Price/Night', 'Guests', 'Type', 'Total Bookings', 'Rating'];
    const rows = filteredListings.map(l => [
      l.id, l.title, l.location, l.pricePerNight, l.guests, l.type, l._count?.bookings || 0, l.rating || 'N/A'
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `listings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your properties and rental listings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <Download size={16} /> Export
          </button>
          <Link
            to="/dashboard/listings/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
          >
            <Plus size={16} /> Add Listing
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Total Listings</p>
          <p className="text-xl font-bold text-gray-900">{allListingsStats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Avg. Price</p>
          <p className="text-xl font-bold text-gray-900">${allListingsStats.avgPrice}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Total Bookings</p>
          <p className="text-xl font-bold text-emerald-600">{allListingsStats.totalBookings}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-xs text-gray-500">Total Reviews</p>
          <p className="text-xl font-bold text-amber-600">{allListingsStats.totalReviews}</p>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedListings.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900 rounded-lg p-3 flex items-center justify-between"
          >
            <span className="text-white text-sm font-medium">
              {selectedListings.size} listing{selectedListings.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedListings(new Set())}
                className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb focus:ring-1 focus:ring-airbnb"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-gray-700">
                    {selectedListings.size === filteredListings.length && filteredListings.length > 0 ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Image</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Title & Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Guests</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Bookings</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Rating</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={9} className="px-4 py-4">
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
              ) : filteredListings.length > 0 ? (
                filteredListings.map((listing) => {
                  const photos = listing.photos || [];
                  return (
                    <motion.tr
                      key={listing.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelectListing(listing.id)} className="text-gray-500 hover:text-gray-700">
                          {selectedListings.has(listing.id) ? (
                            <CheckSquare size={16} className="text-airbnb" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                          {photos[0]?.url ? (
                            <img src={photos[0].url} alt={listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <Home size={16} className="text-gray-400 m-3" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{listing.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={10} /> {listing.location}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(listing.amenities || []).slice(0, 2).map((amenity) => (
                            <span key={amenity} className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                              {getAmenityIcon(amenity)}
                            </span>
                          ))}
                          {(listing.amenities || []).length > 2 && (
                            <span className="text-[10px] text-gray-400">+{(listing.amenities || []).length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">${listing.pricePerNight}</p>
                        <p className="text-[10px] text-gray-400">/night</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Users size={12} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{listing.guests}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                          <Building2 size={10} />
                          {listing.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <CalendarCheck size={12} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{listing._count?.bookings || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span className="text-sm text-gray-700">{listing.rating || 'New'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === listing.id ? null : listing.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical size={14} className="text-gray-500" />
                          </button>
                          
                          <AnimatePresence>
                            {actionMenuOpen === listing.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden"
                              >
                                <Link to={`/listings/${listing.id}`} target="_blank">
                                  <button className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Eye size={12} /> View Details
                                  </button>
                                </Link>
                                <button
                                  onClick={() => {
                                    setShowEditModal(listing);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit size={12} /> Edit Listing
                                </button>
                                <button
                                  onClick={() => setShowDeleteModal(listing.id)}
                                  className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Home size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No listings found</p>
                    <Link
                      to="/dashboard/listings/new"
                      className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-all"
                    >
                      <Plus size={12} /> Add your first listing
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={24} className="text-rose-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Listing</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Are you sure you want to delete this listing? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteModal)}
                    disabled={isActionLoading}
                    className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                  >
                    {isActionLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <EditListingModal
            listing={showEditModal}
            onClose={() => setShowEditModal(null)}
            onUpdate={(data) => handleUpdate(showEditModal.id, data)}
            onUpload={(file) => handleUploadPhoto(showEditModal.id, file)}
            onDeletePhoto={(photoId) => handleDeletePhoto(showEditModal.id, photoId)}
            isUploading={isUploading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardListings;