import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; // Import Clerk's useUser hook
import { UserButton } from "@clerk/clerk-react"; // Import UserButton for profile management
import axios from "axios";

const OTPVerification = () => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [patientUsername, setPatientUsername] = useState("");
  const [documents, setDocuments] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [sessionExpiration, setSessionExpiration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const inputRefs = useRef([]);

  // Use Clerk's useUser hook to get the authenticated user
  const { user, isLoaded } = useUser();
  
  // Check session status periodically
  useEffect(() => {
    const checkSession = async () => {
      if (!sessionInfo) return;
      
      try {
        const response = await axios.get(`https://wwqgb2tx-3000.inc1.devtunnels.ms/api/session-status?patientUsername=${sessionInfo.patientUsername}`);
        if (!response.data.active) {
          // Session has been ended by the patient, refresh page
          setVerificationStatus(null);
          setDocuments([]);
          setOtpValues(["", "", "", "", "", ""]);
          setPatientUsername("");
          setSessionInfo(null);
          setSessionExpiration(null);
          
          // Show alert to doctor
          alert("The patient has ended the session. You'll be redirected to the verification page.");
        }
      } catch (error) {
        console.error("Error checking session status:", error);
      }
    };
    
    if (sessionInfo) {
      const interval = setInterval(checkSession, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
    }
  }, [sessionInfo]);
  
  // Timer for session expiration countdown
  useEffect(() => {
    if (sessionExpiration) {
      const timer = setInterval(() => {
        const now = new Date();
        const secondsLeft = Math.floor((sessionExpiration - now) / 1000);
        
        if (secondsLeft <= 0) {
          clearInterval(timer);
          setTimeLeft(0);
          
          // Session expired, refresh page
          setVerificationStatus(null);
          setDocuments([]);
          setOtpValues(["", "", "", "", "", ""]);
          setPatientUsername("");
          setSessionInfo(null);
          setSessionExpiration(null);
          
          alert("Your session has expired. Please generate a new OTP from the patient.");
        } else {
          setTimeLeft(secondsLeft);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [sessionExpiration]);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.toUpperCase();
    setOtpValues(newOtpValues);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste functionality
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtpValues = [...otpValues];
    pastedData.forEach((value, index) => {
      if (index < 6) {
        newOtpValues[index] = value.toUpperCase();
      }
    });
    setOtpValues(newOtpValues);
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  // Handle patient username input
  const handlePatientUsernameChange = (e) => {
    setPatientUsername(e.target.value);
  };

  // Handle verification
  const handleVerify = async () => {
    if (!patientUsername) {
      setVerificationStatus({
        success: false,
        message: "Please enter a Patient Username",
      });
      return;
    }

    const otp = otpValues.join("");
    if (otp.length !== 6) {
      setVerificationStatus({
        success: false,
        message: "Please enter a valid 6-digit OTP",
      });
      return;
    }

    if (!user?.username) {
      setVerificationStatus({
        success: false,
        message: "Doctor username not available. Please ensure you're logged in.",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await axios.post("https://wwqgb2tx-3000.inc1.devtunnels.ms/api/verify-otp", {
        patientUsername: patientUsername,
        doctorUsername: user?.username, // Use Clerk username
        otp: otp,
      });

      if (response.data.success) {
        setVerificationStatus({
          success: true,
          message: response.data.message,
        });
        setDocuments(response.data.documents || []);
        
        // Set session info
        setSessionInfo({
          patientUsername: patientUsername,
          doctorUsername: user?.username,
          startTime: new Date()
        });
        
        // Set expiration time
        const expiresIn = response.data.session_expires_in || 3600; // Default to 1 hour
        setSessionExpiration(new Date(new Date().getTime() + expiresIn * 1000));
        setTimeLeft(expiresIn);
      } else {
        setVerificationStatus({
          success: false,
          message: response.data.message || "Verification failed",
        });
      }
    } catch (error) {
      setVerificationStatus({
        success: false,
        message: error.response?.data?.message || "Verification failed",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-6 flex flex-col rounded-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            SEWA<span className="text-blue-700 ml-1">मित्र</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">Doctor Portal</p>
        </div>

        <div className="flex-1 space-y-4">
          <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors shadow-sm">
            OTP Verification
          </button>

          <a href="/dashboard">
            <button className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200 flex items-center justify-center cursor-pointer">
              Dashboard
            </button>
          </a>
        </div>

        {/* Profile Section */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          {isLoaded && user ? (
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <img 
                src={user.imageUrl || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"} 
                alt={user.firstName || "User"} 
                className="h-10 w-10 rounded-full border-2 border-blue-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username || "User"}</p>
                <p className="text-xs text-gray-500">{user.publicMetadata?.role || "Medical Professional"}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-600 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Loading...</p>
                <p className="text-xs text-gray-500">Please wait</p>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-10 border border-gray-100">
          {sessionInfo ? (
            <>
              {/* Active Session Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Active Session</h2>
                <div className="bg-green-100 px-3 py-1 rounded-full flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-green-800 text-sm font-medium">
                    {timeLeft ? `${formatTime(timeLeft)} left` : "Active"}
                  </span>
                </div>
              </div>
              
              {/* Connection Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Connected with</h3>
                <div className="flex items-center mb-3">
                  <svg className="h-5 w-5 text-blue-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-blue-900 font-medium">{patientUsername}</span>
                </div>
              </div>
              
              {/* Documents Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Available Documents
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="p-3 border-b border-gray-200 last:border-b-0 flex items-center hover:bg-gray-50"
                    >
                      <svg
                        className="h-5 w-5 text-blue-600 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-gray-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2 cursor-pointer">
                  OTP VERIFICATION
              </h2>
              <p className="text-center text-gray-500 mb-6">
                Enter the Patient Username and OTP to access records
              </p>

              {/* Patient Username input */}
              <div className="mb-6">
                <label
                  htmlFor="patientUsername"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Patient Username
                </label>
                <input
                  type="text"
                  id="patientUsername"
                  value={patientUsername}
                  onChange={handlePatientUsernameChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter patient's username"
                />
              </div>

              {/* OTP Input Fields */}
              <div className="flex justify-between gap-2 mb-6">
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : null}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className={`w-full py-3 ${
                  isVerifying ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white rounded-xl font-medium transition-colors shadow-md mb-4 flex items-center justify-center`}
              >
                {isVerifying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify & Proceed"
                )}
              </button>

              {/* Verification Status */}
              {verificationStatus && (
                <div
                  className={`mt-4 p-4 rounded-lg ${
                    verificationStatus.success
                      ? "bg-green-100 border-green-500"
                      : "bg-red-100 border-red-500"
                  } border-l-4`}
                >
                  <p
                    className={`font-medium ${
                      verificationStatus.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {verificationStatus.message}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;