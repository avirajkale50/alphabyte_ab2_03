import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { 
 ClerkProvider, 
 SignedIn, 
 SignedOut, 
 SignInButton, 
 UserButton,
 RedirectToSignIn
} from "@clerk/clerk-react";
import { ClerkLoaded, ClerkLoading } from "@clerk/clerk-react";
import LandingPage from "./pages/LandingPage";
import OTPVerification from "./pages/OTPVerification";
import ReportsQuestionPage from "./pages/ReportsQuestionPage";
import DoctorDashboard from "./pages/DoctorDashboard";

const App = () => {
 // Replace with your actual Clerk publishable key
 const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

 return (
   <ClerkProvider publishableKey={clerkPubKey}>
     <Router>
       <header>
         <SignedOut>
           <SignInButton />
         </SignedOut>
         <SignedIn>
           <UserButton />
         </SignedIn>
       </header>
       <ClerkLoading>
         <div>Loading...</div>
       </ClerkLoading>
       <ClerkLoaded>
         <Routes>
           <Route path="/" element={<LandingPage />} />
           
           {/* Protected routes */}
           <Route
             path="/otp"
             element={
               <>
                 <SignedIn>
                   <OTPVerification />
                 </SignedIn>
                 <SignedOut>
                   <Navigate to="/dashboard" replace />
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
                   <Navigate to="/dashboard" replace />
                 </SignedOut>
               </>
             }
           />
           
           <Route path="/dashboard" element={<DoctorDashboard />} />
         </Routes>
       </ClerkLoaded>
     </Router>
   </ClerkProvider>
 );
};

export default App;