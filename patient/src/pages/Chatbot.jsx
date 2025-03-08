import React, { useState, useRef, useEffect } from "react";

// Simple Markdown parser function
const parseMarkdown = (text) => {
  if (!text) return "";

  // Save code blocks temporarily
  const codeBlocks = [];
  text = text.replace(/```([\s\S]*?)```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Process text
  let processed = text
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italics (not followed by another *)
    .replace(/\*([^\*]*?)\*/g, "<em>$1</em>")
    // Bullet lists
    .replace(/^\s*\*\s+(.*?)$/gm, "<li>$1</li>")
    .replace(/<li>(.+?)(?=<li>|$)/gs, "<ul><li>$1</ul>")
    // Numbered lists
    .replace(/^\s*(\d+)\.\s+(.*?)$/gm, "<li>$2</li>")
    .replace(/<li>(.+?)(?=<li>|$)/gs, "<ol><li>$1</ol>");

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    const code = block.replace(/```([\s\S]*?)```/g, "$1");
    processed = processed.replace(
      `__CODE_BLOCK_${i}__`,
      `<pre><code>${code}</code></pre>`
    );
  });

  // Wrap in paragraph if not already wrapped
  if (!processed.startsWith("<p>")) {
    processed = `<p>${processed}</p>`;
  }

  return processed;
};

