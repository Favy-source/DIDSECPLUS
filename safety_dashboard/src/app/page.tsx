"use client";
import { useAuthStore } from '@/store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// ...existing code...

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
  }));
  const [showSetupOption, setShowSetupOption] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        const timeout = setTimeout(() => setShowSetupOption(true), 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
          {showSetupOption && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
              <p className="text-sm text-gray-600 mb-3">
                Need to create initial super admin account?
              </p>
              <button
                onClick={() => router.push('/setup')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Initial Setup
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null; // This component will redirect, so no content needed
}
