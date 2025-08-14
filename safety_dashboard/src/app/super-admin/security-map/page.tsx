"use client";

import React, { useState, useEffect } from 'react';
// ...existing code...
import { useRouter } from 'next/navigation';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';

interface StateData {
  name: string;
  code: string;
  alerts: number;
  population: number;
  status: 'safe' | 'moderate' | 'high' | 'critical';
}

const nigerianStates: StateData[] = [
  { name: 'Abia', code: 'AB', alerts: 15, population: 3960000, status: 'moderate' },
  { name: 'Adamawa', code: 'AD', alerts: 8, population: 4250000, status: 'safe' },
  { name: 'Akwa Ibom', code: 'AK', alerts: 22, population: 5530000, status: 'moderate' },
  { name: 'Anambra', code: 'AN', alerts: 31, population: 5530000, status: 'high' },
  { name: 'Bauchi', code: 'BA', alerts: 45, population: 6540000, status: 'critical' },
  { name: 'Bayelsa', code: 'BY', alerts: 18, population: 2280000, status: 'moderate' },
  { name: 'Benue', code: 'BE', alerts: 67, population: 5740000, status: 'critical' },
  { name: 'Borno', code: 'BO', alerts: 89, population: 5860000, status: 'critical' },
  { name: 'Cross River', code: 'CR', alerts: 14, population: 3740000, status: 'safe' },
  { name: 'Delta', code: 'DE', alerts: 39, population: 5660000, status: 'high' },
  { name: 'Ebonyi', code: 'EB', alerts: 12, population: 2880000, status: 'safe' },
  { name: 'Edo', code: 'ED', alerts: 33, population: 4240000, status: 'high' },
  { name: 'Ekiti', code: 'EK', alerts: 9, population: 3270000, status: 'safe' },
  { name: 'Enugu', code: 'EN', alerts: 27, population: 4400000, status: 'moderate' },
  { name: 'Gombe', code: 'GO', alerts: 19, population: 3260000, status: 'moderate' },
  { name: 'Imo', code: 'IM', alerts: 41, population: 5400000, status: 'high' },
  { name: 'Jigawa', code: 'JI', alerts: 25, population: 5830000, status: 'moderate' },
  { name: 'Kaduna', code: 'KD', alerts: 78, population: 8250000, status: 'critical' },
  { name: 'Kano', code: 'KN', alerts: 56, population: 13980000, status: 'critical' },
  { name: 'Katsina', code: 'KT', alerts: 34, population: 7830000, status: 'high' },
  { name: 'Kebbi', code: 'KE', alerts: 16, population: 4440000, status: 'moderate' },
  { name: 'Kogi', code: 'KG', alerts: 29, population: 4470000, status: 'moderate' },
  { name: 'Kwara', code: 'KW', alerts: 21, population: 3190000, status: 'moderate' },
  { name: 'Lagos', code: 'LA', alerts: 125, population: 14860000, status: 'critical' },
  { name: 'Nasarawa', code: 'NA', alerts: 17, population: 2520000, status: 'moderate' },
  { name: 'Niger', code: 'NI', alerts: 38, population: 5560000, status: 'high' },
  { name: 'Ogun', code: 'OG', alerts: 44, population: 5220000, status: 'high' },
  { name: 'Ondo', code: 'ON', alerts: 23, population: 4670000, status: 'moderate' },
  { name: 'Osun', code: 'OS', alerts: 28, population: 4710000, status: 'moderate' },
  { name: 'Oyo', code: 'OY', alerts: 52, population: 7840000, status: 'critical' },
  { name: 'Plateau', code: 'PL', alerts: 35, population: 4200000, status: 'high' },
  { name: 'Rivers', code: 'RI', alerts: 47, population: 7300000, status: 'high' },
  { name: 'Sokoto', code: 'SO', alerts: 26, population: 4998000, status: 'moderate' },
  { name: 'Taraba', code: 'TA', alerts: 32, population: 2990000, status: 'high' },
  { name: 'Yobe', code: 'YO', alerts: 43, population: 3290000, status: 'high' },
  { name: 'Zamfara', code: 'ZA', alerts: 61, population: 4160000, status: 'critical' },
];

import { useAuthStore } from '@/store/auth';

