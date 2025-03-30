import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Chat from './components/chat';
import axios from 'axios';

function App() {
  const { user, loginWithRedirect, logout, isAuthenticated, isLoading: authLoading } = useAuth0();
  const [isUserRegistered, setIsUserRegistered] = useState(false);

  const handleSignIn = async () => {
    await loginWithRedirect();
  }
  
  useEffect(() => {
    if (user) {
      console.log("User signed in:", user);
    } else {
      console.log("User not signed in");
    }
  }, [user]);
  
  useEffect(() => {
    const registerUser = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await axios.post("/sign-in", { 
            email: user.email, 
            nickname: user.nickname || user.name 
          });
          
          if (!response.data) {
            console.log("User already registered");
            setIsUserRegistered(true);
            return;
          } else {
            console.log("User registration successful:", response.data);
            
            const previousRequests = response.data.user?.previousRequests || [];
            sessionStorage.setItem("UserSession", JSON.stringify(previousRequests));
            console.log("Previous chats saved to session storage");
            setIsUserRegistered(true);
          }
        } catch (err) {
          console.error("Error registering user:", err);
          setIsUserRegistered(true);
        }
      }
    };
    
    registerUser();
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="px-6 py-4 rounded-lg border backdrop-blur-sm bg-gray-700/50 border-gray-600/30">
          <div className="flex space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen text-white bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 border-b shadow-lg backdrop-blur-sm border-gray-700/30">
        <div className="flex justify-between items-center px-6 py-4 mx-auto max-w-7xl">
          <h1 className="flex items-center text-xl font-bold">
            <div className="flex justify-center items-center mr-3 w-10 h-10 rounded-full border bg-blue-500/20 border-blue-500/30">
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
            <span className="flex flex-row gap-3 justify-center items-center text-white">
              {isAuthenticated && user ? <img src={user.picture} alt="Profile" className="object-cover w-8 h-8 rounded-full border border-gray-600/50" /> : null}
              {isAuthenticated && user ? user.nickname : "Nitroxes AI"}
            </span>
          </h1>
          {
            isAuthenticated ? 
            <button 
              onClick={() => logout({ returnTo: window.location.origin })}
              className="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg border shadow-lg transition-all duration-200 hover:from-red-700 hover:to-red-800 border-red-500/30"
            >
              Logout
            </button> : 
            <button 
              onClick={handleSignIn}
              className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg border shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 border-blue-500/30"
            >
              Sign In
            </button>
          }
        </div>
      </nav>
      <main className="px-4 py-8 mx-auto max-w-7xl">
        {isAuthenticated && user ? <Chat key={user.email} profile={user}/> : (
          <div className="flex flex-col justify-center items-center w-full h-[80vh]">
            <div className="p-10 w-full max-w-md bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border shadow-xl backdrop-blur-sm border-gray-700/30">
              <div className="flex flex-col items-center space-y-8">
                <div className="p-8 rounded-full border bg-blue-500/10 border-blue-500/20">
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
                  <h2 className="mb-3 text-3xl font-bold text-white">
                    Nitroxes AI
                  </h2>
                  <p className="mb-6 text-center text-gray-400">
                    Your intelligent AI assistant powered by advanced language models.
                    <br />
                    Please sign in to start a conversation.
                  </p>
                </div>
                <button 
                  onClick={handleSignIn}
                  className="flex justify-center items-center px-6 py-3 w-full text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg border shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 border-blue-500/30"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mr-2 w-5 h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                    />
                  </svg>
                  Sign In to Continue
                </button>
                <span className='text-sm text-orange-400'>Project is Developed my Quddus & fully open source for solving Issues, add Features and more. </span>
                
                <div className="pt-4 mt-4 w-full border-t border-gray-700/50">
                  <a 
                    href="https://github.com/EnderTonol" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex justify-center items-center text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-2 w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>Open Source Contribution</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;