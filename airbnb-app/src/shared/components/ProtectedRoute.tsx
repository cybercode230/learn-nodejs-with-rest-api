import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton } from './index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * A wrapper component for routes that require authentication.
 * It also supports role-based access control.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // While checking persistence, show a loading state to prevent flashing
  if (isLoading) {
    return (
      <div className="container mx-auto p-12 space-y-8 animate-pulse">
        <Skeleton height={40} width="40%" />
        <Skeleton height={200} className="rounded-3xl" />
        <div className="grid grid-cols-3 gap-8">
          <Skeleton height={150} />
          <Skeleton height={150} />
          <Skeleton height={150} />
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role-based access is required, check if user has the correct role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If they don't have access, redirect to their default home or home page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
