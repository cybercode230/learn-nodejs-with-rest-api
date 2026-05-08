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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: 'url("/home/cybercode230/.gemini/antigravity/brain/15faee86-822d-4d04-8893-a11a7e3e6b48/auth_bg_luxury_villa_1778233728137.png")',
          filter: 'brightness(0.6)'
        }}
      />
      
      {/* Animated Gradient Overlay for extra depth */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/40 via-transparent to-black/40 pointer-events-none" />

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-20 w-full max-w-6xl px-4 flex justify-center"
      >
        {children}
      </motion.div>

      {/* Footer Branding (Optional) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/60 text-sm font-medium">
        © 2026 K-Lab Airbnb Pro. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;
