// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function HomePage() {
  const [sourceAuthenticated, setSourceAuthenticated] = useState(false);
  const [sourceBlog, setSourceBlog] = useState("");
  const [targetBlog, setTargetBlog] = useState("");

  useEffect(() => {
    const checkAuthStatus = async () => {
      const response = await axios.get("/api/auth/status");
      setSourceAuthenticated(response.data.sourceAuthenticated);
    };
    checkAuthStatus();
  }, []);

  const loginWithTumblr = () => {
    window.location.href = `/api/auth/login?accountType=source`; // Only need source account for this flow
  };

  const handleTransfer = async () => {
    if (!sourceAuthenticated) {
      alert("Please log in to your source account.");
      return;
    }
    try {
      const response = await axios.post("/api/transfer", { sourceBlog, targetBlog });
      alert(response.data.message);
    } catch (error) {
      console.error("Error during transfer:", error);
      alert("Failed to transfer blocks: " + error.response?.data.error || "Unknown error");
    }
  };

  return (
    <div className="space-y-6">
      {!sourceAuthenticated ? (
        <button
          onClick={loginWithTumblr}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none"
        >
          Login with Tumblr (Source Account)
        </button>
      ) : (
        <>
          <div>
            <label htmlFor="sourceBlog" className="block text-sm font-medium text-gray-700">
              Source Blog Identifier
            </label>
            <input
              type="text"
              id="sourceBlog"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={sourceBlog}
              onChange={(e) => setSourceBlog(e.target.value)}
              placeholder="Enter source blog ID"
            />
          </div>

          <div>
            <label htmlFor="targetBlog" className="block text-sm font-medium text-gray-700">
              Target Blog Identifier
            </label>
            <input
              type="text"
              id="targetBlog"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={targetBlog}
              onChange={(e) => setTargetBlog(e.target.value)}
              placeholder="Enter target blog ID"
            />
          </div>

          <button
            onClick={handleTransfer}
            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none"
          >
            Transfer Blocks
          </button>
        </>
      )}
    </div>
  );
}
// TODO: add credentials entries for both accounts FUCK THATS WHY NOTHING WORKED DAMMIT
//SIMPLIFY FLOW: AUTH TO ACCT 1, GET BLOCKS, AUTH TO ACCT 2, BULK BLOCK
