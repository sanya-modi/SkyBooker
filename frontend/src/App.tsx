import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/auth-context'
import { BookingFlowProvider } from './context/booking-flow-context'
import { AdminPage } from './pages/admin-page'
import { BookingPage } from './pages/booking/booking-page'
import { ConfirmationPage } from './pages/booking/confirmation-page'
import { LandingPage } from './pages/booking/landing-page'
import { AuthPage } from './pages/booking/login-page'
import { PaymentPage } from './pages/booking/payment-page'
import { ResultsPage } from './pages/booking/results-page'
import { PassengerPage } from './pages/passenger-page'
import { StaffPage } from './pages/staff-page'
import { SupportPage } from './pages/support-page'

function App() {
  return (
    <AuthProvider>
      <BookingFlowProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/login" element={<AuthPage mode="signin" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/ogin" element={<Navigate replace to="/login" />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/passenger" element={<PassengerPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </BrowserRouter>
      </BookingFlowProvider>
    </AuthProvider>
  )
}

export default App
