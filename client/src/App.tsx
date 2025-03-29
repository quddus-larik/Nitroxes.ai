import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Chat from './components/chat.tsx';
import axios from 'axios';

function App() {
  const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();

  // Handle user sign-in
  const handleSignIn = async () => {
    await loginWithRedirect();
  }
  user? console.log("User signed in:", user) : console.log("User not signed in");
  
  // Use useEffect to handle the post-login API call
  useEffect(() => {
    const registerUser = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await axios.post("/sign-in", { 
            email: user.email, 
            nickname: user.nickname || user.name 
          });
          if(!response.data){
            console.log("User already registered");
            sessionStorage.setItem("UserSession", JSON.stringify(response.data.previousRequests));
            console.log("Previous chats saved to session storage");
            return;
          }else{
          console.log("User registration successful:", response.data);
          sessionStorage.setItem("UserSession", JSON.stringify(response.data.user.previousRequests));
          console.log("Previous chats saved to session storage");
          }
        } catch (err) {
          console.error("Error registering user:", err);
        }
      }
    };
    
    registerUser();
  }, [isAuthenticated, user]);
  
  return (
    <div className="min-h-screen text-white bg-gray-900">
      <nav className="bg-gray-800 shadow-md">
        <div className="flex justify-between items-center px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-white">
            {isAuthenticated && user ? user.nickname : "AI Chatbot"}
          </h1>
          {
            isAuthenticated ? 
            <button 
              onClick={() => logout()}
              className="px-4 py-2 text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
            >
              Logout
            </button> : 
            <button 
              onClick={handleSignIn}
              className="px-4 py-2 text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
            >
              Sign In
            </button>
          }
        </div>
      </nav>
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {isAuthenticated && user? <Chat profile={user}/> : (
          <div className='flex flex-col justify-center items-center w-full h-full'>
            
            <h2 className="mb-4 text-2xl font-bold text-white">AI Chatbot</h2>
            <p className="text-gray-400">Please sign in to start a conversation.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;