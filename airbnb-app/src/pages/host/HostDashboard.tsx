import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import type { Listing } from '../../types/index';
import { Plus, Edit, Trash, BarChart2, Home, MessageSquare, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const HostDashboard: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHostListings = async () => {
      try {
        const response = await api.get('/listings?hostId=' + user?.id);
        setListings(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch host listings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHostListings();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-light-gray hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-airbnb">Hosting</h2>
        </div>
        <nav className="mt-4 px-4 space-y-2">
          <Link to="/host" className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg text-black font-semibold">
            <BarChart2 size={20} /> Dashboard
          </Link>
          <Link to="/host/listings" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-gray-text transition-colors">
            <Home size={20} /> My Listings
          </Link>
          <Link to="/host/messages" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-gray-text transition-colors">
            <MessageSquare size={20} /> Messages
          </Link>
          <Link to="/host/settings" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-gray-text transition-colors">
            <Settings size={20} /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
            <p className="text-gray-text">Manage your listings and track your performance.</p>
          </div>
          <button className="bg-airbnb text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-airbnb-dark transition-colors shadow-md">
            <Plus size={20} /> Create Listing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm">
            <p className="text-gray-text text-sm font-semibold mb-1">Total Earnings</p>
            <h3 className="text-3xl font-bold">$12,450</h3>
            <p className="text-green-500 text-xs mt-2">+12% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm">
            <p className="text-gray-text text-sm font-semibold mb-1">Active Bookings</p>
            <h3 className="text-3xl font-bold">8</h3>
            <p className="text-gray-text text-xs mt-2">Next check-in: Tomorrow</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm">
            <p className="text-gray-text text-sm font-semibold mb-1">Average Rating</p>
            <h3 className="text-3xl font-bold">4.92</h3>
            <p className="text-airbnb text-xs mt-2">Top 5% of hosts</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Your Listings</h2>
        <div className="bg-white border border-light-gray rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-light-gray">
              <tr>
                <th className="p-4 font-semibold text-sm">Listing</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                <th className="p-4 font-semibold text-sm">Price</th>
                <th className="p-4 font-semibold text-sm">Location</th>
                <th className="p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-text">Loading listings...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-text">You don't have any listings yet.</td></tr>
              ) : (
                listings.map(listing => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={listing.photos[0]?.url} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        <span className="font-semibold">{listing.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                    </td>
                    <td className="p-4 font-medium">${listing.pricePerNight}</td>
                    <td className="p-4 text-gray-text">{listing.location}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><Edit size={16} /></button>
                        <button className="p-2 hover:bg-gray-200 rounded-lg text-airbnb transition-colors"><Trash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default HostDashboard;
