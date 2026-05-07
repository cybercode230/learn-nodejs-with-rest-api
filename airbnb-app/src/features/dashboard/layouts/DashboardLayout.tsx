import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import OnboardingFlow from '../components/OnboardingFlow';

const DashboardLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <OnboardingFlow>
      <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <DashboardSidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(c => !c)}
          />

          {/* Main column */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header with toggle */}
            <DashboardHeader 
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed(c => !c)}
            />

            {/* Scrollable content */}
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6">
              <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      </div>
    </OnboardingFlow>
  );
};

export default DashboardLayout;