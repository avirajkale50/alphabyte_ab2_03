import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "./Chatbot"; // Import the Chatbot component

const PatientDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [healthTips, setHealthTips] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mock appointments data
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Amit Kumar",
      specialty: "Cardiologist",
      time: "10:30 AM",
      date: "2023-10-25",
      type: "Follow-up",
      status: "Confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Priya Sharma",
      specialty: "Dermatologist",
      time: "11:45 AM",
      date: "2023-10-25",
      type: "Consultation",
      status: "Waiting",
    },
  ];

  const medicalRecords = [
    {
      id: 1,
      type: "Blood Test",
      doctor: "Dr. Amit Kumar",
      date: "2023-10-20",
    },
    {
      id: 2,
      type: "X-Ray",
      doctor: "Dr. Priya Sharma",
      date: "2023-10-18",
    },
    {
      id: 3,
      type: "MRI Scan",
      doctor: "Dr. Rahul Verma",
      date: "2023-10-15",
    },
  ];

  // Fetch health tips
  useEffect(() => {
    // Mock health tips data
    const mockHealthTips = [
      {
        id: 1,
        title: "Maintaining Heart Health",
        category: "Cardiology",
        content: "Regular exercise and balanced diet...",
      },
      {
        id: 2,
        title: "Mental Wellness Tips",
        category: "Mental Health",
        content: "Practice meditation and mindfulness...",
      },
      {
        id: 3,
        title: "Seasonal Health Advisory",
        category: "General",
        content: "Stay hydrated and protect from weather changes...",
      },
    ];
    setHealthTips(mockHealthTips);
  }, []);

  // Handle OTP page navigation
  const handleShareRecordsClick = () => {
    navigate("/patient-otp");
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedProfile) => {
    try {
      // Update the unsafeMetadata with the new profile data
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata, // Preserve existing metadata
          ...updatedProfile, // Add new profile data
        },
      });

      // Clear unsaved changes
      setUnsavedChanges({});

      // Switch back to the "Overview" tab
      setActiveTab("overview");

      // Show success toast
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error toast
      toast.error("Error updating profile");
    }
  };

  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatOpen((prevState) => !prevState);
  };

  // Render dashboard content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Profile Card */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                My Profile
              </h3>
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{user?.fullName}</h4>
                    <p className="text-blue-600">Patient ID: {user?.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span>{" "}
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span>{" "}
                    {user?.phoneNumbers[0]?.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setActiveTab("settings")}
                  className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Upcoming Appointments
              </h3>
              <div className="divide-y divide-gray-100">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="py-3">
                    <p className="font-medium">{appointment.doctor}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.specialty} • {appointment.time} •{" "}
                      {appointment.date}
                    </p>
                    <span
                      className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Records Card */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Recent Medical Records
              </h3>
              <div className="divide-y divide-gray-100">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="py-3">
                    <p className="font-medium">{record.type}</p>
                    <p className="text-sm text-gray-500">
                      {record.doctor} • {record.date}
                    </p>
                    <span className="text-blue-600 text-sm cursor-pointer hover:text-blue-800">
                      View Report
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleShareRecordsClick}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Share Medical Records
              </button>
            </div>

            {/* Health Tips Card */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Health Tips & Advisories
              </h3>
              <div className="divide-y divide-gray-100">
                {healthTips.map((tip) => (
                  <div key={tip.id} className="py-3">
                    <p className="font-medium">{tip.title}</p>
                    <p className="text-sm text-gray-500">{tip.category}</p>
                    <p className="text-sm text-gray-600 mt-1">{tip.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={unsavedChanges.fullName || user?.fullName}
                    onChange={(e) =>
                      setUnsavedChanges({
                        ...unsavedChanges,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={
                      unsavedChanges.email ||
                      user?.emailAddresses[0]?.emailAddress
                    }
                    onChange={(e) =>
                      setUnsavedChanges({
                        ...unsavedChanges,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={
                      unsavedChanges.phone || user?.phoneNumbers[0]?.phoneNumber
                    }
                    onChange={(e) =>
                      setUnsavedChanges({
                        ...unsavedChanges,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => handleProfileUpdate(unsavedChanges)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        );
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Top Navigation */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-blue-700 mr-8">
                SEWA<span className="text-blue-700 text-2xl ml-1">मित्र</span>
              </h2>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-2 py-1 font-medium ${
                    activeTab === "overview"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("appointments")}
                  className={`px-2 py-1 font-medium ${
                    activeTab === "appointments"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => setActiveTab("records")}
                  className={`px-2 py-1 font-medium ${
                    activeTab === "records"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Medical Records
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-2 py-1 font-medium ${
                    activeTab === "settings"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
            {/* Added Clerk UserButton for logout functionality */}
            <div className="ml-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Patient Dashboard
          </h1>
          <button
            onClick={handleShareRecordsClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 inline mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Records
          </button>
        </div>
        {renderTabContent()}
      </main>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={toggleChat}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isChatOpen ? "bg-red-500 rotate-45" : "bg-blue-600"
          }`}
        >
          {isChatOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          )}
        </button>
      </div>

      {/* Chatbot Modal */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-10 w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl transition-all duration-300 ease-in-out">
          <div className="p-2 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 transform transition-all duration-300 ease-in-out">
            <Chatbot />
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default PatientDashboard;