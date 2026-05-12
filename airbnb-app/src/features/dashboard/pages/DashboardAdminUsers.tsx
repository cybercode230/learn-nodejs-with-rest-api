import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, MoreVertical,
  Shield, Crown, Home, Calendar, Mail, Phone,
  ChevronLeft, ChevronRight, Download, RefreshCw,
  Eye, Trash2, CheckCircle, AlertCircle,
} from 'lucide-react';
import api from '../../../api/axios';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: 'HOST' | 'GUEST' | 'ADMIN';
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    listings: number;
    bookings: number;
  };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminUsers: React.FC = () => {
  useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'HOST' | 'GUEST' | 'ADMIN'>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<{ userId: string; currentRole: string } | null>(null);
  const [globalStats, setGlobalStats] = useState<any>(null);

  // Fetch global platform stats
  const fetchGlobalStats = useCallback(async () => {
    try {
      const response = await api.get(`${ENDPOINTS.USERS.BASE}/stats`);
      setGlobalStats(response.data);
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
    }
  }, []);

  // Fetch users with pagination
  const fetchUsers = useCallback(async (page: number, search?: string, role?: string) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (role && role !== 'all') params.role = role;

      const response = await api.get(ENDPOINTS.USERS.BASE, { params });
      setUsers(response.data.data || []);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(meta.page, searchTerm, roleFilter);
    fetchGlobalStats();
  }, [meta.page, searchTerm, roleFilter, fetchGlobalStats]);

  const handlePageChange = (newPage: number) => {
    setMeta(prev => ({ ...prev, page: newPage }));
    setSelectedUsers(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  const handleRoleChange = async (userId: string, newRole: 'HOST' | 'GUEST' | 'ADMIN') => {
    try {
      await api.patch(ENDPOINTS.USERS.ROLE(userId), { role: newRole });
      await fetchUsers(meta.page, searchTerm, roleFilter);
      setShowRoleModal(null);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(ENDPOINTS.USERS.BY_ID(userId));
      await Promise.all([
        fetchUsers(meta.page, searchTerm, roleFilter),
        fetchGlobalStats()
      ]);
      setShowDeleteModal(null);
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.size} users?`)) return;
    
    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedUsers).map(id => api.delete(ENDPOINTS.USERS.BY_ID(id)))
      );
      await Promise.all([
        fetchUsers(1, searchTerm, roleFilter),
        fetchGlobalStats()
      ]);
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Failed to perform bulk delete:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return { label: 'Admin', color: 'bg-purple-100 text-purple-700', icon: Crown };
      case 'HOST': return { label: 'Host', color: 'bg-emerald-100 text-emerald-700', icon: Home };
      default: return { label: 'Guest', color: 'bg-blue-100 text-blue-700', icon: Users };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Username', 'Phone', 'Role', 'Listings', 'Bookings', 'Joined'];
    const rows = users.map(u => [
      u.id, u.name, u.email, u.username, u.phone, u.role, u._count.listings, u._count.bookings, formatDate(u.createdAt)
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRoleCount = (r: string) => globalStats?.byRole?.find((item: any) => item.role === r)?._count?.role || 0;
  
  const statsDisplay = {
    total: globalStats?.totalUsers || 0,
    hosts: getRoleCount('HOST'),
    guests: getRoleCount('GUEST'),
    admins: getRoleCount('ADMIN'),
    totalListings: globalStats?.totalListings || 0,
    totalBookings: globalStats?.totalBookings || 0,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all users in the platform</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => fetchUsers(1, '', 'all')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Users</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{statsDisplay.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Hosts</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{statsDisplay.hosts}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Guests</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{statsDisplay.guests}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Admins</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{statsDisplay.admins}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Listings</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{statsDisplay.totalListings}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bookings</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{statsDisplay.totalBookings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb focus:ring-1 focus:ring-airbnb"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'HOST', 'GUEST', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${roleFilter === role
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-900 rounded-lg p-3 flex items-center justify-between"
          >
            <span className="text-white text-sm font-medium">
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
              >
                <Trash2 size={14} /> Delete Selected
              </button>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-bold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-gray-700">
                    {selectedUsers.size === users.length && users.length > 0 ? (
                      <CheckCircle size={16} className="text-airbnb" />
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded" />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Listings</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Bookings</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Joined</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="animate-pulse flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-100 rounded w-1/4" />
                          <div className="h-2 bg-gray-100 rounded w-1/3" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelectUser(user.id)} className="text-gray-500 hover:text-gray-700">
                          {selectedUsers.has(user.id) ? (
                            <CheckCircle size={16} className="text-airbnb" />
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-airbnb to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Mail size={10} /> {user.email}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone size={10} /> {user.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.color}`}>
                          <RoleIcon size={10} /> {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Home size={12} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{user._count.listings}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          <span className="text-sm text-gray-700">{user._count.bookings}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical size={14} className="text-gray-500" />
                          </button>

                          <AnimatePresence>
                            {actionMenuOpen === user.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden"
                              >
                                <button
                                  onClick={() => {
                                    setShowRoleModal({ userId: user.id, currentRole: user.role });
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Shield size={12} /> Change Role
                                </button>
                                <button
                                  onClick={() => {
                                    // View user details - can open modal
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye size={12} /> View Details
                                </button>
                                {user.role !== 'ADMIN' && (
                                  <button
                                    onClick={() => setShowDeleteModal(user.id)}
                                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Trash2 size={12} /> Delete User
                                  </button>
                                )}
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
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Users size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
              let pageNum = meta.page;
              if (meta.totalPages <= 5) pageNum = i + 1;
              else if (meta.page <= 3) pageNum = i + 1;
              else if (meta.page >= meta.totalPages - 2) pageNum = meta.totalPages - 4 + i;
              else pageNum = meta.page - 2 + i;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${meta.page === pageNum
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRoleModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Change User Role</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select a new role for this user
              </p>
              <div className="space-y-2 mb-5">
                {['HOST', 'GUEST', 'ADMIN'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(showRoleModal.userId, role as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${showRoleModal.currentRole === role
                        ? 'border-airbnb bg-airbnb/5'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <span className="text-sm font-medium text-gray-900">{role}</span>
                    {showRoleModal.currentRole === role && (
                      <CheckCircle size={16} className="text-airbnb" />
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowRoleModal(null)}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(showDeleteModal)}
                    className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;