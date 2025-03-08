import React, { useState, useRef, useEffect } from "react";
import { useUser, SignOutButton, UserButton } from "@clerk/clerk-react";

const ReportsQuestionPage = () => {
  const [question, setQuestion] = useState("");
  const [reports] = useState([
    { id: "01", name: "user-report-01" },
    { id: "02", name: "user-report-02" },
    { id: "03", name: "user-report-03" },
    { id: "04", name: "user-report-04" },
  ]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const chatContainerRef = useRef(null);
  const { user } = useUser();

  // Auto-scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    if (question.trim()) {
      // Add doctor's message to chat
      const doctorMessage = {
        id: Date.now(),
        text: question,
        sender: "doctor",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prevMessages) => [...prevMessages, doctorMessage]);
      setQuestion("");

      // Simulate bot response after a short delay
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: `Response to: "${question.trim()}"${
            selectedReport ? ` based on report ${selectedReport}` : ""
          }`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prevMessages) => [...prevMessages, botMessage]);
      }, 1000);
    }
  };

  const handleReportClick = (reportId) => {
    setSelectedReport(reportId);
    console.log("Report selected:", reportId);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl py-8 px-6 flex flex-col border-r border-gray-100">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-700">
            SEWA<span className="text-blue-700 text-2xl ml-1">मित्र</span>
          </h2>
        </div>

        <div className="space-y-3 flex-1">
          <button className="w-full py-3 px-4 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200 flex items-center">
            Add Remark
          </button>
          <button className="w-full py-3 px-4 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200 flex items-center">
            Check Remark
          </button>
          <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center">
            Chat
          </button>
        </div>

        {/* Clerk User Profile Integration */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserButton afterSignOutUrl="/sign-in" />
                <div className="ml-3">
                  <p className="text-sm font-bold text-gray-800">
                    {user.fullName ||
                      `DR. ${user.firstName?.toUpperCase() || "USER"}`}
                  </p>
                  <p className="text-xs text-gray-500">Medical Professional</p>
                </div>
              </div>
              {/* <SignOutButton>
                <button className="text-xs text-gray-500 hover:text-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.707a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L10 11.414V15a1 1 0 102 0v-3.586l1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </SignOutButton> */}
            </div>
          ) : (
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
                <p className="text-sm font-bold text-gray-800">Not signed in</p>
                <button className="text-xs text-gray-500 hover:text-blue-500">
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 border border-gray-100 h-[90vh] flex flex-col">
          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <h2 className="text-center text-gray-800 font-medium">
              ASK QUESTIONS TO THE REPORTS
              {selectedReport && (
                <span className="text-blue-600 ml-2">
                  (Report {selectedReport} selected)
                </span>
              )}
            </h2>
          </div>

          {/* Reports list */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`p-3 rounded-xl border ${
                  selectedReport === report.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                } shadow-sm hover:border-blue-300 transition-colors cursor-pointer flex items-center`}
                onClick={() => handleReportClick(report.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500 mr-2"
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
                <span className="text-gray-700 text-sm">{report.name}</span>
              </div>
            ))}
          </div>

          {/* Chat messages */}
          <div
            className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-4"
            ref={chatContainerRef}
          >
            {chatMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                No messages yet. Ask a question to start the conversation.
              </div>
            ) : (
              <div className="space-y-6">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start ${
                      message.sender === "doctor"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {/* Bot Icon - Left Side */}
                    {message.sender === "bot" && (
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center mr-2 shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
                          <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" />
                        </svg>
                      </div>
                    )}

                    {/* Message Content */}
                    <div
                      className={`relative max-w-[75%] rounded-2xl px-4 py-3 ${
                        message.sender === "doctor"
                          ? "bg-blue-500 text-white rounded-tr-none"
                          : "bg-gray-200 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <div className="mb-1">
                        <div
                          className={`font-medium text-sm mb-1 ${
                            message.sender === "doctor"
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {message.sender === "doctor" ? "You" : "SEWAमित्र"}
                        </div>
                        <p>{message.text}</p>
                      </div>
                      <div
                        className={`text-right text-xs ${
                          message.sender === "doctor"
                            ? "text-blue-200"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp}
                      </div>
                    </div>

                    {/* Doctor Icon - Right Side */}
                    {message.sender === "doctor" && (
                      <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center ml-2 shadow-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
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
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question input */}
          <form onSubmit={handleSubmitQuestion} className="mt-auto">
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={handleQuestionChange}
                placeholder="TYPE YOUR QUESTION HERE..."
                className="w-full p-4 bg-gray-100 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all shadow-sm text-gray-700"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
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
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                    transform="rotate(90 12 12)"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportsQuestionPage;
