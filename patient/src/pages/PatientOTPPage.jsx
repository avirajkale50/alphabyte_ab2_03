import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react"; // Import Clerk's useUser hook
import DriveButton from "./DriveButton";

const PatientOTPPage = () => {
  const [generatedOTP, setGeneratedOTP] = useState(null);
  const [showOTPCard, setShowOTPCard] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [linkStatus, setLinkStatus] = useState({ success: false, message: '' });
  const [otpExpiration, setOtpExpiration] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [activeSession, setActiveSession] = useState(null);
  
  // Use Clerk's useUser hook to get the authenticated user
  const { user } = useUser();

  // Periodically check for active sessions
  useEffect(() => {
    const checkSession = async () => {
      if (!user?.username) return;
      
      try {
        const response = await axios.get(`http://localhost:3000/api/session-status?patientUsername=${user.username}`);
        if (response.data.success && response.data.active) {
          setActiveSession({
            doctorUsername: response.data.doctor_username,
            expiresIn: response.data.expires_in
          });
        } else if (!response.data.active && activeSession) {
          setActiveSession(null);
        }
      } catch (error) {
        console.error("Error checking session status:", error);
      }
    };

    // Check initially
    checkSession();
    
    // Set up interval to check every 5 seconds
    const interval = setInterval(checkSession, 5000);
    
    return () => clearInterval(interval);
  }, [user, activeSession]);

  // Handle drive link validation
  const handleDriveLinkChange = (e) => {
    const link = e.target.value;
    setDriveLink(link);
    // Basic validation for Google Drive link
    const isValid = link.includes("drive.google.com");
    setIsLinkValid(isValid);
    if (isValid) {
      setLinkStatus({
        success: true,
        message: 'Drive link validated successfully!'
      });
    } else {
      setLinkStatus({
        success: false,
        message: ''
      });
    }
  };

  // Handle OTP generation
  const handleGenerateOTP = async () => {
    if (!user) {
      alert("Please log in to generate an OTP.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/generate-otp', {
        patientUsername: user.username // Use Clerk's username instead of ID
      });
      
      if (response.data.success) {
        setGeneratedOTP(response.data.otp);
        setShowOTPCard(true);
        
        // Set expiration time
        const expiresIn = response.data.expiresIn || 30;
        setCountdown(expiresIn);
        setOtpExpiration(new Date(new Date().getTime() + expiresIn * 1000));
      }
    } catch (error) {
      console.error("Error generating OTP:", error);
    }
  };

  // Countdown timer for OTP expiration
  useEffect(() => {
    let timer;
    if (otpExpiration) {
      timer = setInterval(() => {
        const now = new Date();
        const secondsLeft = Math.floor((otpExpiration - now) / 1000);
        
        if (secondsLeft <= 0) {
          clearInterval(timer);
          setCountdown(0);
          setGeneratedOTP(null);
          setShowOTPCard(false);
        } else {
          setCountdown(secondsLeft);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpExpiration]);

  const handleRefreshOTP = () => {
    handleGenerateOTP();
  };

  const handleExpireSession = async () => {
    if (!user) {
      alert("Please log in to expire the session.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/end-session', {
        patientUsername: user.username
      });
      
      if (response.data.success) {
        setGeneratedOTP(null);
        setShowOTPCard(false);
        setOtpExpiration(null);
        setActiveSession(null);
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleCopyOTP = () => {
    navigator.clipboard.writeText(generatedOTP);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleFolderSelect = () => {
    // Placeholder for Google Drive Picker API integration
    console.log("Open folder selector");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-6 flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            SEWA<span className="text-blue-700 ml-1">मित्र</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">Patient Portal</p>
        </div>

        <div className="flex-1 space-y-4">
          <button 
            onClick={handleGenerateOTP}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Generate OTP
          </button>

          <div className="space-y-3">
            <DriveButton
              onClick={handleFolderSelect}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200 flex items-center justify-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Select Folder
            </DriveButton>
          </div>
        </div>

        {/* Profile Section */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <img 
              src={user?.imageUrl || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"} 
              alt={user?.fullName || "User"}
              className="h-10 w-10 rounded-full border-2 border-blue-500"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{user?.fullName || "User"}</p>
              <p className="text-xs text-gray-500">Username: {user?.username || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Active Session Alert */}
        {activeSession && (
          <div className="bg-green-100 border-l-4 border-green-500 p-4 mb-6 rounded-lg shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Active Session</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Dr. {activeSession.doctorUsername} is currently accessing your medical records.</p>
                  <p className="mt-1">Session expires in {Math.floor(activeSession.expiresIn / 60)} minutes and {activeSession.expiresIn % 60} seconds.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleExpireSession}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    End Session Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showOTPCard && generatedOTP && !activeSession && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Generated OTP</h2>
              <p className="text-base text-gray-600">Share this OTP with your doctor to grant access</p>
              <p className="text-sm text-orange-500 mt-1">
                Expires in: <span className="font-bold">{countdown} seconds</span>
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-4xl font-bold text-blue-900 text-center tracking-wider">
                {generatedOTP}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleRefreshOTP}
                className="py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh OTP
              </button> 
              <button
                onClick={handleCopyOTP}
                className={`py-2 px-4 ${
                  copySuccess 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center`}
              >
                {copySuccess ? (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy OTP
                  </>
                )}
              </button>
            </div>

            {/* Status Message */}
            {linkStatus.success && (
              <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg shadow-md">
                <p className="text-lg font-medium text-green-800 flex items-center">
                  <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {linkStatus.message}
                </p>
                <p className="mt-1 text-sm text-green-600">
                  Your folder has been linked successfully. You can now generate and share OTP.
                </p>
              </div>
            )}
          </div>
        )}

        {!showOTPCard && !activeSession && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
              <svg className="w-16 h-16 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Secure Access Control</h3>
              <p className="mt-2 text-gray-600">Generate a one-time password (OTP) to allow a healthcare professional temporary access to your medical records.</p>
              <button 
                onClick={handleGenerateOTP}
                className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Generate OTP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientOTPPage;