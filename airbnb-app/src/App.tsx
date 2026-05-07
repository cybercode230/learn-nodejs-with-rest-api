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



function App() {
  return (
    <AuthProvider>
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

              {/* Protected Dashboard routes — HOST & ADMIN */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'HOST']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                {/* Placeholder routes — pages will be added incrementally */}
                <Route path="bookings" element={<DashboardBookings />} />
                <Route path="listings" element={<DashboardListings />} />
                <Route path="messages" element={<DashboardMessages />} />
                <Route path="wallet" element={<DashboardWallet />} />
                <Route path="map" element={<DashboardMap />} />
                <Route path="settings" element={<DashboardSettings />} />
                <Route path="help" element={<DashboardHelpCenter />} />
                <Route path="analytics" element={<DashboardAnalytics />} />
              </Route>
            </Routes>
          </Router>
        </SearchProvider>
      </ListingProvider>
    </AuthProvider>
  );
}

export default App;
