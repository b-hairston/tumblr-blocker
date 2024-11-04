// app/layout.tsx
"use client";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <header className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Tumblr Block Transfer Tool
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Easily transfer blocked blogs from one account to another.
              </p>
            </header>
            <main>{children}</main>
            <footer className="text-center text-xs text-gray-400 mt-6">
              © 2024 Tumblr Block Transfer
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
