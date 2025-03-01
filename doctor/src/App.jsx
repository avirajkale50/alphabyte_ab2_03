import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import OTPVerification from "./pages/OTPVerification";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/otp" element={<OTPVerification />} />
      </Routes>
    </Router>
  );
};

export default App;
