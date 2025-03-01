import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton
} from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import OTPVerification from "./pages/OTPVerification";
import ReportsQuestionPage from "./pages/ReportsQuestionPage";
import DoctorDashboard from "./pages/DoctorDashboard";

const App = () => {
  // Replace with your actual Clerk publishable key
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Routes>
          {/* Root route - Redirect to /dashboard if signed in, else show LandingPage */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Navigate to="/dashboard" />
                </SignedIn>
                <SignedOut>
                  <LandingPage />
                </SignedOut>
              </>
            }
          />
          
          {/* Protected routes */}
          <Route
            path="/otp"
            element={
              <>
                <SignedIn>
                  <OTPVerification />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/" />
                </SignedOut>
              </>
            }
          />
          
          <Route
            path="/chat"
            element={
              <>
                <SignedIn>
                  <ReportsQuestionPage />
                </SignedIn>
                <SignedOut> 
                  <Navigate to="/" />
                </SignedOut>
              </>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <DoctorDashboard />
                </SignedIn>
                <SignedOut> 
                  <Navigate to="/" />
                </SignedOut>
              </>
            }
          />
        </Routes>
      </Router>
    </ClerkProvider>
  );
};

export default App;