// Updated component to display structured responses with Markdown
const StructuredResponse = ({ responseData }) => {
  return (
    <div className="structured-response space-y-3">
      {/* Answer Section */}
      <div className="answer-section">
        <h3 className="text-blue-700 font-medium mb-1">Answer</h3>
        <div
          className="pl-2 text-gray-800 markdown-content"
          dangerouslySetInnerHTML={{
            __html: parseMarkdown(responseData.answer),
          }}
        />
      </div>

      {/* Reasoning Section */}
      {responseData.reasoning && (
        <div className="reasoning-section">
          <h3 className="text-blue-700 font-medium mb-1">Reasoning</h3>
          <div className="pl-2 italic text-gray-700">
            {responseData.reasoning}
          </div>
        </div>
      )}

      {/* Confidence */}
      {responseData.confidence && (
        <div className="confidence-section">
          <h3 className="text-blue-700 font-medium mb-1">Confidence</h3>
          <div className="pl-2">
            <span
              className={`px-2 py-0.5 rounded ${
                responseData.confidence === "High"
                  ? "bg-green-100 text-green-700"
                  : responseData.confidence === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {responseData.confidence}
            </span>
          </div>
        </div>
      )}

      {/* Citations Section */}
      {responseData.citations && responseData.citations.length > 0 && (
        <div className="citations-section">
          <h3 className="text-blue-700 font-medium mb-1">Sources</h3>
          <div className="pl-2 space-y-2">
            {responseData.citations.map((citation, index) => (
              <div
                key={index}
                className="citation border-l-2 border-blue-200 pl-2"
              >
                <div className="font-medium text-gray-800">
                  {citation.title}
                </div>
                <div className="text-xs text-gray-600">{citation.citation}</div>
                {/* Similarity score bar */}
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${citation.similarity_score * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-right text-gray-500">
                  Relevance: {Math.round(citation.similarity_score * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Add this to your existing styles or include it in the component using a style tag
const markdownStyles = `
  <style>
    .markdown-content p {
      margin-bottom: 0.75rem;
    }
    
    .markdown-content strong {
      font-weight: 600;
    }
    
    .markdown-content em {
      font-style: italic;
    }
    
    .markdown-content ul, .markdown-content ol {
      margin-left: 1.5rem;
      margin-bottom: 0.75rem;
    }
    
    .markdown-content li {
      margin-bottom: 0.25rem;
    }
    
    .markdown-content pre {
      background-color: #f3f4f6;
      padding: 0.5rem;
      border-radius: 0.25rem;
      margin-bottom: 0.75rem;
      overflow-x: auto;
    }
  </style>
`;

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isAssessing, setIsAssessing] = useState(false);
  const [currentSymptom, setCurrentSymptom] = useState(0);
  const chatContainerRef = useRef(null);

  // List of questions to ask about symptoms
  const symptomQuestions = [
    "What symptoms are you experiencing today?",
    "How long have you been experiencing these symptoms?",
    "Rate your pain level from 1-10, if applicable.",
    "Have you taken any medication for these symptoms?",
    "Do you have any pre-existing medical conditions?",
  ];

  // Initial welcome message when component mounts
  useEffect(() => {
    setTimeout(() => {
      const welcomeMessage = {
        id: Date.now(),
        text: "Hello! I'm your SEWAमित्र virtual health assistant. Please ask any health-related question.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages([welcomeMessage]);
    }, 500);
  }, []);

  // Auto-scroll chat to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle next symptom question when in assessment mode
  /*
  useEffect(() => {
    if (isAssessing && currentSymptom < symptomQuestions.length) {
      setTimeout(() => {
        const symptomQuestion = {
          id: Date.now(),
          text: symptomQuestions[currentSymptom],
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prevMessages) => [...prevMessages, symptomQuestion]);
      }, 1000);
    } else if (isAssessing && currentSymptom >= symptomQuestions.length) {
      // Assessment complete
      setTimeout(() => {
        const completionMessage = {
          id: Date.now(),
          text: "Thank you for providing your symptoms. I'll analyze this information and share it with your doctor. Is there anything else you'd like to mention about how you're feeling?",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prevMessages) => [...prevMessages, completionMessage]);
        setIsAssessing(false); // End assessment mode
      }, 1000);
    }
  }, [isAssessing, currentSymptom]);
  */

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // Add this function to generate dummy structured data
  const generateDummyStructuredResponse = () => {
    return JSON.stringify({
      question: "I am having fever what should i do?",
      answer:
        "If you're experiencing a fever, here are some steps to take:\n\n1. Rest and stay hydrated\n2. Take over-the-counter fever reducers like acetaminophen or ibuprofen\n3. Use a cool compress if needed\n4. Monitor your temperature regularly",
      confidence: "High",
      reasoning:
        "The recommendation follows standard medical guidelines for managing mild to moderate fever at home. Fever is often a symptom of the body fighting an infection.",
      citations: [
        {
          title: "Fever Management Guidelines",
          citation:
            "National Health Association: Fever Management. Medical Guidelines Database. 2025.",
          url: null,
          similarity_score: 0.85,
        },
        {
          title: "Home Care for Febrile Patients",
          citation: "Journal of Family Medicine. Volume 37, Issue 4. 2024.",
          url: null,
          similarity_score: 0.72,
        },
        {
          title: "When to Seek Medical Attention for Fever",
          citation: "Emergency Medicine Resource Guide. 3rd Edition. 2025.",
          url: null,
          similarity_score: 0.68,
        },
      ],
      timestamp: new Date().toISOString(),
    });
  };

  // Add this function to connect to the backend API
  const sendMessageToBackend = async (message) => {
    try {
      // Show loading indicator while waiting for response
      const tempLoadingMessage = {
        id: Date.now() + 1,
        text: "Analyzing your question...",
        sender: "bot",
        isLoading: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prevMessages) => [...prevMessages, tempLoadingMessage]);

      // Make API request to the backend
      const response = await fetch("http://localhost:8001/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: message }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      // Parse the response
      const data = await response.json();

      // Format the response as a structured JSON string
      const structuredResponse = {
        question: data.question,
        answer: data.answer,
        confidence: data.confidence,
        reasoning: data.reasoning,
        citations: data.citations,
        timestamp: data.timestamp,
      };

      // Remove the loading message
      setChatMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg.isLoading)
      );

      // Add the actual response message
      const botMessage = {
        id: Date.now() + 2,
        text: JSON.stringify(structuredResponse),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prevMessages) => [...prevMessages, botMessage]);

      return structuredResponse;
    } catch (error) {
      console.error("Error sending message to backend:", error);

      // Remove loading message and show error
      setChatMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg.isLoading)
      );

      // Add error message
      const errorMessage = {
        id: Date.now() + 2,
        text: "Sorry, I'm having trouble connecting to the medical database. Please try again later.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prevMessages) => [...prevMessages, errorMessage]);
      return null;
    }
  };

  // Update handleSubmit function to use the backend API
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      // Add user's message to chat
      const userMessage = {
        id: Date.now(),
        text: userInput,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      // For testing purposes, keep the dummy data option using "test structured"
      if (userInput.toLowerCase() === "test structured") {
        setTimeout(() => {
          const structuredMessage = {
            id: Date.now() + 1,
            text: generateDummyStructuredResponse(),
            sender: "bot",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setChatMessages((prevMessages) => [
            ...prevMessages,
            structuredMessage,
          ]);
        }, 1000);
      } else {
        // Send the message to the backend for processing
        sendMessageToBackend(userInput);
      }
    }
  };

  // Add a helper function to check if a message contains structured data
  const isStructuredResponse = (text) => {
    try {
      const data = JSON.parse(text);
      return data && data.answer && data.confidence;
    } catch (e) {
      return false;
    }
  };

  // Modify the render for chat messages to handle structured responses
  const renderMessageContent = (message) => {
    if (message.sender === "bot") {
      try {
        const data = JSON.parse(message.text);
        if (data && data.answer) {
          return <StructuredResponse responseData={data} />;
        }
      } catch (e) {
        // Not JSON or not structured response format
      }
    }
    return <p className="leading-relaxed text-md">{message.text}</p>;
  };

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: markdownStyles }} />
      <div className="bg-white w-full h-[60vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 mb-2 shadow-sm border border-blue-200">
          <h2 className="text-center text-blue-900 font-medium text-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            SYMPTOM ASSESSMENT WITH SEWAमित्र
          </h2>
        </div>

        {/* Chat messages */}
        <div
          className="flex-1 overflow-y-auto mb-2 bg-blue-50 rounded-lg p-3"
          ref={chatContainerRef}
        >
          {chatMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-blue-400 italic">
              Starting conversation with your health assistant...
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bot Icon - Left Side */}
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-2 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    className={`relative max-w-[80%] rounded-lg px-3 py-2 shadow-sm ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-white border border-blue-200 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <div className="mb-1">
                      <div
                        className={`font-medium text-xs mb-1 ${
                          message.sender === "user"
                            ? "text-white"
                            : "text-blue-600"
                        }`}
                      >
                        {message.sender === "user" ? "You" : "SEWAमित्र"}
                      </div>
                      {/* Use the new renderMessageContent function */}
                      {renderMessageContent(message)}
                    </div>
                    <div
                      className={`text-right text-xs ${
                        message.sender === "user"
                          ? "text-blue-100"
                          : "text-blue-400"
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>

                  {/* User Icon - Right Side */}
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-blue-400 flex items-center justify-center ml-2 shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-700"
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

        {/* Input form */}
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Describe your symptoms or ask a health question..."
              className="w-full p-3 bg-white rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all shadow-sm text-gray-700 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
