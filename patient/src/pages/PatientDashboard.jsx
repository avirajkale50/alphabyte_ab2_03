import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [healthTips, setHealthTips] = useState([]);
  const navigate = useNavigate();

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

  // Mock patient profile
  const [patientProfile] = useState({
    name: "Rahul Verma",
    id: "PAT-12345",
    age: 35,
    bloodGroup: "B+",
    email: "rahul.verma@example.com",
    phone: "+91 98765 43210",
    address: "123, Park Street, Mumbai",
    lastCheckup: "2023-09-15",
    upcomingTests: 2,
    pendingReports: 1,
    medicationAdherence: "85%"
  });

  // Mock medical records
  const medicalRecords = [
    {
      id: 1,
      date: "2023-09-15",
      type: "Blood Test",
      doctor: "Dr. Amit Kumar",
      status: "Completed",
      report: "link-to-report"
    },
    {
      id: 2,
      date: "2023-08-20",
      type: "X-Ray",
      doctor: "Dr. Suresh Patel",
      status: "Completed",
      report: "link-to-report"
    }
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
                    {patientProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{patientProfile.name}</h4>
                    <p className="text-blue-600">Patient ID: {patientProfile.id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600"><span className="font-medium">Age:</span> {patientProfile.age}</p>
                  <p className="text-gray-600"><span className="font-medium">Blood Group:</span> {patientProfile.bloodGroup}</p>
                  <p className="text-gray-600"><span className="font-medium">Email:</span> {patientProfile.email}</p>
                  <p className="text-gray-600"><span className="font-medium">Phone:</span> {patientProfile.phone}</p>
                </div>
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
                      {appointment.specialty} • {appointment.time} • {appointment.date}
                    </p>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
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
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
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
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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
      // Add other tab cases as needed
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Top Navigation */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Patient Dashboard</h1>
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
    </div>
  );
};

export default PatientDashboard;