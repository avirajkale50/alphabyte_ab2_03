import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import LandingPage from './pages/LandingPage'
import PatientOTPPage from './pages/PatientOTPPage'
import PatientDashboard from './pages/PatientDashboard'


const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <SignedIn>
                <Navigate to="/patient-dashboard" />
              </SignedIn>
              <SignedOut>
                <LandingPage />
              </SignedOut>
            </>
          } />
          <Route path="/patient-dashboard" element={
            <>
              <SignedIn>
                <PatientDashboard />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
          } />
          <Route path="/patient-otp" element={
            <>
              <SignedIn>
                <PatientOTPPage />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
          } />
        </Routes>
      </Router>
  )
}

export default App