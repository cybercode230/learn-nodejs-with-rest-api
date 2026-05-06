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
import { DashboardPage } from './features/Dashboard';
import BookingConfirmationPage from './features/bookings/pages/BookingConfirmationPage';
import { AuthProvider } from './contexts/AuthContext';
import { ListingProvider } from './contexts/ListingContext';
import { ProtectedRoute } from './shared/components';

function App() {
  return (
    <AuthProvider>
      <ListingProvider>
        <Router>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search-results" element={<SearchResultsPage />} />
              <Route path="/listings/:id" element={<ListingDetailsPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
            </Route>

            {/* Protected Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HOST']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ListingProvider>
    </AuthProvider>
  );
}

export default App;
