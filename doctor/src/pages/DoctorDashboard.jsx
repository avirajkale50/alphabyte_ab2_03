import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; // Import Clerk's useUser hook
import { UserButton } from "@clerk/clerk-react"; // Import UserButton for profile management
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import Calendar from "react-calendar"; // Import a calendar component
import "react-calendar/dist/Calendar.css"; // Calendar styles
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State for calendar modal
  const [selectedDate, setSelectedDate] = useState(new Date()); // Selected date for calendar
  const [latestNews, setLatestNews] = useState([]); // State for latest medical news
  const { user } = useUser(); // Get authenticated user data from Clerk
  const navigate = useNavigate(); // Hook for navigation

  // Add this state near your other state declarations
  const [newsPage, setNewsPage] = useState(1);
  const [allNews, setAllNews] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Doctor profile data (initialized from unsafeMetadata)
  const [doctorProfile, setDoctorProfile] = useState({
    name: user?.unsafeMetadata?.name || user?.fullName || "Your Name Here",
    specialty: user?.unsafeMetadata?.specialty || "Your Field Here",
    id: user?.id || "DOC-23456",
    email: user?.primaryEmailAddress?.emailAddress || "Email Here",
    phone: user?.unsafeMetadata?.phone || "Phone Number Here",
    hospitalName: user?.unsafeMetadata?.hospitalName || "Add Your Hospital",
    experience: user?.unsafeMetadata?.experience || "Add Your Experience",
    patients: user?.unsafeMetadata?.patients || 1243,
    consultations: user?.unsafeMetadata?.consultations || 5678,
    rating: user?.unsafeMetadata?.rating || 4.8,
  });

  useEffect(() => {
    const fetchNews = async (page = 1) => {
      if (!doctorProfile.specialty) return;
    
      setIsLoadingMore(true);
      try {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        const formattedDate = oneMonthAgo.toISOString().split('T')[0];
        const searchQuery = `${doctorProfile.specialty} AND (health OR medical OR medicine OR healthcare)`;
        
        const response = await fetch(
          `https://newsapi.org/v2/everything?` +
          `q=${encodeURIComponent(searchQuery)}` +
          `&from=${formattedDate}` +
          `&sortBy=publishedAt` +
          `&language=en` +
          `&page=${page}` +
          `&pageSize=5` +
          `&apiKey=803855fe6e764b6db676807e1d44f4ac`
        );
    
        const data = await response.json();
    
        if (data.status === 'ok') {
          const formattedNews = data.articles.map((article, index) => ({
            id: `${page}-${index + 1}`,
            title: article.title,
            source: article.source.name,
            date: new Date(article.publishedAt).toLocaleDateString(),
            url: article.url,
            description: article.description,
            image: article.urlToImage
          }));
    
          if (page === 1) {
            setLatestNews(formattedNews.slice(0, 3));
            setAllNews(formattedNews);
          } else {
            setAllNews(prev => [...prev, ...formattedNews]);
          }
        } else {
          throw new Error('Failed to fetch news');
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast.error("Failed to load more news");
      } finally {
        setIsLoadingMore(false);
      }
    };
  
    fetchNews();
  }, [doctorProfile.specialty]);
  
  // Mock data for appointments (replace with actual API data)
  const upcomingAppointments = [
    {
      id: 1,
      patient: "Amit Kumar",
      time: "10:30 AM",
      date: "2023-10-25",
      type: "Follow-up",
      status: "Confirmed",
    },
    {
      id: 2,
      patient: "Priya Sharma",
      time: "11:45 AM",
      date: "2023-10-25",
      type: "Consultation",
      status: "Waiting",
    },
    {
      id: 3,
      patient: "Rahul Verma",
      time: "2:15 PM",
      date: "2023-10-25",
      type: "Emergency",
      status: "Confirmed",
    },
    {
      id: 4,
      patient: "Neha Gupta",
      time: "9:15 AM",
      date: "2023-10-26",
      type: "Initial Consultation",
      status: "Confirmed",
    },
    {
      id: 5,
      patient: "Suresh Patel",
      time: "3:30 PM",
      date: "2023-10-26",
      type: "Follow-up",
      status: "Waiting",
    },
  ];

  // Handle "New Patient" button click
  const handleNewPatientClick = () => {
    navigate("/otp"); // Redirect to /otp route
  };

  // When switching away from the "Settings" tab, reset the unsavedChanges state to avoid carrying over unsaved changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setUnsavedChanges({}); // Reset unsaved changes
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedProfile) => {
    try {
      // Update the unsafeMetadata with the new profile data
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata, // Preserve existing metadata
          ...updatedProfile,      // Add new profile data
        },
      });
  
      // Update the local state to reflect the changes
      setDoctorProfile((prevProfile) => ({
        ...prevProfile,
        ...updatedProfile,
      }));
  
      // Clear unsaved changes
      setUnsavedChanges({});

      // Switch back to the "Overview" tab
      setActiveTab("overview");

      // Show success toast
      toast.success("Profile updated successfully!");

      console.log("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error toast
      toast.error("Error updating profile");
  
      console.log("Profile updated successfully!");
    }
  };

  // Add this function to handle "View More News"
  const handleViewMoreNews = async () => {
    const nextPage = newsPage + 1;
    await fetchNews(nextPage);
    setNewsPage(nextPage);
  };

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Profile Card */}
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
                Doctor Profile
              </h3>
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                    {doctorProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{doctorProfile.name}</h4>
                    <p className="text-blue-600">{doctorProfile.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600"><span className="font-medium">ID:</span> {doctorProfile.id}</p>
                  <p className="text-gray-600"><span className="font-medium">Experience:</span> {doctorProfile.experience}</p>
                  <p className="text-gray-600"><span className="font-medium">Email:</span> {doctorProfile.email}</p>
                  <p className="text-gray-600"><span className="font-medium">Phone:</span> {doctorProfile.phone}</p>
                  <p className="text-gray-600"><span className="font-medium">Hospital:</span> {doctorProfile.hospitalName}</p>
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

            {/* Upcoming Appointments Card */}
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
                {upcomingAppointments
                  .slice(0, 3) // Show only 3 appointments initially
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-sm text-gray-500">
                          {appointment.type} • {appointment.time} • {appointment.date}
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
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                >
                  View Full Schedule
                </button>
              </div>
            </div>

            {/* Latest Medical News Card with improved UI */}
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
                    d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                    clipRule="evenodd"
                  />
                  <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                </svg>
                Latest {doctorProfile.specialty} News
              </h3>
              <div className="space-y-4">
                {(newsPage === 1 ? latestNews : allNews).map((news) => (
                  <div
                    key={news.id}
                    className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {news.image && (
                        <div className="flex-shrink-0">
                          <img 
                            src={news.image} 
                            alt={news.title}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {news.title}
                        </a>
                        {news.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {news.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {news.source}
                          </span>
                          <span className="text-xs text-gray-500">
                            {news.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={handleViewMoreNews}
                  disabled={isLoadingMore}
                  className="w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors flex items-center justify-center"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'View More News'
                  )}
                </button>
              </div>
            </div>

            {/* Statistics Card */}
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
                Clinical Statistics
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
                  <p className="text-sm text-purple-600 font-medium">Patient Rating</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {doctorProfile.rating} <span className="text-sm">/ 5</span>
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">
                    Follow-up Rate
                  </p>
                  <p className="text-2xl font-bold text-orange-800">
                    87<span className="text-sm">%</span>
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
              <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={unsavedChanges.name || doctorProfile.name}
                      onChange={(e) => setUnsavedChanges({ ...unsavedChanges, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                    <input 
                      type="text" 
                      value={unsavedChanges.specialty || doctorProfile.specialty}
                      onChange={(e) => setUnsavedChanges({ ...unsavedChanges, specialty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={unsavedChanges.email || doctorProfile.email}
                      onChange={(e) => setUnsavedChanges({ ...unsavedChanges, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={unsavedChanges.phone || doctorProfile.phone}
                      onChange={(e) => setUnsavedChanges({ ...unsavedChanges, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                    <input 
                      type="text" 
                      value={unsavedChanges.hospitalName || doctorProfile.hospitalName}
                      onChange={(e) => setUnsavedChanges({ ...unsavedChanges, hospitalName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <input 
                      type="text" 
                      value={unsavedChanges.experience || doctorProfile.experience}
                      onChange={(e) => setUnsavedChanges({ ...unsavedChanges, experience: e.target.value })}
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

  // Calendar Modal with Appointments for selected date
  const CalendarModal = () => {
    // Filter appointments for the selected date
    const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
    const appointmentsForSelectedDate = upcomingAppointments.filter(
      app => app.date === formattedSelectedDate
    );
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-4">Schedule Appointments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Appointments for {selectedDate.toLocaleDateString()}</h4>
              {appointmentsForSelectedDate.length > 0 ? (
                <div className="space-y-2 overflow-y-auto max-h-64">
                  {appointmentsForSelectedDate.map(appointment => (
                    <div key={appointment.id} className="p-3 border border-gray-200 rounded-md">
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-gray-600">{appointment.time} - {appointment.type}</p>
                      <span
                        className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
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
              ) : (
                <p className="text-gray-500">No appointments for this date.</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsCalendarOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
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
                onClick={() => handleTabChange("overview")}
                className={`px-2 py-1 font-medium ${
                  activeTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => handleTabChange("patients")}
                className={`px-2 py-1 font-medium ${
                  activeTab === "patients"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Patients
              </button>
              <button
                onClick={() => handleTabChange("reports")}
                className={`px-2 py-1 font-medium ${
                  activeTab === "reports"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => handleTabChange("settings")}
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
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Schedule
            </button>
            <button
              onClick={handleNewPatientClick}
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

      {/* Calendar Modal */}
      {isCalendarOpen && <CalendarModal />}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default DoctorDashboard;