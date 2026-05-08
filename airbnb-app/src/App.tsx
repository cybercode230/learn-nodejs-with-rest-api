import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { HomePage, ListingDetailsPage } from './features/listings';
import SearchResultsPage from './features/listings/pages/SearchResultsPage';
import {
  LoginPage,
  RegisterPage,
  OAuthCallback,
  ForgotPasswordPage,
  ResetPasswordPage
} from './features/auth';
import BookingConfirmationPage from './features/bookings/pages/BookingConfirmationPage';
import { AuthProvider } from './contexts/AuthContext';
import { ListingProvider } from './contexts/ListingContext';
import { SearchProvider } from './contexts/SearchContext';
import { PaymentProvider } from './contexts/PaymentContext';
import { ProtectedRoute } from './shared/components';

// Dashboard
import DashboardLayout from './features/dashboard/layouts/DashboardLayout';
import DashboardOverview from './features/dashboard/pages/DashboardOverview';
import DashboardBookings from './features/dashboard/pages/DashboardBookings';
import DashboardListings from './features/dashboard/pages/DashboardListings';
import DashboardMessages from './features/dashboard/pages/DashboardMessages';
import DashboardWallet from './features/dashboard/pages/DashboardWallet';
import DashboardMap from './features/dashboard/pages/DashboardMap';
import DashboardSettings from './features/dashboard/pages/DashboardSettings';
import DashboardHelpCenter from './features/dashboard/pages/DashboardHelpCenter';
import DashboardAnalytics from './features/dashboard/pages/DashboardAnalytics';
import AdminUsers from './features/dashboard/pages/DashboardAdminUsers';
import CreateListingPage from './features/dashboard/pages/CreateListingPage';

function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <ListingProvider>
          <SearchProvider>
            <Router>
              <Routes>
                {/* Public / Guest routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search-results" element={<SearchResultsPage />} />
                  <Route path="/listings/:id" element={<ListingDetailsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/oauth/callback" element={<OAuthCallback />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
                </Route>

                {/* Protected Dashboard routes — ADMIN, HOST & GUEST */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'HOST', 'GUEST']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardOverview />} />
                  <Route path="bookings" element={<DashboardBookings />} />
                  
                  {/* Restricted to HOST and ADMIN */}
                  <Route 
                    path="listings" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'HOST']}>
                        <DashboardListings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="listings/new" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'HOST']}>
                        <CreateListingPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="wallet" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'HOST']}>
                        <DashboardWallet />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="analytics" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'HOST']}>
                        <DashboardAnalytics />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Accessible to ALL dashboard users */}
                  <Route path="messages" element={<DashboardMessages />} />
                  <Route path="map" element={<DashboardMap />} />
                  <Route path="settings" element={<DashboardSettings />} />
                  <Route path="help" element={<DashboardHelpCenter />} />

                  {/* ADMIN ONLY */}
                  <Route 
                    path="users" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminUsers />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
              </Routes>
            </Router>
          </SearchProvider>
        </ListingProvider>
      </PaymentProvider>
    </AuthProvider>
  );
}

export default App;
