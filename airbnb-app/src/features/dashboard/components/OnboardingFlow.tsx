import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import {
  Home, CreditCard, Sparkles, ArrowRight,
  CheckCircle, Shield, X, Star, Camera, Phone, MapPin, Layout, BarChart
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import api from '../../../api/axios';

// ------- Step components ------- //

const StepWelcome: React.FC<{ onNext: () => void; onSkip: () => void }> = ({ onNext, onSkip }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-airbnb rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-airbnb/30">
        <Sparkles size={36} />
      </div>
      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
        Welcome, {user?.name?.split(' ')[0] ?? 'User'} 👋
      </h1>
      <p className="text-gray-500 text-lg mb-10 leading-relaxed">
        Let's get your account ready. Just a few steps to personalize your experience.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10">
        {[
          { icon: <User size={22} />, title: 'Your Profile', desc: 'Add a photo and bio' },
          { icon: <CreditCard size={22} />, title: 'Payments', desc: 'Secure your transactions' },
          { icon: <Layout size={22} />, title: 'Dashboard', desc: 'Manage everything in one place' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="glass-card rounded-2xl p-5 text-left border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-airbnb/10 text-airbnb rounded-xl flex items-center justify-center mb-3">{icon}</div>
            <p className="font-black text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
          Get started <ArrowRight size={18} />
        </button>
        <button onClick={onSkip} className="px-8 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm">
          Skip setup
        </button>
      </div>
    </div>
  );
};

const StepProfile: React.FC<{ onNext: () => void; onSkip: () => void }> = ({ onNext, onSkip }) => {
  const { user } = useAuth();
  const { updateProfile, uploadAvatar, isLoading } = useProfile();
  const [formData, setFormData] = React.useState({
    bio: '',
    phoneNumber: user?.phone || '',
    address: ''
  });
  const [avatar, setAvatar] = React.useState<string | null>(user?.avatar || null);
  const [uploading, setUploading] = React.useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const res = await uploadAvatar(file);
      if (res.success) {
        setAvatar(res.user.avatar);
      }
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    await updateProfile(formData);
    onNext();
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto">
      <div className="relative mb-8 group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gray-100">
          {avatar ? (
            <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
          ) : (
            <User size={64} className="m-auto mt-6 text-gray-300" />
          )}
        </div>
        <label className="absolute bottom-1 right-1 w-10 h-10 bg-airbnb text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg border-2 border-white">
          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={18} />}
        </label>
      </div>

      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create your profile</h1>
      <p className="text-gray-500 text-center mb-8">Tell us a bit about yourself to get started.</p>

      <div className="w-full space-y-4 mb-10">
        <div className="space-y-1">
          <label className="text-xs font-black uppercase text-gray-400 ml-1">Phone Number</label>
          <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb shadow-sm transition-all">
            <Phone size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="+250 788 123 456"
              className="flex-1 bg-transparent text-sm focus:outline-none font-medium"
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black uppercase text-gray-400 ml-1">Address</label>
          <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 focus-within:border-airbnb focus-within:ring-1 focus-within:ring-airbnb shadow-sm transition-all">
            <MapPin size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="City, Country"
              className="flex-1 bg-transparent text-sm focus:outline-none font-medium"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black uppercase text-gray-400 ml-1">Bio</label>
          <textarea
            placeholder="Tell us about your hosting style or travel interests..."
            className="w-full px-4 py-3.5 bg-white rounded-2xl border border-gray-100 focus:border-airbnb focus:ring-1 focus:ring-airbnb shadow-sm transition-all text-sm min-h-[100px] resize-none font-medium"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Continue'} <ArrowRight size={18} />
        </button>
        <button onClick={onSkip} className="px-8 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm">
          Do this later
        </button>
      </div>
    </div>
  );
};

const StepPayment: React.FC<{ onNext: () => void; onSkip: () => void }> = ({ onNext, onSkip }) => {
  const [method, setMethod] = React.useState<'card' | 'paypal' | 'momo' | null>(null);
  const [cardData, setCardData] = React.useState({ number: '', expiry: '', cvv: '' });

  const handleSaveCard = () => {
    localStorage.setItem('hostify_payment_method', JSON.stringify({ type: 'card', ...cardData }));
    onNext();
  };

  return (
    <div className="flex flex-col items-center text-center max-w-xl mx-auto">
      <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/30">
        <CreditCard size={36} />
      </div>
      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Set up payments</h1>
      <p className="text-gray-500 text-lg mb-10">
        Add a payment method to secure your bookings and receive earnings.
      </p>

      {!method ? (
        <div className="w-full space-y-3 mb-10">
          {[
            { id: 'card', label: 'Credit or Debit Card', desc: 'Securely pay with your bank card', icon: <CreditCard size={18} /> },
            { id: 'momo', label: 'Mobile Money', desc: 'MTN, Airtel, M-Pesa and more', icon: <Phone size={18} /> },
            { id: 'paypal', label: 'PayPal', desc: 'Connect your PayPal account', icon: <ArrowRight size={18} /> },
          ].map(({ id, label, desc, icon }) => (
            <button
              key={id}
              onClick={() => setMethod(id as any)}
              className="w-full glass-card rounded-2xl p-5 text-left flex items-center justify-between group hover:border-airbnb hover:ring-1 hover:ring-airbnb transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-airbnb transition-colors">
                  {icon}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-gray-300 group-hover:text-airbnb transition-colors" />
            </button>
          ))}
        </div>
      ) : method === 'card' ? (
        <div className="w-full space-y-4 mb-10 text-left">
          <div className="glass-card rounded-2xl p-6 space-y-4 border border-gray-100">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400">Card Number</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-airbnb text-sm font-mono"
                value={cardData.number}
                onChange={e => setCardData({ ...cardData, number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Expiry</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-airbnb text-sm font-mono"
                  value={cardData.expiry}
                  onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">CVV</label>
                <input
                  type="password"
                  placeholder="***"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-airbnb text-sm font-mono"
                  value={cardData.cvv}
                  onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setMethod(null)} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm">
              Back
            </button>
            <button onClick={handleSaveCard} className="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl text-sm">
              Save Card
            </button>
          </div>
        </div>
      ) : method === 'paypal' ? (
        <div className="w-full space-y-6 mb-10">
          <div className="bg-[#f7f9fa] rounded-3xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-[#0070ba] rounded-2xl flex items-center justify-center text-white mb-4 mx-auto">
              <ArrowRight size={32} />
            </div>
            <p className="text-gray-900 font-bold">Connect your PayPal</p>
            <p className="text-xs text-gray-500 mt-2">You will be redirected to PayPal to verify your account.</p>
          </div>
          <button
            onClick={onNext}
            className="w-full py-4 bg-[#0070ba] text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl text-sm flex items-center justify-center gap-2"
          >
            Connect with PayPal
          </button>
          <button onClick={() => setMethod(null)} className="text-sm font-bold text-gray-400 hover:text-gray-600">
            Choose another method
          </button>
        </div>
      ) : (
        <div className="w-full py-10">
          <button onClick={() => setMethod(null)} className="text-sm font-bold text-airbnb underline">Back to methods</button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 mb-8">
        <Shield size={14} /> Your payment info is encrypted and secured.
      </div>

      {!method && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={onSkip} className="px-8 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm">
            I'll do this later
          </button>
        </div>
      )}
    </div>
  );
};

const StepListing: React.FC<{ onNext: () => void; onSkip: () => void }> = ({ onNext, onSkip }) => {
  const { user } = useAuth();
  const [inProgressListing, setInProgressListing] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await api.get('/listings/draft');
        if (res.data) setInProgressListing(res.data);
      } catch (err) {
        // No draft found
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'HOST') fetchDraft();
    else setLoading(false);
  }, [user]);

  if (user?.role === 'ADMIN') {
    return (
      <div className="flex flex-col items-center text-center max-w-xl mx-auto">
        <div className="w-20 h-20 bg-purple-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-purple-500/30">
          <BarChart size={36} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Welcome, Admin</h1>
        <p className="text-gray-500 text-lg mb-10">
          You have full access to the system. View analytics, manage users, and monitor listings.
        </p>
        <button onClick={onNext} className="flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
          View Analytics <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (user?.role === 'GUEST') {
    return (
      <div className="flex flex-col items-center text-center max-w-xl mx-auto">
        <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-500/30">
          <Home size={36} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Ready to explore?</h1>
        <p className="text-gray-500 text-lg mb-10">
          Find your perfect stay and experience the world like a local.
        </p>
        <button onClick={onNext} className="flex items-center justify-center gap-2 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
          Go to Dashboard <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center max-w-xl mx-auto">
      <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-500/30">
        <Home size={36} />
      </div>
      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Start your listing</h1>
      <p className="text-gray-500 text-lg mb-10">
        Become a host and start earning by sharing your space with travelers.
      </p>

      {inProgressListing ? (
        <div className="w-full space-y-4 mb-10">
          <div className="glass-card rounded-2xl p-5 text-left flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
              <Home size={24} className="text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-gray-900 truncate">{inProgressListing.title || 'Untitled listing'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Started {new Date(inProgressListing.createdAt).toLocaleDateString()} · {inProgressListing.progress || 20}% complete</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                <div className="h-full bg-airbnb rounded-full" style={{ width: `${inProgressListing.progress || 20}%` }} />
              </div>
            </div>
            <button onClick={onNext} className="shrink-0 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black hover:scale-105 transition-all">
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-10 w-full">
          <button onClick={onNext} className="glass-card rounded-2xl p-6 text-left hover:border-airbnb hover:ring-1 hover:ring-airbnb transition-all group">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all"><Home size={20} /></div>
            <p className="font-black text-gray-900 text-sm">Create a new listing</p>
            <p className="text-xs text-gray-400 mt-1">Start from scratch and earn more</p>
          </button>
          <button onClick={onNext} className="glass-card rounded-2xl p-6 text-left hover:border-airbnb hover:ring-1 hover:ring-airbnb transition-all group">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all"><Sparkles size={20} /></div>
            <p className="font-black text-gray-900 text-sm">Listing Assistant</p>
            <p className="text-xs text-gray-400 mt-1">Get AI help for your description</p>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button onClick={onNext} className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
          Go to Dashboard <ArrowRight size={18} />
        </button>
        <button onClick={onSkip} className="px-8 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm">
          Finish later
        </button>
      </div>
    </div>
  );
};

// ------- Orchestrator ------- //

const STEP_INDEX: Record<string, number> = { welcome: 0, profile: 1, payment: 2, listing: 3 };

const OnboardingFlow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, isComplete, goNext, skip } = useOnboarding();

  if (isComplete) return <>{children}</>;

  const progress = ((STEP_INDEX[step] ?? 0) / 4) * 100;

  const content: Record<string, React.ReactNode> = {
    welcome: <StepWelcome onNext={goNext} onSkip={skip} />,
    profile: <StepProfile onNext={goNext} onSkip={skip} />,
    payment: <StepPayment onNext={goNext} onSkip={skip} />,
    listing: <StepListing onNext={goNext} onSkip={skip} />,
  };

  return (
    <div className="min-h-screen dashboard-gradient flex flex-col">
      {/* Fixed background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-airbnb/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-5%] w-[35%] h-[55%] bg-blue-400/10 blur-[100px] rounded-full" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-airbnb rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Skip button */}
      <div className="fixed top-5 right-6 z-50">
        <button onClick={skip} className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
          <X size={14} /> Exit setup
        </button>
      </div>

      {/* Step dots */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {['welcome', 'profile', 'payment', 'listing'].map((s, i) => (
          <div key={s} className={`w-2 h-2 rounded-full transition-all ${step === s ? 'bg-gray-900 w-5' : i < (STEP_INDEX[step] ?? 0) ? 'bg-gray-400' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
          >
            {content[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow;
