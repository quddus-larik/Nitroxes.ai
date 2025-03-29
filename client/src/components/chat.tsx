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

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const chatResponse = await axios.post("/chat", {
        prompt: `User: ${userMessage}\nAssistant:`,
      });

      const botResponse =
        chatResponse.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response";

      // Update messages with the new conversation
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          { user_input: userMessage, response: botResponse, timestamp: new Date() }
        ];
        
        // Save to session storage
        sessionStorage.setItem("UserSession", JSON.stringify(newMessages));
        return newMessages;
      });

      if (profile?.email) {
        try {
          await axios.post("/save-chat", {
            email: profile.email,
            chat: {
              user_input: userMessage,
              response: botResponse,
              timestamp: new Date(),
            },
          }).then(() => {
            console.log("Chat saved successfully");
          }).catch((saveError) => {
            console.error("Error saving chat:", saveError);
          });
        } catch (saveError) {
          console.error("Error saving chat:", saveError);
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);
    }

    setIsLoading(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col p-6 mx-auto max-w-4xl h-screen bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-xl">
      <h2 className="flex items-center mb-6 text-2xl font-bold text-white">
        <div className="flex items-center justify-center mr-3 w-10 h-10 bg-blue-500/20 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-blue-400"
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
        </div>
        <span className="text-white">
          Nitroxes AI
        </span>
        {profile?.nickname ? (
          <span className="ml-3 px-3 py-1 text-sm font-medium text-blue-200 bg-blue-900/30 rounded-full border border-blue-700/30">
            {profile.nickname}
          </span>
        ) : (
          ""
        )}
      </h2>

      <div className="overflow-y-auto relative flex-1 mb-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {isLoadingHistory && (
          <div className="flex justify-center items-center h-full">
            <div className="px-6 py-4 bg-gray-700/50 rounded-lg backdrop-blur-sm border border-gray-600/30">
              <div className="flex space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        {!isLoadingHistory && messages.length == 0 && (
          <div className="flex flex-col justify-center items-center h-full space-y-6">
            <div className="p-8 rounded-full bg-blue-500/10 border border-blue-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-20 h-20 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-xl font-semibold text-white">No conversations yet</h3>
              <p className="text-gray-400 text-lg">
                Start a conversation with Nitroxes AI
                <br />
                <span className="text-blue-400">Ask anything you'd like to know!</span>
                
              </p>
            </div>
          </div>
        )}
        {!isLoadingHistory &&
          messages.length > 0 &&
          messages.map((msg, index) => (
            <div key={`msg-${index}`} className="space-y-4 animate-fadeIn">
              <div className="flex justify-end">
                <div className="px-5 py-3 max-w-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl rounded-tr-none shadow-lg border border-blue-500/30">
                  <p className="leading-relaxed">{msg.user_input}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="px-5 py-3 max-w-sm bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl rounded-tl-none shadow-lg prose prose-invert border border-gray-600/30">
                  <ReactMarkdown
                    components={{
                      code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg my-3"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={`${className} bg-gray-800 px-1 py-0.5 rounded`} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.response}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box and send button */}
      <div className="sticky bottom-0 pt-4 bg-gradient-to-b from-transparent to-gray-900 border-t border-gray-700/30">
        <div className="flex items-center space-x-3 bg-gray-700/30 p-3 rounded-xl backdrop-blur-sm border border-gray-600/20">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="p-3 w-full text-white bg-gray-700/50 rounded-lg border border-gray-600/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleChat}
            disabled={isLoading || !input.trim()}
            className={`p-3 text-white rounded-lg transition-all duration-200 ${
              isLoading || !input.trim()
                ? "bg-blue-500/50 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-blue-500/20"
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
