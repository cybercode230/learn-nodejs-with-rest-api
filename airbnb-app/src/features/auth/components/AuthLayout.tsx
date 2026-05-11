import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * File: AuthLayout.tsx
 * What it is doing: Provides a consistent, premium visual wrapper for all authentication pages.
 * Responsibility: Rendering a high-quality background image with a sophisticated overlay and centering the auth content.
 * Outcomes: Enhanced brand identity, premium user experience, and visual consistency across login, register, and reset flows.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-white">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-airbnb/10 via-white to-white" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        
        {/* Floating gradient orbs for depth */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-airbnb/20 rounded-full blur-[100px] opacity-50"
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px] opacity-40"
        />
      </div>
      
      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-20 w-full max-w-6xl px-4 flex justify-center"
      >
        {children}
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-gray-400 text-sm font-medium">
        © 2026 K-Lab Airbnb Pro. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;
