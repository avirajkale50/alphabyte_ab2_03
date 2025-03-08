import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import OTPVerification from "./pages/OTPVerification";
import ReportsQuestionPage from "./pages/ReportsQuestionPage";
import DoctorDashboard from "./pages/DoctorDashboard";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <SignedIn>
          <Navigate to="/dashboard" />
        </SignedIn>
        <SignedOut>
          <LandingPage />
        </SignedOut>
      </>
    ),
  },
  {
    path: "/otp",
    element: (
      <>
        <SignedIn>
          <OTPVerification />
        </SignedIn>
        <SignedOut>
          <Navigate to="/" />
        </SignedOut>
      </>
    ),
  },
  {
    path: "/chat/:patientUsername",
    element: (
      <>
        <SignedIn>
          <ReportsQuestionPage />
        </SignedIn>
        <SignedOut>
          <Navigate to="/" />
        </SignedOut>
      </>
    ),
  },
  {
    path: "/chat",
    element: (
      <>
        <SignedIn>
          <ReportsQuestionPage />
        </SignedIn>
        <SignedOut>
          <Navigate to="/" />
        </SignedOut>
      </>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <>
        <SignedIn>
          <DoctorDashboard />
        </SignedIn>
        <SignedOut>
          <Navigate to="/" />
        </SignedOut>
      </>
    ),
  },
]);

const App = () => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <RouterProvider router={router} />
    </ClerkProvider>
  );
};

export default App;