import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import HostDashboard from './pages/HostDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Navigate } from 'react-router-dom';

/**
 * A smart router component that renders the appropriate dashboard 
 * based on the user's role (ADMIN or HOST).
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  // Dynamic rendering based on the coming role
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'HOST':
      return <HostDashboard />;
    default:
      // Guests don't have a dashboard, redirect to home
      return <Navigate to="/" />;
  }
};

export default DashboardPage;
