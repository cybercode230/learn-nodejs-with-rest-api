import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useOnboarding } from '../hooks/useOnboarding';
import {
  Home, CreditCard, Sparkles, ArrowRight,
  CheckCircle, Shield, X, Star
} from 'lucide-react';

// ------- Step components ------- //

const StepWelcome: React.FC<{ onNext: () => void; onSkip: () => void }> = ({ onNext, onSkip }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center text-center max-w-xl mx-auto">
      <div className="w-20 h-20 bg-airbnb rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-airbnb/30">
        <Sparkles size={36} />
      </div>
      <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
        Welcome, {user?.name?.split(' ')[0] ?? 'Host'} 👋
      </h1>
      <p className="text-gray-500 text-lg mb-10 leading-relaxed">
        You're one step away from sharing your space with the world. Let's get your account ready in just a few steps.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10">
        {[
          { icon: <Home size={22} />, title: 'List your space', desc: 'Add your property details and photos' },
          { icon: <CreditCard size={22} />, title: 'Set up payments', desc: 'Choose how you receive your earnings' },
          { icon: <Star size={22} />, title: 'Start hosting', desc: 'Get booked and earn great reviews' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="glass-card rounded-2xl p-5 text-left">
            <div className="w-10 h-10 bg-airbnb/10 text-airbnb rounded-xl flex items-center justify-center mb-3">{icon}</div>
            <p className="font-black text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
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

const StepPayment: React.FC<{ onNext: () => void; onSkip: () => void }> = ({ onNext, onSkip }) => (
  <div className="flex flex-col items-center text-center max-w-xl mx-auto">
    <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-emerald-500/30">
      <CreditCard size={36} />
    </div>
    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Set up payments</h1>
    <p className="text-gray-500 text-lg mb-10">
      Add a payout method so you can receive your earnings directly when guests book your space.
    </p>

    <div className="w-full space-y-3 mb-10">
      {[
        { label: 'Bank Transfer', desc: 'Funds sent directly to your bank account', badge: 'Recommended' },
        { label: 'Mobile Money', desc: 'MTN, Airtel, M-Pesa and more', badge: null },
        { label: 'PayPal', desc: 'Receive to your PayPal account', badge: null },
      ].map(({ label, desc, badge }) => (
        <button key={label} className="w-full glass-card rounded-2xl p-5 text-left flex items-center justify-between group hover:border-gray-900 hover:border transition-all">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-gray-900 text-sm">{label}</p>
              {badge && <span className="text-[10px] bg-airbnb/10 text-airbnb font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{badge}</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </div>
          <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
        </button>
      ))}
    </div>

    <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
      <Shield size={14} /> Your payment info is encrypted and secured.
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <button onClick={onNext} className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
        Continue <ArrowRight size={18} />
      </button>
      <button onClick={onSkip} className="px-8 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm">
        I'll do this later
      </button>
    </div>
  </div>
);

const StepListing: React.FC<{ onNext: () => void; onSkip: () => void }> = ({ onNext, onSkip }) => (
  <div className="flex flex-col items-center text-center max-w-xl mx-auto">
    <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-500/30">
      <Home size={36} />
    </div>
    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Finish your listing</h1>
    <p className="text-gray-500 text-lg mb-10">
      You have a listing in progress. Complete it to start receiving bookings.
    </p>

    <div className="w-full space-y-4 mb-10">
      {/* Saved listing card */}
      <div className="glass-card rounded-2xl p-5 text-left flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
          <Home size={24} className="text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 truncate">Your House listing</p>
          <p className="text-xs text-gray-500 mt-0.5">Started May 6, 2026 · 60% complete</p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
            <div className="h-full w-[60%] bg-airbnb rounded-full" />
          </div>
        </div>
        <button onClick={onNext} className="shrink-0 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-black hover:scale-105 transition-all">
          Continue
        </button>
      </div>

      {/* New listing options */}
      <div className="grid grid-cols-2 gap-3">
        <button className="glass-card rounded-2xl p-5 text-left hover:border-gray-900 hover:border transition-all group">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3"><Home size={16} /></div>
          <p className="font-black text-gray-900 text-sm">Create a new listing</p>
          <p className="text-xs text-gray-400 mt-1">Start fresh</p>
        </button>
        <button className="glass-card rounded-2xl p-5 text-left hover:border-gray-900 hover:border transition-all group">
          <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-3"><CheckCircle size={16} /></div>
          <p className="font-black text-gray-900 text-sm">From existing</p>
          <p className="text-xs text-gray-400 mt-1">Duplicate a listing</p>
        </button>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <button onClick={onNext} className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl">
        Go to Dashboard <ArrowRight size={18} />
      </button>
      <button onClick={onSkip} className="px-8 py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm">
        Exit
      </button>
    </div>
  </div>
);

// ------- Orchestrator ------- //

const STEP_INDEX: Record<string, number> = { welcome: 0, payment: 1, listing: 2 };

const OnboardingFlow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, isComplete, goNext, skip } = useOnboarding();

  if (isComplete) return <>{children}</>;

  const progress = ((STEP_INDEX[step] ?? 0) / 3) * 100;

  const content: Record<string, React.ReactNode> = {
    welcome: <StepWelcome onNext={goNext} onSkip={skip} />,
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
        {['welcome', 'payment', 'listing'].map((s, i) => (
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
