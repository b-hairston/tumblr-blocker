"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface BlockedBlog {
  name: string;
}

export default function HomePage() {
  const [sourceAuthenticated, setSourceAuthenticated] = useState(false);
  const [targetAuthenticated, setTargetAuthenticated] = useState(false);
  const [sourceBlog, setSourceBlog] = useState("");
  const [targetBlog, setTargetBlog] = useState("");
  const [blockedBlogs, setBlockedBlogs] = useState<BlockedBlog[]>([]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const response = await axios.get("/api/auth/status");
      setSourceAuthenticated(response.data.sourceAuthenticated);
      setTargetAuthenticated(response.data.targetAuthenticated);
    };
    checkAuthStatus();
  }, []);

  const loginWithSource = () => {
    window.location.href = `/api/auth/login?accountType=source`;
  };

  const loginWithTarget = () => {
    window.location.href = `/api/auth/login?accountType=target`;
  };

  const fetchBlockedBlogs = async () => {
    if (!sourceBlog) {
      alert("Please enter the source blog ID.");
      return;
    }

    try {
      const response = await axios.get(`/api/auth/transfer?sourceBlog=${sourceBlog}`);
      setBlockedBlogs(response.data.blockedBlogs);
      alert("Blocked blogs retrieved successfully.");
    } catch (error) {
      console.error("Failed to retrieve blocked blogs:", error);
      alert("Failed to retrieve blocked blogs. Please try again.");
    }
  };

  const bulkBlockOnTarget = async () => {
    if (!targetAuthenticated) {
      alert("Please log in to the target account to proceed with the bulk block.");
      loginWithTarget(); // Redirects to the target authentication flow
      return;
    }
  
    // Proceed with bulk blocking logic if target is authenticated
    if (!targetBlog || blockedBlogs.length === 0) {
      alert("Please enter the target blog ID and ensure blocked blogs are loaded.");
      return;
    }
  
    try {
      const response = await axios.post("/api/auth/transfer", {
        sourceBlog,
        targetBlog,
        blockedBlogs: blockedBlogs.map(blog => blog.name),
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Failed to bulk block on target:", error);
      alert("Failed to bulk block on target. Please try again.");
    }
  };
  return (
    <div className="space-y-6">
      {!sourceAuthenticated ? (
        <button onClick={loginWithSource} className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none">
          Login with Tumblr (Source Account)
        </button>
      ) : !targetAuthenticated ? (
        <button onClick={loginWithTarget} className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none">
          Login with Tumblr (Target Account)
        </button>
      ) : (
        <>
          <div>
            <label htmlFor="sourceBlog" className="block text-sm font-medium text-gray-700">Source Blog Identifier</label>
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
            <label htmlFor="targetBlog" className="block text-sm font-medium text-gray-700">Target Blog Identifier</label>
            <input
              type="text"
              id="targetBlog"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={targetBlog}
              onChange={(e) => setTargetBlog(e.target.value)}
              placeholder="Enter target blog ID"
            />
          </div>

          <button onClick={fetchBlockedBlogs} className="w-full py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none">
            Fetch Blocked Blogs
          </button>

          {blockedBlogs.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Blocked Blogs:</h3>
              <ul className="list-disc pl-5">
                {blockedBlogs.map((blog, index) => (
                  <li key={index}>{blog.name}</li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={bulkBlockOnTarget} className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none">
            Bulk Block on Target
          </button>
        </>
      )}
    </div>
  );
}
