import React from 'react';
import Navbar from '../shared/components/Navbar/Navbar';
import { Footer } from '../shared/components';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const authPaths = ['/login', '/register', '/forgot-password', '/auth/reset-password', '/oauth/callback'];
  const isAuthPage = authPaths.some(path => location.pathname.includes(path));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
};

export default MainLayout;
