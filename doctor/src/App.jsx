import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import OTPVerification from "./pages/OTPVerification";
import ReportsQuestionPage from "./pages/ReportsQuestionPage";
import DoctorDashboard from "./pages/DoctorDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/chat" element={<ReportsQuestionPage />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
