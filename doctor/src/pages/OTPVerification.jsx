// OTPVerification.js - For doctors to verify patient OTPs
import React, { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react"; // Import Clerk's useUser hook
import { UserButton } from "@clerk/clerk-react"; // Import UserButton for profile management
import axios from "axios";

const OTPVerification = () => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  // Use Clerk's useUser hook to get the authenticated user
  const { user, isLoaded } = useUser();

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

  // Handle patient ID input
  const handlePatientIdChange = (e) => {
    setPatientId(e.target.value);
  };

  // Handle verification
  const handleVerify = async () => {
    if (!patientId) {
      setVerificationStatus({
        success: false,
        message: "Please enter a Patient ID",
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

    setIsVerifying(true);

    try {
      const response = await axios.post("http://localhost:5000/api/verify-otp", {
        patientId: patientId,
        doctorId: user?.id || "doctor123", // Use Clerk user ID if available
        otp: otp,
      });

      if (response.data.success) {
        setVerificationStatus({
          success: true,
          message: response.data.message,
        });
        setDocuments(response.data.documents || []);
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

  // Handle end session
  const handleEndSession = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/end-session", {
        patientId: patientId,
      });

      if (response.data.success) {
        setVerificationStatus(null);
        setDocuments([]);
        setOtpValues(["", "", "", "", "", ""]);
        setPatientId("");
      }
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-xl py-8 px-6 flex flex-col border-r border-gray-100">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-700">
            SEWA<span className="text-blue-700 text-2xl ml-1">मित्र</span>
          </h2>
        </div>

        <div className="space-y-3 flex-1">
          <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center">
            OTP Verification
          </button>
          <button className="w-full py-3 px-4 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200 flex items-center">
            Dashboard
          </button>
        </div>

        {/* Profile Section */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          {isLoaded && user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserButton />
                <div className="ml-2">
                  <p className="text-sm font-bold text-gray-800">
                    {user.firstName
                      ? `${user.firstName} ${user.lastName || ""}`
                      : user.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.publicMetadata?.role || "Medical Professional"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-600 mr-3 shadow-sm">
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
                <p className="text-sm font-bold text-gray-800">Loading...</p>
                <p className="text-xs text-gray-500">Please wait</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-10 border border-gray-100">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            OTP VERIFICATION
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Enter the Patient ID and OTP to access records
          </p>

          {/* Patient ID input */}
          <div className="mb-6">
            <label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Patient ID
            </label>
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={handlePatientIdChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter Patient ID (e.g. p12345)"
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

          {/* Documents Section */}
          {verificationStatus?.success && documents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Available Documents
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
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

              {/* End Session Button */}
              <button
                onClick={handleEndSession}
                className="w-full mt-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                End Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;