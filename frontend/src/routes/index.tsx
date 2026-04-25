import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { BookingFlowProvider } from '@/contexts/BookingFlowContext'

// Auth Pages
import SignInPage from '@/pages/auth/SignInPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

// Booking Flow Pages
import { LandingPage } from '@/pages/booking/landing-page'
import { ResultsPage } from '@/pages/booking/results-page'
import { BookingPage } from '@/pages/booking/booking-page'
import { PaymentPage } from '@/pages/booking/payment-page'
import { ConfirmationPage } from '@/pages/booking/confirmation-page'
import { AuthPage } from '@/pages/booking/login-page'

// Customer Pages
import BookingsPage from '@/pages/bookings/BookingsPage'
import BookingDetailPage from '@/pages/bookings/BookingDetailPage'
import CheckInPage from '@/pages/CheckInPage'
import ProfilePage from '@/pages/ProfilePage'
import NotificationsPage from '@/pages/NotificationsPage'
import NotificationSettingsPage from '@/pages/settings/NotificationSettingsPage'
import RefundsPage from '@/pages/RefundsPage'

// Admin Pages
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminBookingsPage from '@/pages/admin/AdminBookingsPage'
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage'
import AdminNotificationsPage from '@/pages/admin/AdminNotificationsPage'
import AdminAirlinesPage from '@/pages/admin/AdminAirlinesPage'
import AdminAirportsPage from '@/pages/admin/AdminAirportsPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminSystemPage from '@/pages/admin/AdminSystemPage'
import AdminDataPage from '@/pages/admin/AdminDataPage'
import AdminMasterDataPage from '@/pages/admin/AdminMasterDataPage'

// Airline Staff Pages
import AirlineLayout from '@/pages/airline/AirlineLayout'
import AirlineDashboardPage from '@/pages/airline/AirlineDashboardPage'
import AirlineFlightsPage from '@/pages/airline/AirlineFlightsPage'
import AirlineFlightAddPage from '@/pages/airline/AirlineFlightAddPage'
import AirlineFlightEditPage from '@/pages/airline/AirlineFlightEditPage'
import AirlineSeatsPage from '@/pages/airline/AirlineSeatsPage'
import AirlineOperationsPage from '@/pages/airline/AirlineOperationsPage'
import AirlineAnalyticsPage from '@/pages/airline/AirlineAnalyticsPage'

// Staff Pages
import StaffLayout from '@/pages/staff/StaffLayout'
import StaffDashboardPage from '@/pages/staff/StaffDashboardPage'

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BookingFlowProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/auth/signin" element={<SignInPage />} />
            <Route path="/auth/signup" element={<SignUpPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/login" element={<AuthPage mode="signin" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            
            {/* Booking Flow Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            
            {/* Customer Routes */}
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/bookings/:id" element={<BookingDetailPage />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
            <Route path="/refunds" element={<RefundsPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="airlines" element={<AdminAirlinesPage />} />
              <Route path="airports" element={<AdminAirportsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="system" element={<AdminSystemPage />} />
              <Route path="data" element={<AdminDataPage />} />
              <Route path="master-data" element={<AdminMasterDataPage />} />
            </Route>

            {/* Airline Staff Routes */}
            <Route path="/airline" element={<AirlineLayout />}>
              <Route index element={<AirlineDashboardPage />} />
              <Route path="dashboard" element={<AirlineDashboardPage />} />
              <Route path="flights" element={<AirlineFlightsPage />} />
              <Route path="flights/add" element={<AirlineFlightAddPage />} />
              <Route path="flights/edit/:id" element={<AirlineFlightEditPage />} />
              <Route path="seats" element={<AirlineSeatsPage />} />
              <Route path="operations" element={<AirlineOperationsPage />} />
              <Route path="analytics" element={<AirlineAnalyticsPage />} />
            </Route>

            {/* Staff Routes */}
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffDashboardPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </BrowserRouter>
      </BookingFlowProvider>
    </AuthProvider>
  )
}
