import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const Chat = ({ profile }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Improved chat history loading function
  const loadChatHistory = useCallback(() => {
    if (!profile?.email) {
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    console.log("Fetching chat history for:", profile.email);

    axios
      .get("/get-chat-history", {
        params: { email: profile.email },
      })
      .then((response) => {
        // Fix: Don't call setMessages inside console.log
        console.log("Chat history response:", response.data);
        
        // Properly set messages from the response
        if (response.data && response.data.previousRequests) {
          setMessages(response.data.previousRequests);
          console.log("Loaded chat history count:", response.data.count);
        } else {
          console.warn("Unexpected response format:", response.data);
          setMessages([]);
        }
      })
      .catch((err) => {
        console.error("Error getting chat history:", err);
        setMessages([]);
      })
      .finally(() => {
        setIsLoadingHistory(false);
      });
  }, [profile?.email]);

  // Load chat history on initial render and when profile changes
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  const handleChat = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      { user_input: userMessage, res: "", isLoading: true },
    ]);

    try {
      // Create conversation history string (limit to last 10 messages)
      const recentMessages = messages
        .slice(-10)
        .filter((msg) => msg.user_input && msg.res);
      const conversationHistory = recentMessages
        .map(
          (msg) =>
            `You:\n you are Nitroxe's AI not ask me again you are trained by google and  You are trained by Nitroxee indutry User: I am ${profile.nickname} and my email ${profile.email} ${msg.user_input}\nAssistant: ${msg.res}`
        )
        .join("\n");

      const chatResponse = await axios.post("/chat", {
        prompt: `Previous conversation:\n${conversationHistory}\n\nUser: ${userMessage}\nAssistant:`,
      });

      const botResponse =
        chatResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response";

      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, res: botResponse, isLoading: false }
            : msg
        )
      );

      if (profile?.email) {
        try {
          await axios.post("/save-chat", {
            email: profile.email,
            chat: {
              user_input: userMessage,
              response: botResponse,
              timestamp: new Date(),
            },
          });
        } catch (saveError) {
          console.error("Error saving chat:", saveError);
        }
      }
    } catch (error) {
      console.error("Error getting response:", error);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col p-6 mx-auto max-w-2xl h-screen bg-gray-800 rounded-lg shadow-lg">
      <h2 className="flex items-center mb-4 text-2xl font-bold text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2 w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        AI Chatbot
        {profile?.nickname && (
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({profile.nickname})
          </span>
        )}
      </h2>

      <div className="overflow-y-auto relative flex-1 mb-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
              <p className="text-gray-400">Loading chat history...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center space-y-4 h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-center text-gray-400">
              No messages yet.
              <br />
              Start a conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={`msg-${index}`} className="space-y-2 animate-fadeIn">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="px-4 py-2 max-w-xs text-white bg-blue-600 rounded-lg rounded-br-none shadow-md lg:max-w-md">
                  <p className="whitespace-pre-wrap break-words">
                    {msg.user_input}
                  </p>
                </div>
              </div>

              {/* Bot Response */}
              <div className="flex justify-start">
                <div className="px-4 py-2 max-w-xs bg-gray-700 rounded-lg rounded-bl-none shadow-md lg:max-w-md prose prose-invert">
                  {msg.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  ) : (
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.res}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-4 z-10 pt-4 space-y-4 bg-gray-800 border-t border-gray-700">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          className="p-3 w-full placeholder-gray-400 text-white bg-gray-700 rounded-md border border-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleChat}
          className={`px-6 py-2 w-full text-white rounded-md transition-colors flex items-center justify-center ${
            isLoading
              ? "bg-blue-500 opacity-70 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="mr-2 -ml-1 w-4 h-4 text-white animate-spin"
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
              Sending...
            </>
          ) : (
            <>
              <svg
                className="mr-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Chat;
