import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import type { User } from '../../../shared/types';
import { Users, Layout, Shield, AlertTriangle, Search, Filter } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [listingsCount, setListingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, listingsRes] = await Promise.all([
          api.get('/users'),
          api.get('/listings')
        ]);
        setUsers(usersRes.data.data || []);
        setListingsCount(listingsRes.data.count || 0);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-airbnb" /> Admin Panel
          </h2>
        </div>
        <nav className="mt-4 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-airbnb rounded-lg text-white font-semibold">
            <Users size={20} /> User Management
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
            <Layout size={20} /> System Listings
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
            <AlertTriangle size={20} /> Reports
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">System Overview</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-10 pr-4 py-2 border border-light-gray rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-airbnb"
              />
            </div>
            <button className="p-2 bg-white border border-light-gray rounded-xl"><Filter size={18} /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm">
            <p className="text-gray-text text-sm font-semibold mb-1">Total Users</p>
            <h3 className="text-2xl font-bold">{users.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm">
            <p className="text-gray-text text-sm font-semibold mb-1">Total Listings</p>
            <h3 className="text-2xl font-bold">{listingsCount}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm">
            <p className="text-gray-text text-sm font-semibold mb-1">Monthly Revenue</p>
            <h3 className="text-2xl font-bold">$142,800</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm">
            <p className="text-gray-text text-sm font-semibold mb-1">Pending Approvals</p>
            <h3 className="text-2xl font-bold">14</h3>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">User Directory</h2>
        <div className="bg-white border border-light-gray rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-light-gray">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} alt="" />
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                        u.role === 'HOST' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button className="text-airbnb font-bold hover:underline">Manage</button>
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

export default AdminDashboard;
