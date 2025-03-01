import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PatientOTPPage from './pages/PatientOTPPage'
import PatientDashboard from './pages/PatientDashboard'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patient-dashboard" element={<PatientDashboard/>} />
        <Route path="/patient-otp" element={<PatientOTPPage />} />
      </Routes>
    </Router>
  )
}

export default App