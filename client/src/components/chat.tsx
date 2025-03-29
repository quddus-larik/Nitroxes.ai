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

  const loadChatHistory = useCallback(() => {
    if (!profile?.email) {
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);
    console.log("Fetching chat history for:", profile.email);

    const Prev_Req = sessionStorage.getItem("UserSession");
    if (Prev_Req) {
      const prevChats = JSON.parse(Prev_Req);
      console.log("Previous chats loaded from session storage:", prevChats);
      setMessages(prevChats);
      setIsLoadingHistory(false);
      return;
    }
  }, [profile?.email]);

  useEffect(() => {
    loadChatHistory();
  }, [profile.email]);

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

    try {
      const chatResponse = await axios.post("/chat", {
        prompt: `User: ${userMessage}\nAssistant:`,
      });

      const botResponse =
        chatResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response";

      if (profile?.email) {
        try {
          await axios
            .post("/save-chat", {
              email: profile.email,
              chat: {
                user_input: userMessage,
                response: botResponse,
                timestamp: new Date(),
              },
            })
            .then(() => {
              console.log("Chat saved successfully");
            })
            .catch((saveError) => {
              console.error("Error saving chat:", saveError);
            });
        } catch (saveError) {
          console.error("Error saving chat:", saveError);
        }
        const userMessage = input.trim();
        setMessages((prevMessages) => [
          ...prevMessages,
          { user_input: userMessage, response: botResponse, timestamp: new Date() },
        ]);
        setInput("");
        setIsLoading(true);
      }
    } catch (error) {
      console.error("Error in chat:", error);
    }

    setIsLoading(false);
    textareaRef.current?.focus();
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
        AI Chatbot{" "}
        {profile?.nickname ? (
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({profile.nickname})
          </span>
        ) : (
          ""
        )}
      </h2>

      <div className="overflow-y-auto relative flex-1 mb-4 space-y-4">
        {isLoadingHistory && (
          <p className="text-gray-400">Loading chat history...</p>
        )}
        {!isLoadingHistory && messages.length == 0 && (
          <p className="text-center text-gray-400">
            No messages yet. Start a conversation!
          </p>
        )}
        {!isLoadingHistory &&
          messages.length > 0 &&
          messages.map((msg, index) => (
            <div key={`msg-${index}`} className="space-y-2 animate-fadeIn">
              <div className="flex justify-end">
                <div className="px-4 py-2 max-w-xs text-white bg-blue-600 rounded-lg shadow-md">
                  <p>{msg.user_input}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="px-4 py-2 max-w-xs bg-gray-700 rounded-lg shadow-md prose prose-invert">
                  <ReactMarkdown>{msg.response}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box and send button */}
      <div className="sticky bottom-0 pt-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="p-3 w-full text-white bg-gray-700 rounded-md border border-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleChat}
            disabled={isLoading || !input.trim()}
            className={`p-3 text-white rounded-md ${
              isLoading || !input.trim()
                ? "bg-blue-500 opacity-50 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <svg
                className="w-6 h-6 animate-spin"
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
            ) : (
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
