import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import UpdatePrompt from './components/UpdatePrompt';
import Header from './components/Header';
import BottomNavigation from './components/bottom-nav';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import ChangeUsername from './pages/ChangeUsername';
import Fighters from './pages/Fighters';
import FighterProfile from './pages/FighterProfile';
import Coaches from './pages/Coaches';
import Attendance from './pages/Attendance';
import PrivateSessions from './pages/PrivateSessions';
import PrivateSessionHistory from './pages/PrivateSessionHistory';
import Payments from './pages/Payments';
import PaymentReceiptPage from './pages/PaymentReceiptPage';
/**
 * Main App Component
 * Implements authentication with protected routes
 */
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Routes>
              {/* Public Route - Login */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex flex-col min-h-screen">
                      {/* Header */}
                      <Header />

                      {/* Main Content */}
                      <main 
                        className="flex-1 pb-20 md:pb-6"
                      >
                        <Routes>
                          {/* Redirect root to fighters */}
                          <Route path="/" element={<Navigate to="/fighters" replace />} />

                          {/* Fighter Routes */}
                          <Route path="/fighters" element={<Fighters />} />
                          <Route path="/fighters/:id" element={<FighterProfile />} />

                          {/* Coach Routes */}
                          <Route path="/coaches" element={<Coaches />} />

                          {/* Attendance Routes */}
                          <Route path="/attendance" element={<Attendance />} />
                          
                          {/* Private Sessions Routes */}
                          <Route path="/private-sessions" element={<PrivateSessions />} />
                          <Route path="/private-sessions/history" element={<PrivateSessionHistory />} />

                          {/* Payment Routes */}
                          <Route path="/payments" element={<Payments />} />
                          <Route path="/payments/:id/receipt" element={<PaymentReceiptPage />} />

                          {/* Settings Routes */}
                          <Route path="/change-password" element={<ChangePassword />} />
                          <Route path="/change-username" element={<ChangeUsername />} />

                          {/* 404 - Redirect to fighters */}
                          <Route path="*" element={<Navigate to="/fighters" replace />} />
                        </Routes>
                      </main>

                      {/* Bottom Navigation (Mobile) */}
                      <BottomNavigation />
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>

            {/* Update Prompt for PWA */}
            <UpdatePrompt />

            {/* Global Toast Notifications */}
            <ToastContainer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}