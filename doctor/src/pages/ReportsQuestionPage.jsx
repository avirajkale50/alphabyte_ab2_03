import React, { useState } from "react";

const ReportsQuestionPage = () => {
  const [question, setQuestion] = useState("");
  const [reports] = useState([
    { id: "01", name: "user-report-01" },
    { id: "02", name: "user-report-02" },
    { id: "03", name: "user-report-03" },
    { id: "04", name: "user-report-04" },
  ]);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    if (question.trim()) {
      console.log("Question submitted:", question);
      setQuestion("");
    }
  };

  const handleReportClick = (reportId) => {
    console.log("Report clicked:", reportId);
    // Handle report selection logic
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 border border-gray-100">
          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <h2 className="text-center text-gray-800 font-medium">
              ASK QUESTIONS TO THE REPORTS
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {reports.map((report, index) => (
              <div
                key={report.id}
                className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors cursor-pointer flex items-center"
                onClick={() => handleReportClick(report.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500 mr-3"
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
                <span className="text-gray-700">{report.name}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitQuestion}>
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
