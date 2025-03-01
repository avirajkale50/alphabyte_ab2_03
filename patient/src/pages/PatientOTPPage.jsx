import React, { useState, useRef } from "react";

const PatientOTPPage = () => {
  const [driveLink, setDriveLink] = useState("");
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState(null);
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [oauthToken, setOauthToken] = useState('');
  const [showOTPCard, setShowOTPCard] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [linkStatus, setLinkStatus] = useState({ success: false, message: '' });
  const [userProfile] = useState({
    name: "Rahul Verma",
    image: "https://ui-avatars.com/api/?name=Rahul+Verma&background=0D8ABC&color=fff"
  });

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
  const handleGenerateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    setShowOTPCard(true);
    // Here you would typically send this OTP to the backend
    console.log("Generated OTP:", otp);
  };

  const handleRefreshOTP = () => {
    handleGenerateOTP();
  };

  const handleExpireSession = () => {
    setGeneratedOTP(null);
    setShowOTPCard(false);
  };

  const handleCopyOTP = () => {
    navigator.clipboard.writeText(generatedOTP);
    setCopySuccess(true);
    // Keep the success state longer - 3 seconds
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleFolderSelect = () => {
    // This is a placeholder for Google Drive Picker API integration
    // You'll need to implement the Google Drive Picker API here
    console.log("Open folder selector");
  };

  const loadGoogleDriveApi = () => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('picker', () => {
        setPickerApiLoaded(true);
      });
    };
    document.body.appendChild(script);
  };

  const createPicker = () => {
    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.FOLDERS)
      .setOAuthToken(oauthToken)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  };

  const pickerCallback = (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const folder = data.docs[0];
      setDriveLink(`https://drive.google.com/drive/folders/${folder.id}`);
      setIsLinkValid(true);
      setLinkStatus({
        success: true,
        message: 'Folder selected successfully!'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-6 flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Patient Controls</h2>
        </div>

        <div className="flex-1 space-y-4">
          <button 
            onClick={handleGenerateOTP}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Generate OTP
          </button>

          <div className="space-y-3">
            <button
              onClick={handleFolderSelect}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200 flex items-center justify-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Select Folder
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <img 
              src={userProfile.image} 
              alt={userProfile.name}
              className="h-10 w-10 rounded-full border-2 border-blue-500"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{userProfile.name}</p>
              <p className="text-xs text-gray-500">View Profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {showOTPCard && generatedOTP && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Generated OTP</h2>
              <p className="text-base text-gray-600">Share this OTP with your doctor to grant access</p>
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
                onClick={handleExpireSession}
                className="py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Expire Session
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

            {/* Enhanced Status Message */}
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
      </div>
    </div>
  );
};

export default PatientOTPPage;