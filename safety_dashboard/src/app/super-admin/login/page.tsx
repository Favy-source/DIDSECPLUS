"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface LoginFormData {
  email: string;
  password: string;
}

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const { login, isLoading, error, user, isAuthenticated } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      // After login, check if user is super_admin
      const currentUser = useAuthStore.getState().user;
      console.log('Logged in user:', currentUser);
      if (currentUser?.role === 'super_admin') {
        router.push('/super-admin/dashboard');
      } else {
        // If not super_admin, show error and logout
        useAuthStore.getState().logout();
        alert('Access denied. Super admin privileges required.');
      }
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">🔐 Super Admin Portal</h1>
          <p className="mt-2 text-sm text-gray-600">System Administrator Access</p>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Super Administrator Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Complete system control and management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Super Admin Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="superadmin@security.gov.ng"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In as Super Admin'
                )}
              </button>
            </div>

            {/* Links */}
            <div className="text-center space-y-2">
              <div>
                <button
                  type="button"
                  onClick={() => router.push('/setup')}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Need to create initial super admin account?
                </button>
              </div>
              <div>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Other Login Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">Other Portals</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-800 py-2 px-3 rounded-md transition-colors"
                >
                  👤 User
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/police/login')}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-3 rounded-md transition-colors"
                >
                  👮‍♂️ Police
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/login')}
                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-3 rounded-md transition-colors"
                >
                  👨‍💼 Admin
                </button>
              </div>
            </div>
          </form>

          {/* Emergency Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-900">System Emergency</p>
              <p className="text-lg font-bold text-red-600">199 | 911</p>
              <p className="text-xs text-gray-500">24/7 Technical Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
