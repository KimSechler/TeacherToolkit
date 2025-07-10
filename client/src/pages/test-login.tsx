import { useState } from "react";

export default function TestLogin() {
  const [message, setMessage] = useState("Test Login Page Loaded!");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Login Page</h1>
        <p className="mb-4">{message}</p>
        <button 
          onClick={() => setMessage("Button clicked! " + new Date().toLocaleTimeString())}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Click me!
        </button>
        <div className="mt-4">
          <a href="/login" className="text-blue-500 hover:underline">Go to real login page</a>
        </div>
      </div>
    </div>
  );
} 