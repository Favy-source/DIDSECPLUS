'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Navigation, AlertTriangle } from 'lucide-react';

interface LocationUpdate {
  id: string;
  user_id: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  device_info?: string;
  battery_level?: number;
  network_type?: string;
}

interface LocationSession {
  id: string;
  user_id: number;
  session_type: 'normal' | 'emergency' | 'panic';
  start_time: string;
  end_time?: string;
  is_active: boolean;
  total_updates: number;
}

export default function LocationClient() {
  const [locations, setLocations] = useState<LocationUpdate[]>([]);
  const [sessions, setSessions] = useState<LocationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'sessions'>('live');

  useEffect(() => {
    fetchLocationData();
    const interval = setInterval(fetchLocationData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLocationData = async () => {
    try {
      const [locationsRes, sessionsRes] = await Promise.all([
        fetch('http://localhost:3000/api/location/recent?limit=50'),
        fetch('http://localhost:3000/api/location/sessions/active')
      ]);

      if (locationsRes.ok) {
        const locData = await locationsRes.json();
        setLocations(locData.data || []);
      }

      if (sessionsRes.ok) {
        const sessData = await sessionsRes.json();
        setSessions(sessData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch location data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'panic': return 'bg-red-100 text-red-800 border-red-200';
      case 'emergency': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'panic': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'emergency': return <Navigation className="h-4 w-4 text-orange-500" />;
      case 'normal': return <MapPin className="h-4 w-4 text-green-500" />;
      default: return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  };

  const emergencySessions = sessions.filter(s => s.session_type === 'emergency' || s.session_type === 'panic');
  const activeSessions = sessions.filter(s => s.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Live Location Tracking
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Live Locations
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Active Sessions
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeSessions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Emergency Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{emergencySessions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Location Updates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{locations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'live' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Location Updates</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading locations...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="p-6 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No recent location updates</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {locations.map((location) => (
                <div key={location.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <MapPin className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          User ID: {location.user_id}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Accuracy: ±{location.accuracy}m | {new Date(location.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {location.battery_level && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Battery: {location.battery_level}%
                        </p>
                      )}
                      {location.network_type && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Network: {location.network_type}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Location Sessions</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No active sessions</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <div key={session.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getSessionIcon(session.session_type)}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            User ID: {session.user_id}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSessionTypeColor(session.session_type)}`}>
                            {session.session_type}
                          </span>
                          {session.is_active && (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Started: {new Date(session.start_time).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Updates: {session.total_updates}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        View Track
                      </button>
                      {session.session_type !== 'normal' && (
                        <button className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm">
                          Emergency Response
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
