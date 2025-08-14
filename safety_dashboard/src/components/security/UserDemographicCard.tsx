"use client";

import { useState, useEffect } from "react";
import { LocationService } from "@/services/locations";
import { MoreDotIcon } from "@/components/icons/MoreDotIcon";

export default function UserDemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [topStates, setTopStates] = useState<Array<{ state: string; users: number; percentage: number }>>([]);

  useEffect(() => {
    // Mock user distribution data - in real app this would come from API
    const mockUserData = {
      'Lagos': 432,
      'Abuja': 287,
      'Kano': 156,
      'Rivers': 134,
      'Oyo': 98,
      'Anambra': 87,
      'Kaduna': 76,
      'Enugu': 65,
      'Delta': 54,
      'Edo': 43,
      'Cross River': 38,
      'Akwa Ibom': 35,
      'Plateau': 32,
      'Benue': 29,
      'Niger': 26,
      'Kwara': 23,
      'Osun': 21,
      'Ondo': 19,
      'Ogun': 18,
      'Ekiti': 16
    };

    const totalUsers = Object.values(mockUserData).reduce((sum, count) => sum + count, 0);
    
    const statesWithPercentage = Object.entries(mockUserData)
      .map(([state, users]) => ({
        state,
        users,
        percentage: Math.round((users / totalUsers) * 100)
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 5); // Top 5 states

    setTopStates(statesWithPercentage);
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            User Demographics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of users based on Nigerian states
          </p>
        </div>

        <div className="relative inline-block">
          <button 
            onClick={toggleDropdown} 
            className="dropdown-toggle"
            title="Demographics options"
            aria-label="Demographics options menu"
          >
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>

          {isOpen && (
            <div className="absolute right-0 z-20 w-40 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                View Full Report
              </button>
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export Data
              </button>
              <button
                onClick={closeDropdown}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Regional Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div className="h-[212px] w-full flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full dark:bg-blue-900 mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m-6 3l6-3" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nigerian Map</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Interactive map coming soon</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
          Top States by User Count
        </h4>
        
        {topStates.map((stateData, index) => (
          <div key={stateData.state} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-blue-600 rounded-full dark:bg-blue-500">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {stateData.state} State
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stateData.users.toLocaleString()} users
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {stateData.percentage}%
              </div>
              <div className="w-16 h-2 bg-gray-200 rounded-full dark:bg-gray-700 mt-1">
                <div 
                  className="h-2 bg-blue-600 rounded-full dark:bg-blue-500"
                  style={{ width: `${Math.min(stateData.percentage * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total Coverage</span>
            <span>{LocationService.getAllStates().length} States</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Active Regions</span>
            <span>6 Geopolitical Zones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
