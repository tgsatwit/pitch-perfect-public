'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
        <p className="text-gray-600 mb-4">
          There was an error processing your authentication request. The link may be invalid or expired.
        </p>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/auth/login"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </Link>
          <Link 
            href="/"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 