"use client";
import { useAuth } from '@/hooks/useAuth'; // Import the custom hook
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, _hasHydrated } = useAuth(); // Use custom hook
  const [showSetupOption, setShowSetupOption] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        const timeout = setTimeout(() => setShowSetupOption(true), 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [isAuthenticated, isLoading, _hasHydrated, router]);

  // Show loading while hydrating or checking auth status
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {!_hasHydrated ? 'Loading...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  // Show setup option after delay if not authenticated
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {!isAuthenticated && (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome</h1>
            <p className="text-gray-600 mb-6">Please sign in to continue</p>
            
            {showSetupOption && (
              <div className="mt-6 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
                <p className="text-sm text-gray-600 mb-4">
                  Need to create initial super admin account?
                </p>
                <button
                  onClick={() => router.push('/setup')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Initial Setup
                </button>
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Go to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}