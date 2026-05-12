import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft,
  Download, History, Banknote, ShieldCheck,
  Calendar, Home, CheckCircle, AlertCircle, Clock,
  FileText, MoreVertical, Filter,
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
}

const DashboardWallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'transactions' | 'payouts' | 'settings'>('overview');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showPayoutMenu, setShowPayoutMenu] = useState<string | null>(null);
  
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
  };
  
  // Transactions
  const transactions: Transaction[] = [
    { id: '1', type: 'earning', amount: 480, description: 'Booking #B001', date: '2026-05-14', status: 'completed', paymentMethod: 'Stripe', bookingId: 'B001', listingName: 'Downtown Loft', guestName: 'Alice Martin', nights: 4, platformFee: 48, hostReceived: 432 },
    { id: '2', type: 'earning', amount: 210, description: 'Booking #B002', date: '2026-05-13', status: 'pending', paymentMethod: 'PayPal', bookingId: 'B002', listingName: 'Beach Cottage', guestName: 'James Okonkwo', nights: 3, platformFee: 21, hostReceived: 189 },
    { id: '3', type: 'withdrawal', amount: -1000, description: 'Withdrawal to Bank', date: '2026-05-10', status: 'completed', paymentMethod: 'Bank Transfer' },
    { id: '4', type: 'earning', amount: 600, description: 'Booking #B003', date: '2026-05-08', status: 'completed', paymentMethod: 'Stripe', bookingId: 'B003', listingName: 'City Apartment', guestName: 'Sofia Leclerc', nights: 5, platformFee: 60, hostReceived: 540 },
    { id: '5', type: 'refund', amount: -150, description: 'Refund - Early checkout', date: '2026-05-05', status: 'completed' },
    { id: '6', type: 'earning', amount: 750, description: 'Booking #B004', date: '2026-05-01', status: 'completed', paymentMethod: 'Stripe', bookingId: 'B004', listingName: 'Mountain View', guestName: 'Michael Chen', nights: 5, platformFee: 75, hostReceived: 675 },
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatCurrencyDec = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700';
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'failed': return 'bg-rose-50 text-rose-600';
      case 'processing': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle size={10} />;
      case 'pending': return <Clock size={10} />;
      case 'failed': return <AlertCircle size={10} />;
      case 'processing': return <Clock size={10} />;
      default: return <AlertCircle size={10} />;
    }
  };
  
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        <h1 className="text-xl font-semibold text-gray-900">Wallet</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage your earnings and payouts</p>
      </div>
      
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <Wallet size={18} className="text-airbnb" />
            <span className="text-[10px] font-medium text-gray-400">Available</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrencyDec(balance)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Calendar size={10} className="text-gray-400" />
            <p className="text-[10px] text-gray-400">Next: {earnings.nextPayoutDate}</p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl p-4 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock size={18} className="text-amber-500" />
            <span className="text-[10px] font-medium text-gray-400">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrencyDec(pendingBalance)}</p>
          <p className="text-[10px] text-gray-400 mt-2">Available in 1-3 days</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={18} className="text-emerald-500" />
            <span className="text-[10px] font-medium text-gray-400">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrencyDec(totalEarned)}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-emerald-600">↑ +12%</span>
            <span className="text-[10px] text-gray-400">Last: {earnings.lastWithdrawal}</span>
          </div>
        </motion.div>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-0.5 border-b border-gray-100">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'earnings', label: 'Earnings' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'payouts', label: 'Payouts' },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${
              activeTab === tab.id
                ? 'text-airbnb border-b-2 border-airbnb'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] font-medium text-gray-400">This Week</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(earnings.thisWeek)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] font-medium text-gray-400">This Month</p>
              <p className="text-base font-bold text-gray-900">{formatCurrency(earnings.thisMonth)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] font-medium text-gray-400">Bookings</p>
              <p className="text-base font-bold text-gray-900">{earnings.totalBookings}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <p className="text-[10px] font-medium text-gray-400">Best Listing</p>
              <p className="text-xs font-semibold text-gray-900 truncate">{earnings.bestListing}</p>
            </div>
          </div>
          
          {/* Recent */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-900">Recent</h3>
              <button onClick={() => setActiveTab('transactions')} className="text-[10px] font-medium text-airbnb">View all</button>
            </div>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      tx.type === 'earning' ? 'bg-emerald-50' : tx.type === 'withdrawal' ? 'bg-rose-50' : 'bg-amber-50'
                    }`}>
                      {tx.type === 'earning' ? <ArrowDownLeft size={12} className="text-emerald-600" /> : <ArrowUpRight size={12} className="text-rose-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-xs">{tx.description}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <p className={`font-semibold text-xs ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <button onClick={() => setActiveTab('payouts')} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
            <ArrowUpRight size={12} /> Withdraw
          </button>
        </motion.div>
      )}
      
      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-900">Breakdown</h3>
          <div className="space-y-3">
            {transactions.filter(tx => tx.type === 'earning' && tx.bookingId).slice(0, 5).map((tx) => (
              <div key={tx.id} className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Home size={12} className="text-airbnb" />
                    <p className="font-medium text-gray-800 text-xs">{tx.listingName}</p>
                  </div>
                  <p className="font-bold text-gray-900 text-xs">{formatCurrency(tx.amount)}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{tx.guestName} • {tx.nights} nights</p>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Fee (10%)</span>
                  <span className="text-rose-500">-{formatCurrency(tx.platformFee || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] mt-1">
                  <span className="font-medium text-gray-600">You received</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(tx.hostReceived || tx.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-gray-400" />
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="text-xs border border-gray-200 rounded-md px-2 py-1">
              <option value="all">All</option>
              <option value="earning">Earnings</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="refund">Refunds</option>
            </select>
          </div>
          
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'earning' ? 'bg-emerald-50' : tx.type === 'withdrawal' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                    {tx.type === 'earning' ? <ArrowDownLeft size={14} className="text-emerald-600" /> : <ArrowUpRight size={14} className="text-rose-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-xs">{tx.description}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-xs ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)} {getStatusText(tx.status)}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10"><History size={24} className="text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-500">No transactions</p></div>
          )}
        </motion.div>
      )}
      
      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Withdraw</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Amount</label>
                <div className="relative mt-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span><input type="number" placeholder="0.00" className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm" /></div>
                <p className="text-[10px] text-gray-400 mt-1">Available: {formatCurrencyDec(balance)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Method</label>
                <div className="space-y-1.5 mt-1">
                  {payoutMethods.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="method" defaultChecked={m.isDefault} className="text-airbnb" size={12} />
                      <div className="flex-1"><p className="font-medium text-gray-800 text-xs">{m.name} {m.isDefault && <span className="text-[9px] bg-gray-100 px-1 ml-1 rounded">Default</span>}</p><p className="text-[10px] text-gray-400">{m.details}</p></div>
                    </label>
                  ))}
                </div>
              </div>
              <button className="w-full py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800">Request</button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-gray-900 mb-2">History</h3>
            <div className="space-y-2">
              {withdrawals.map((wd) => (
                <div key={wd.id} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                  <div><p className="font-medium text-gray-800 text-xs">{formatCurrency(wd.amount)}</p><p className="text-[10px] text-gray-400">{formatDate(wd.requestedAt)} • {wd.method}</p></div>
                  <div className="text-right"><span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(wd.status)}`}>{getStatusIcon(wd.status)} {getStatusText(wd.status)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-3"><h3 className="text-sm font-semibold text-gray-900">Methods</h3><button className="text-xs text-airbnb">+ Add</button></div>
            <div className="space-y-2">
              {payoutMethods.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-2">{m.type === 'bank' ? <Banknote size={16} className="text-gray-400" /> : <CreditCard size={16} className="text-gray-400" />}
                    <div><p className="font-medium text-gray-800 text-xs">{m.name} {m.isDefault && <span className="text-[9px] bg-gray-100 px-1 ml-1 rounded">Default</span>}</p><p className="text-[10px] text-gray-400">{m.details}</p></div>
                  </div>
                  <div className="relative"><button onClick={() => setShowPayoutMenu(showPayoutMenu === m.id ? null : m.id)} className="p-1"><MoreVertical size={12} /></button>
                    <AnimatePresence>{showPayoutMenu === m.id && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-full mt-1 w-28 bg-white rounded-md shadow-lg border z-10">{!m.isDefault && <button onClick={() => setDefaultMethod(m.id)} className="w-full px-2 py-1.5 text-left text-[10px] hover:bg-gray-50">Set Default</button>}<button onClick={() => deleteMethod(m.id)} className="w-full px-2 py-1.5 text-left text-[10px] text-rose-600 hover:bg-gray-50">Remove</button></motion.div>)}</AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100"><h3 className="text-sm font-semibold text-gray-900 mb-2">Security</h3><div className="flex justify-between items-center"><div><p className="text-xs font-medium text-gray-800">2FA</p><p className="text-[10px] text-gray-400">Extra security</p></div><button className="px-2 py-1 bg-gray-900 text-white rounded text-[10px]">Enable</button></div><div className="flex justify-between items-center mt-2"><div><p className="text-xs font-medium text-gray-800">Identity</p><p className="text-[10px] text-gray-400">Verified</p></div><ShieldCheck size={14} className="text-emerald-500" /></div></div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100"><h3 className="text-sm font-semibold text-gray-900 mb-2">Reports</h3><div className="flex gap-2"><button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[10px]"><Download size={10} /> CSV</button><button className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-[10px]"><FileText size={10} /> Tax</button></div></div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardWallet;