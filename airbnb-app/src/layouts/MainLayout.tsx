import React from 'react';
import Navbar from '../components/layout/Navbar';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {/* Footer can be added here later */}
    </div>
  );
};

export default MainLayout;
