import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState } from "react"
import BottomNavigation from "./components/bottom-nav"
import Header from "./components/Header"
import ToastContainer from "./components/ToastContainer"
import { ToastProvider } from "./contexts/ToastContext"
import FightersPage from "./pages/Fighters"
import FighterProfile from "./pages/FighterProfile"
import CoachesPage from "./pages/Coaches"
import AttendancePage from "./pages/Attendance"
import Payments from "./pages/Payments"
import PaymentReceiptPage from "./pages/PaymentReceiptPage"

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-[#492e51]">
          <Header />
          <div className="pb-20">
            <Routes>
              <Route path="/" element={<Navigate to="/fighters" replace />} />
              <Route path="/fighters" element={<FightersPage />} />
              <Route path="/fighters/:id" element={<FighterProfile />} />
              <Route path="/coaches" element={<CoachesPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/:id/receipt" element={<PaymentReceiptPage />} />
              {/* Add more routes as needed */}
            </Routes>
          </div>
          <BottomNavigation />
          <ToastContainer />
        </div>
      </Router>
    </ToastProvider>
  )
}
