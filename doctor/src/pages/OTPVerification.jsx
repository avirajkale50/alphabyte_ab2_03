import React, { useState, useRef, useEffect } from "react";

const OTPVerification = () => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Move to next input if current input is filled
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
      if (index < 6 && !isNaN(value)) {
        newOtpValues[index] = value;
      }
    });

    setOtpValues(newOtpValues);

    // Focus on the next empty input or the last input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  // Handle verification
  const handleVerify = () => {
    const otp = otpValues.join("");
    if (otp.length === 6) {
      console.log("OTP submitted:", otp);
      // Add your verification logic here
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
            OTP
          </button>
          <button className="w-full py-3 px-4 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200 flex items-center">
            Dashboard
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-600 mr-3 shadow-sm">
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
              <p className="text-sm font-bold text-gray-800">DR. JOHN DOE</p>
              <p className="text-xs text-gray-500">Medical Professional</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-10 border border-gray-100">
          <div className="flex justify-center mb-8">
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            OTP VERIFICATION
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Please enter the verification code sent to your device
          </p>

          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-4">
              ENTER PATIENT OTP
            </p>

            <div className="flex justify-between gap-2">
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
                  className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-gray-400 rounded-lg focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            className="w-full py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-md flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Verify & Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
