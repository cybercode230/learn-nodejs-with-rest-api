import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft,
  Download, History, Banknote, Receipt, Lock, ShieldCheck,
  Calendar, TrendingUp, Home, CheckCircle, AlertCircle, Clock,
  FileText, MoreVertical, Trash2,
  Percent, Filter
} from 'lucide-react';

// Types
interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  paymentMethod?: string;
  bookingId?: string;
  listingName?: string;
  guestName?: string;
  nights?: number;
  platformFee?: number;
  hostReceived?: number;
}

interface PayoutMethod {
  id: string;
  type: 'bank' | 'paypal' | 'stripe';
  name: string;
  details: string;
  isDefault: boolean;
  verified: boolean;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  requestedAt: string;
  estimatedArrival: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: string;
}

interface EarningsData {
  thisWeek: number;
  thisMonth: number;
  totalBookings: number;
  bestListing: string;
  bestListingAmount: number;
  nextPayoutDate: string;
  lastWithdrawal: string;
  platformRevenue?: number;
}

const DashboardWallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'transactions' | 'payouts' | 'settings'>('overview');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showPayoutMenu, setShowPayoutMenu] = useState<string | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  
  // Wallet data
  const balance = 2840.50;
  const pendingBalance = 450.00;
  const totalEarned = 12450.75;
  
  // Earnings analytics
  const earnings: EarningsData = {
    thisWeek: 1240,
    thisMonth: 4280,
    totalBookings: 18,
    bestListing: 'Downtown Luxury Loft',
    bestListingAmount: 2840,
    nextPayoutDate: 'May 18, 2026',
    lastWithdrawal: '$1,000 on May 10',
    platformRevenue: 12450,
  };
  
  // Enhanced transactions with booking details
  const transactions: Transaction[] = [
    { 
      id: '1', type: 'earning', amount: 480, description: 'Booking #B001', 
      date: '2026-05-14', status: 'completed', paymentMethod: 'Stripe',
      bookingId: 'B001', listingName: 'Downtown Loft', guestName: 'Alice Martin',
      nights: 4, platformFee: 48, hostReceived: 432
    },
    { 
      id: '2', type: 'earning', amount: 210, description: 'Booking #B002', 
      date: '2026-05-13', status: 'pending', paymentMethod: 'PayPal',
      bookingId: 'B002', listingName: 'Beach Cottage', guestName: 'James Okonkwo',
      nights: 3, platformFee: 21, hostReceived: 189
    },
    { 
      id: '3', type: 'withdrawal', amount: -1000, description: 'Withdrawal to Bank', 
      date: '2026-05-10', status: 'completed', paymentMethod: 'Bank Transfer' 
    },
    { 
      id: '4', type: 'earning', amount: 600, description: 'Booking #B003', 
      date: '2026-05-08', status: 'completed', paymentMethod: 'Stripe',
      bookingId: 'B003', listingName: 'City Apartment', guestName: 'Sofia Leclerc',
      nights: 5, platformFee: 60, hostReceived: 540
    },
    { 
      id: '5', type: 'refund', amount: -150, description: 'Refund - Early checkout', 
      date: '2026-05-05', status: 'completed' 
    },
    { 
      id: '6', type: 'earning', amount: 750, description: 'Booking #B004', 
      date: '2026-05-01', status: 'completed', paymentMethod: 'Stripe',
      bookingId: 'B004', listingName: 'Mountain View', guestName: 'Michael Chen',
      nights: 5, platformFee: 75, hostReceived: 675
    },
  ];
  
  // Payout methods
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([
    { id: '1', type: 'bank', name: 'Bank Account', details: '****1234 - Chase Bank', isDefault: true, verified: true },
    { id: '2', type: 'paypal', name: 'PayPal', details: 'host@example.com', isDefault: false, verified: true },
    { id: '3', type: 'stripe', name: 'Stripe', details: 'Connected account', isDefault: false, verified: false },
  ]);
  
  // Withdrawal history
  const withdrawals: WithdrawalRequest[] = [
    { id: '1', amount: 1000, requestedAt: '2026-05-10', estimatedArrival: '2026-05-12', status: 'completed', method: 'Bank Transfer' },
    { id: '2', amount: 500, requestedAt: '2026-05-01', estimatedArrival: '2026-05-03', status: 'completed', method: 'PayPal' },
    { id: '3', amount: 2000, requestedAt: '2026-04-20', estimatedArrival: '2026-04-22', status: 'completed', method: 'Bank Transfer' },
  ];
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'failed': return 'text-rose-600 bg-rose-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle size={12} />;
      case 'pending': return <Clock size={12} />;
      case 'failed': return <AlertCircle size={12} />;
      case 'processing': return <Clock size={12} />;
      default: return <AlertCircle size={12} />;
    }
  };
  
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const filteredTransactions = transactions.filter(tx => {
    if (selectedFilter === 'all') return true;
    return tx.type === selectedFilter;
  });
  
  const setDefaultMethod = (id: string) => {
    setPayoutMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };
  
  const deleteMethod = (id: string) => {
    setPayoutMethods(prev => prev.filter(method => method.id !== id));
  };
  
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your earnings, payouts, and transactions</p>
      </div>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <Wallet size={20} className="text-airbnb" />
            <span className="text-xs font-medium text-gray-400">Available Balance</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(balance)}</p>
          <div className="flex items-center gap-2 mt-3">
            <Calendar size={12} className="text-gray-400" />
            <p className="text-xs text-gray-500">Next payout: {earnings.nextPayoutDate}</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <Clock size={20} className="text-amber-500" />
            <span className="text-xs font-medium text-gray-400">Pending Balance</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(pendingBalance)}</p>
          <p className="text-xs text-gray-400 mt-3">Will be available in 1-3 business days</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <DollarSign size={20} className="text-emerald-500" />
            <span className="text-xs font-medium text-gray-400">Total Earned</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalEarned)}</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-emerald-600">↑ +12% from last month</p>
            <p className="text-xs text-gray-400">Last: {earnings.lastWithdrawal}</p>
          </div>
        </motion.div>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-100">
        {[
          { id: 'overview', label: 'Overview', icon: <Wallet size={16} /> },
          { id: 'earnings', label: 'Earnings', icon: <TrendingUp size={16} /> },
          { id: 'transactions', label: 'Transactions', icon: <History size={16} /> },
          { id: 'payouts', label: 'Payouts', icon: <CreditCard size={16} /> },
          { id: 'settings', label: 'Settings', icon: <Lock size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Earnings Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500">This Week</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(earnings.thisWeek)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(earnings.thisMonth)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500">Total Bookings</p>
              <p className="text-lg font-bold text-gray-900">{earnings.totalBookings}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500">Best Listing</p>
              <p className="text-lg font-bold text-gray-900 truncate">{earnings.bestListing}</p>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
              <button onClick={() => setActiveTab('transactions')} className="text-xs text-airbnb font-medium">View all</button>
            </div>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'earning' ? 'bg-emerald-50' : tx.type === 'withdrawal' ? 'bg-rose-50' : 'bg-amber-50'
                    }`}>
                      {tx.type === 'earning' ? (
                        <ArrowDownLeft size={14} className="text-emerald-600" />
                      ) : (
                        <ArrowUpRight size={14} className="text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <p className={`font-semibold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Withdraw Button */}
          <button 
            onClick={() => setActiveTab('payouts')}
            className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <ArrowUpRight size={16} /> Withdraw Funds
          </button>
        </motion.div>
      )}
      
      {/* Earnings Tab - Booking Revenue Breakdown */}
      {activeTab === 'earnings' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Booking Revenue Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Booking Revenue Breakdown</h3>
            <div className="space-y-3">
              {transactions.filter(tx => tx.type === 'earning' && tx.bookingId).map((tx) => (
                <div key={tx.id} className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Home size={14} className="text-airbnb" />
                        <p className="font-semibold text-gray-900 text-sm">{tx.listingName}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {tx.guestName} • {tx.nights} nights • {formatDate(tx.date)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">{formatCurrency(tx.amount)}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(tx.amount + (tx.platformFee || 0))}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Percent size={10} /> Platform fee (10%)
                      </span>
                      <span className="text-rose-500">-{formatCurrency(tx.platformFee || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-gray-100">
                      <span className="font-medium text-gray-700">You received</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(tx.hostReceived || tx.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-airbnb"
            >
              <option value="all">All Transactions</option>
              <option value="earning">Earnings</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="refund">Refunds</option>
            </select>
          </div>
          
          {/* Transactions List */}
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-lg p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'earning' ? 'bg-emerald-50' : tx.type === 'withdrawal' ? 'bg-rose-50' : 'bg-amber-50'
                    }`}>
                      {tx.type === 'earning' ? (
                        <ArrowDownLeft size={18} className="text-emerald-600" />
                      ) : (
                        <ArrowUpRight size={18} className="text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                      {tx.listingName && <p className="text-xs text-gray-500 mt-0.5">{tx.listingName}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                      {getStatusIcon(tx.status)} {getStatusText(tx.status)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
              <History size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </motion.div>
      )}
      
      {/* Payouts Tab - Withdrawal Form & History */}
      {activeTab === 'payouts' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Withdrawal Form */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Request Withdrawal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-airbnb focus:ring-1 focus:ring-airbnb"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Available: {formatCurrency(balance)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Payout Method</label>
                <div className="space-y-2">
                  {payoutMethods.map((method) => (
                    <label key={method.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="radio" name="method" defaultChecked={method.isDefault} className="text-airbnb" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{method.name}</p>
                          {method.isDefault && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Default</span>}
                          {method.verified && <ShieldCheck size={12} className="text-emerald-500" />}
                        </div>
                        <p className="text-xs text-gray-500">{method.details}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <button className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all">
                Request Withdrawal
              </button>
            </div>
          </div>
          
          {/* Withdrawal History */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Withdrawal History</h3>
            <div className="space-y-2">
              {withdrawals.map((wd) => (
                <div key={wd.id} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(wd.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(wd.requestedAt)} • {wd.method}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getStatusColor(wd.status)}`}>
                      {getStatusIcon(wd.status)} {getStatusText(wd.status)}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">Est. {formatDate(wd.estimatedArrival)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Settings Tab - Payout Methods & Security */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Payout Methods */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Payout Methods</h3>
              <button 
                onClick={() => setShowAddMethod(true)}
                className="text-sm text-airbnb font-medium hover:underline"
              >
                + Add Method
              </button>
            </div>
            <div className="space-y-3">
              {payoutMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    {method.type === 'bank' ? <Banknote size={20} className="text-gray-400" /> : <CreditCard size={20} className="text-gray-400" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{method.name}</p>
                        {method.isDefault && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Default</span>}
                        {method.verified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{method.details}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setShowPayoutMenu(showPayoutMenu === method.id ? null : method.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical size={14} />
                    </button>
                    <AnimatePresence>
                      {showPayoutMenu === method.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-10"
                        >
                          {!method.isDefault && (
                            <button onClick={() => setDefaultMethod(method.id)} className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <CheckCircle size={12} /> Set as Default
                            </button>
                          )}
                          <button onClick={() => deleteMethod(method.id)} className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-gray-50 flex items-center gap-2">
                            <Trash2 size={12} /> Remove
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Security Section */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
                <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium">Enable</button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">Identity Verification</p>
                  <p className="text-xs text-gray-500">Verify your identity for higher limits</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
            </div>
          </div>
          
          {/* Tax & Invoices */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Tax & Invoices</h3>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                <Download size={14} /> Download CSV
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                <Receipt size={14} /> Tax Report
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                <FileText size={14} /> Invoice Summary
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardWallet;