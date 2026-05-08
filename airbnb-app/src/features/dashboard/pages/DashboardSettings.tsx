import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Bell, Lock, CreditCard, Shield, 
  Mail, Phone, MapPin, Camera, Save, Moon, Sun,
  Globe, ChevronRight, CheckCircle, AlertCircle,
  LogOut, Key
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

import { useProfile } from '../hooks/useProfile';

const DashboardSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { profile: apiProfile, updateProfile, uploadAvatar, isLoading } = useProfile();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'payouts'>('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    language: 'English',
    currency: 'USD',
    timezone: 'America/New_York'
  });

  // Sync with API data
  React.useEffect(() => {
    if (apiProfile) {
      setProfile({
        name: apiProfile.name || user?.name || '',
        email: apiProfile.email || user?.email || '',
        phone: apiProfile.phone || '',
        location: apiProfile.location || '',
        bio: apiProfile.bio || '',
        language: apiProfile.language || 'English',
        currency: apiProfile.currency || 'USD',
        timezone: apiProfile.timezone || 'America/New_York'
      });
    }
  }, [apiProfile, user]);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    bookings: true,
    messages: true,
    payments: true,
    marketing: false,
    reviews: true,
  });

  const handleSave = async () => {
    setSaving(true);
    const res = await updateProfile(profile);
    setSaving(false);
    if (res.success) {
      alert('Settings saved successfully!');
    } else {
      alert('Error: ' + res.error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const res = await uploadAvatar(file);
      setUploading(false);
      if (!res.success) alert(res.error);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences and security</p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-72 space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'payouts', label: 'Payout Methods', icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={16} className={activeTab === tab.id ? 'text-airbnb' : 'text-gray-400'} />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          ))}
          
          <div className="pt-4 mt-2 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Profile Information</h3>
                <p className="text-xs text-gray-500 mt-0.5">Update your personal details</p>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <User size={24} className="text-gray-400" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                    <Camera size={14} /> {uploading ? 'Uploading...' : 'Change Photo'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Full Name</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb">
                      <User size={14} className="text-gray-400" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Email Address</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb">
                      <Mail size={14} className="text-gray-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Phone Number</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb">
                      <Phone size={14} className="text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Location</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb">
                      <MapPin size={14} className="text-gray-400" />
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-700 block mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm focus:outline-none focus:border-airbnb focus:ring-1 focus:ring-airbnb"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Preferred Language</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <Globe size={14} className="text-gray-400" />
                      <select
                        value={profile.language}
                        onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Currency</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <DollarSignIcon size={14} className="text-gray-400" />
                      <select
                        value={profile.currency}
                        onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      >
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                        <option>CAD ($)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Time Zone</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                      <Clock size={14} className="text-gray-400" />
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                      >
                        <option>America/New_York</option>
                        <option>America/Los_Angeles</option>
                        <option>Europe/London</option>
                        <option>Asia/Tokyo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full md:w-auto px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
                <p className="text-xs text-gray-500 mt-0.5">Choose what updates you want to receive</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {[
                  { key: 'bookings', label: 'Booking Confirmations', description: 'Get notified when someone books your property', icon: Bell },
                  { key: 'messages', label: 'New Messages', description: 'Receive alerts for new guest messages', icon: MessageSquare },
                  { key: 'payments', label: 'Payment Updates', description: 'Get notified about payouts and transactions', icon: DollarSignIcon },
                  { key: 'reviews', label: 'Review Alerts', description: 'Get notified when guests leave reviews', icon: Star },
                  { key: 'marketing', label: 'Marketing Emails', description: 'Receive offers and updates from Hostify', icon: Mail },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <item.icon size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-airbnb"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Security Settings</h3>
                <p className="text-xs text-gray-500 mt-0.5">Protect your account</p>
              </div>
              
              <div className="p-5 space-y-5">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Current Password</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb">
                    <Lock size={14} className="text-gray-400" />
                    <input type="password" placeholder="••••••••" className="flex-1 bg-transparent text-sm focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">New Password</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb">
                    <Key size={14} className="text-gray-400" />
                    <input type="password" placeholder="New password" className="flex-1 bg-transparent text-sm focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Confirm New Password</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb">
                    <Key size={14} className="text-gray-400" />
                    <input type="password" placeholder="Confirm new password" className="flex-1 bg-transparent text-sm focus:outline-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                    <p className="text-xs text-gray-500">Toggle between light and dark theme</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
                    {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                    {darkMode ? 'Light' : 'Dark'}
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Security Settings'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Payout Methods Settings */}
          {activeTab === 'payouts' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Payout Methods</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage how you receive payments</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <CreditCard size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Bank Account</p>
                      <p className="text-xs text-gray-500">****1234 - Chase Bank</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 mt-0.5">
                        <CheckCircle size={10} /> Verified
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Default</span>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <CreditCard size={14} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">PayPal</p>
                      <p className="text-xs text-gray-500">host@example.com</p>
                    </div>
                  </div>
                  <button className="text-xs text-airbnb font-medium hover:underline">Set as Default</button>
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <CreditCard size={14} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Stripe</p>
                      <p className="text-xs text-gray-500">Connected account</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 mt-0.5">
                        <AlertCircle size={10} /> Pending verification
                      </span>
                    </div>
                  </div>
                  <button className="text-xs text-airbnb font-medium hover:underline">Complete</button>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  <Plus size={14} /> Add Payout Method
                </button>
              </div>
              
              <div className="bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={12} className="text-emerald-500" />
                  <span>All payouts are protected with bank-level encryption</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Import missing icons at the top
import { Plus, MessageSquare, Star, DollarSign as DollarSignIcon, Clock } from 'lucide-react';

export default DashboardSettings;