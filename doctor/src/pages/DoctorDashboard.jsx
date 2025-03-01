import React, { useState } from "react";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for the doctor profile
  const doctorProfile = {
    name: "Dr. John Doe",
    specialty: "Cardiologist",
    id: "DOC-23456",
    email: "john.doe@sewamitr.org",
    phone: "+91 98765 43210",
    hospitalName: "Sewa Medical Center",
    experience: "15 years",
    patients: 1243,
    consultations: 5678,
    rating: 4.8,
  };

  // Mock data for appointments
  const upcomingAppointments = [
    {
      id: 1,
      patient: "Amit Kumar",
      time: "10:30 AM",
      date: "Today",
      type: "Follow-up",
      status: "Confirmed",
    },
    {
      id: 2,
      patient: "Priya Sharma",
      time: "11:45 AM",
      date: "Today",
      type: "Consultation",
      status: "Waiting",
    },
    {
      id: 3,
      patient: "Rahul Verma",
      time: "2:15 PM",
      date: "Today",
      type: "Emergency",
      status: "Confirmed",
    },
    {
      id: 4,
      patient: "Sneha Patel",
      time: "9:00 AM",
      date: "Tomorrow",
      type: "Regular Checkup",
      status: "Confirmed",
    },
  ];

  // Mock data for recent patient reports
  const recentReports = [
    {
      id: 1,
      patient: "Amit Kumar",
      reportType: "Blood Test",
      date: "Mar 01, 2025",
      status: "Reviewed",
    },
    {
      id: 2,
      patient: "Priya Sharma",
      reportType: "ECG",
      date: "Feb 28, 2025",
      status: "Pending Review",
    },
    {
      id: 3,
      patient: "Rahul Verma",
      reportType: "CT Scan",
      date: "Feb 27, 2025",
      status: "Reviewed",
    },
  ];

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Profile Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Specialty</p>
                  <p className="font-medium">{doctorProfile.specialty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doctor ID</p>
                  <p className="font-medium">{doctorProfile.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{doctorProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{doctorProfile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="font-medium">{doctorProfile.hospitalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{doctorProfile.experience}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>

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
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Today's Schedule
              </h3>
              <div className="divide-y divide-gray-100">
                {upcomingAppointments
                  .filter((app) => app.date === "Today")
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.type} • {appointment.time}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "Waiting"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                  View Full Schedule
                </button>
              </div>
            </div>

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
                    d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm1-6a1 1 0 10-2 0v2a1 1 0 102 0V8z"
                    clipRule="evenodd"
                  />
                </svg>
                Recent Patient Reports
              </h3>
              <div className="divide-y divide-gray-100">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="py-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{report.patient}</p>
                      <p className="text-sm text-gray-500">
                        {report.reportType} • {report.date}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === "Reviewed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                  View All Reports
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {doctorProfile.patients}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">
                    Consultations
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {doctorProfile.consultations}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Rating</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {doctorProfile.rating} <span className="text-sm">/ 5</span>
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-orange-800">
                    98<span className="text-sm">%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "patients":
        return (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Patient Management</h3>
            <p>Patient list and management tools would appear here.</p>
          </div>
        );
      case "reports":
        return (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Medical Reports</h3>
            <p>Complete report management system would appear here.</p>
          </div>
        );
      case "settings":
        return (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
            <p>Settings and preferences would appear here.</p>
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
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
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
                onClick={() => setActiveTab("patients")}
                className={`px-2 py-1 font-medium ${
                  activeTab === "patients"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Patients
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-2 py-1 font-medium ${
                  activeTab === "reports"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Reports
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

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                <span className="hidden md:block font-medium">
                  {doctorProfile.name}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Schedule
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              New Patient
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  );
};

export default DoctorDashboard;
