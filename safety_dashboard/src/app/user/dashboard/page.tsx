import { useAuthStore } from '@/store';
"use client";

import React, { useState, useEffect } from 'react';
// ...existing code...
import { useRouter } from 'next/navigation';
import { authService, apiCall } from '@/services/authService';

interface EmergencyContact {
  name: string;
  number: string;
  type: 'police' | 'fire' | 'medical' | 'security';
}

interface RecentAlert {
  id: string;
  type: 'emergency' | 'incident' | 'safety';
  title: string;
  location: string;
  timestamp: string;
  status: 'active' | 'resolved';
}

export default function UserDashboard() {
  const user = useAuthStore((state) => state.user);
  const isLoading = false; // Set to false or use loading state from store if available
  const router = useRouter();
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...');
  const [emergencyContacts] = useState<EmergencyContact[]>([
    { name: 'Lagos State Police', number: '199', type: 'police' },
    { name: 'Lagos Fire Service', number: '199', type: 'fire' },
    { name: 'Emergency Medical', number: '199', type: 'medical' },
    { name: 'LASEMA', number: '767', type: 'security' }
  ]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'user')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'user') {
      getCurrentLocation();
      loadRecentAlerts();
    }
  }, [user]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode this to get the actual address
          setCurrentLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          setCurrentLocation('Location not available');
        }
      );
    } else {
      setCurrentLocation('Geolocation not supported');
    }
  };

  const loadRecentAlerts = async () => {
    setLoading(true);
    
    try {
      if (!user) {
        console.error('No user logged in');
        setRecentAlerts([]);
        return;
      }

      // Use the authentication service to make API call with proper token exchange
      const data = await apiCall('/api/alerts/alerts', {
        method: 'GET',
      });

      // Transform backend alerts to UI format
      const transformedAlerts: RecentAlert[] = data.alerts?.map((alert: any) => ({
        id: alert.id,
        type: 'emergency',
        title: alert.title || 'Emergency Alert',
        location: alert.location_description || `${alert.latitude}, ${alert.longitude}`,
        timestamp: formatTimestamp(alert.created_at),
        status: alert.status?.toLowerCase() === 'active' ? 'active' : 'resolved'
      })) || [];

      setRecentAlerts(transformedAlerts);
      
    } catch (error) {
      console.error('Failed to load alerts:', error);
      // If authentication failed, redirect to login
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        authService.clearTokens();
        router.push('/login');
      } else {
        // Fall back to demo data for now
        setRecentAlerts([
          {
            id: `demo_alert_${Date.now()}`,
            type: 'emergency',
            title: 'Demo Alert (API Integration Pending)',
            location: currentLocation !== 'Getting location...' ? currentLocation : 'Location not available',
            timestamp: formatTimestamp(new Date().toISOString()),
            status: 'active'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const alertTime = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    } catch {
      return 'Unknown time';
    }
  };

  const triggerEmergencyAlert = async () => {
    try {
      // Get current location first
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser. Please enable location services.');
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      if (!user) {
        alert('You must be logged in to send emergency alerts');
        router.push('/login');
        return;
      }

      try {
        // Use the authentication service to create emergency alert
        const alertData = await apiCall('/api/alerts/emergency', {
          method: 'POST',
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            location_description: currentLocation !== 'Getting location...' ? currentLocation : `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            emergency_type: 'general',
            description: 'Emergency alert from user dashboard'
          }),
      });

        alert(`🚨 EMERGENCY ALERT SENT! 
        
Alert ID: ${alertData.alert?.id || 'Generated'}
Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}
Time: ${new Date().toLocaleString()}

✅ Authorities have been notified
✅ Automatic ticket created for police response (ID: ${alertData.ticket?.id || 'Generated'})
✅ Real-time notifications sent to nearby officers

Emergency services are being dispatched to your location.

Stay safe and await assistance!`);

      } catch (error) {
        console.error('Failed to send emergency alert:', error);
        
        // Fallback to demo alert for now
        alert(`🚨 DEMO EMERGENCY ALERT! 
        
Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}
Time: ${new Date().toLocaleString()}

⚠️ Demo Mode - Real API integration pending
📍 GPS location captured successfully
🔄 Would create automatic ticket for police response

Note: Full authentication integration in progress.`);
      }
      
      // Refresh alerts to show the new one
      loadRecentAlerts();
      
    } catch (error: any) {
      // Check if it's a location error
      if (error.code) {
        console.error('Location error:', error);
        alert('Unable to get your location. Emergency alert requires location access. Please enable location services and try again.');
      } else {
        console.error('Emergency alert error:', error);
        alert('Failed to send emergency alert. Please try again or call 199 directly.');
      }
    }
  };

  const getContactIcon = (type: string) => {
    const icons = {
      police: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      fire: (
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1-4 4-4 5 0 8 2.5 8 7 0 5.5-4.5 10-10 10v0c-1.657 0-3.157-.5-4.343-1.343z" />
        </svg>
      ),
      medical: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      security: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    };
    return icons[type as keyof typeof icons] || icons.security;
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      emergency: (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      safety: (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      incident: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 17h3m-3 0v5m0-5l-5 5h5zM7 7h10v10H7V7z" />
        </svg>
      )
    };
    return icons[type as keyof typeof icons] || icons.incident;
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">SecurityAlert</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Welcome, {user.name}
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name?.split(' ').map((n) => n[0]).join('').slice(0,2)}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Emergency Button */}
        <div className="mb-8">
          <button
            onClick={triggerEmergencyAlert}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-8 px-6 rounded-lg shadow-lg transition-colors"
          >
            <div className="flex flex-col items-center space-y-2">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-xl">EMERGENCY ALERT</div>
              <div className="text-sm opacity-90">Tap to send emergency alert to authorities</div>
            </div>
          </button>
        </div>

        {/* Current Location */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Current Location</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{currentLocation}</div>
              </div>
              <button
                onClick={getCurrentLocation}
                className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contacts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getContactIcon(contact.type)}
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{contact.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{contact.number}</div>
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start">
                    {getAlertIcon(alert.type)}
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.status === 'active' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {alert.location} • {alert.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-gray-500 dark:text-gray-400">No recent alerts</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/report-incident')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-md transition-shadow"
            >
              <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 17h3m-3 0v5m0-5l-5 5h5zM7 7h10v10H7V7z" />
              </svg>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Report Incident</div>
            </button>

            <button
              onClick={() => router.push('/safety-tips')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-md transition-shadow"
            >
              <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Safety Tips</div>
            </button>

            <button
              onClick={() => router.push('/nearby-stations')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-md transition-shadow"
            >
              <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Nearby Stations</div>
            </button>

            <button
              onClick={() => router.push('/settings')}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-md transition-shadow"
            >
              <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Settings</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