const SecurityMap = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [viewMode, setViewMode] = useState<'alerts' | 'status'>('alerts');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'super_admin')) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-body dark:text-bodydark">Loading Security Map...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-success text-white';
      case 'moderate': return 'bg-warning text-white';
      case 'high': return 'bg-danger text-white';
      case 'critical': return 'bg-danger text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAlertColor = (alerts: number) => {
    if (alerts < 20) return 'bg-success';
    if (alerts < 40) return 'bg-warning';
    if (alerts < 60) return 'bg-danger';
    return 'bg-red-600';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-1 dark:bg-black">
          <div className="p-4 md:p-6 2xl:p-10">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-title-md2 font-semibold text-black dark:text-white">
                Nigerian Security Map
              </h1>
              <p className="text-regular text-body dark:text-bodydark">
                Real-time security status across all 36 Nigerian states
              </p>
            </div>

            {/* Controls */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('alerts')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'alerts'
                      ? 'bg-primary text-white'
                      : 'bg-gray-2 dark:bg-meta-4 text-body dark:text-bodydark'
                  }`}
                >
                  Alert Count View
                </button>
                <button
                  onClick={() => setViewMode('status')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'status'
                      ? 'bg-primary text-white'
                      : 'bg-gray-2 dark:bg-meta-4 text-body dark:text-bodydark'
                  }`}
                >
                  Status View
                </button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-body dark:text-bodydark">Total States:</span>
                <span className="font-medium text-black dark:text-white">36</span>
              </div>
            </div>

            {/* Map Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* States Grid */}
              <div className="lg:col-span-3">
                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-4">
                    State Security Status
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {nigerianStates.map((state) => (
                      <button
                        key={state.code}
                        onClick={() => setSelectedState(state)}
                        className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedState?.code === state.code
                            ? 'border-primary bg-primary/10'
                            : 'border-stroke dark:border-strokedark hover:border-primary/50'
                        } ${
                          viewMode === 'status'
                            ? getAlertColor(state.alerts)
                            : 'bg-white dark:bg-boxdark'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-xs font-bold mb-1 ${
                            viewMode === 'status' ? 'text-white' : 'text-black dark:text-white'
                          }`}>
                            {state.code}
                          </div>
                          <div className={`text-xs ${
                            viewMode === 'status' ? 'text-white' : 'text-body dark:text-bodydark'
                          }`}>
                            {state.name}
                          </div>
                          {viewMode === 'alerts' && (
                            <div className="text-xs font-medium mt-1 text-primary">
                              {state.alerts} alerts
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-stroke dark:border-strokedark">
                    <h4 className="text-sm font-medium text-black dark:text-white mb-3">Legend:</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-success rounded"></div>
                        <span className="text-xs text-body dark:text-bodydark">Safe (0-19 alerts)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-warning rounded"></div>
                        <span className="text-xs text-body dark:text-bodydark">Moderate (20-39 alerts)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-danger rounded"></div>
                        <span className="text-xs text-body dark:text-bodydark">High (40-59 alerts)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-600 rounded"></div>
                        <span className="text-xs text-body dark:text-bodydark">Critical (60+ alerts)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* State Details */}
              <div className="lg:col-span-1">
                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                    State Details
                  </h3>
                  
                  {selectedState ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-black dark:text-white text-lg">
                          {selectedState.name} State
                        </h4>
                        <p className="text-sm text-body dark:text-bodydark">
                          Code: {selectedState.code}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-body dark:text-bodydark">Active Alerts:</span>
                          <span className="font-medium text-black dark:text-white">
                            {selectedState.alerts}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-body dark:text-bodydark">Population:</span>
                          <span className="font-medium text-black dark:text-white">
                            {(selectedState.population / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-body dark:text-bodydark">Status:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedState.status)}`}>
                            {selectedState.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-body dark:text-bodydark">Risk Level:</span>
                          <span className="font-medium text-black dark:text-white">
                            {selectedState.alerts / selectedState.population * 1000000 > 10 ? 'High' : 'Moderate'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-stroke dark:border-strokedark">
                        <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
                          View State Dashboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-body dark:text-bodydark">
                      <div className="text-4xl mb-2">🗺️</div>
                      <p className="text-sm">Click on a state to view details</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                    Quick Stats
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-body dark:text-bodydark">Total Alerts:</span>
                      <span className="font-medium text-black dark:text-white">
                        {nigerianStates.reduce((sum, state) => sum + state.alerts, 0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-body dark:text-bodydark">Critical States:</span>
                      <span className="font-medium text-danger">
                        {nigerianStates.filter(s => s.status === 'critical').length}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-body dark:text-bodydark">Safe States:</span>
                      <span className="font-medium text-success">
                        {nigerianStates.filter(s => s.status === 'safe').length}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-body dark:text-bodydark">Population:</span>
                      <span className="font-medium text-black dark:text-white">
                        {(nigerianStates.reduce((sum, state) => sum + state.population, 0) / 1000000).toFixed(0)}M
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SecurityMap;
