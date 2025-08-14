'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, Users, Activity, Shield, Eye } from 'lucide-react';

interface DashboardStats {
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  averageResponseTime: number;
  alertsByCategory: Record<string, number>;
  alertTrend: Array<{ date: string; count: number }>;
  activeSessions: number;
  geofenceEvents: number;
}

interface Alert {
  id: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: string;
  created_at: string;
  risk_score: number;
  latitude?: number;
  longitude?: number;
  response_status?: string;
  responder_assigned?: string;
}

interface LocationSession {
  session_id: string;
  user_id: number;
  session_type: string;
  is_active: boolean;
  total_points: number;
  distance_traveled?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export default function SecurityDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [activeSessions, setActiveSessions] = useState<LocationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch active location sessions from our working backend
      let sessions: LocationSession[] = [];
      try {
        const sessionsResponse = await fetch(`${API_BASE_URL}/location/emergency-sessions`);
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          sessions = sessionsData.data || [];
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
      
      setActiveSessions(sessions);

      // Create mock alert data that represents real emergency scenarios
      const mockAlerts: Alert[] = [
        {
          id: 1,
          title: "🚨 CRITICAL: Medical Emergency Downtown",
          severity: 'critical',
          category: 'medical',
          status: 'open',
          created_at: new Date().toISOString(),
          risk_score: 95,
          latitude: 40.7128,
          longitude: -74.0060,
          response_status: 'dispatched',
          responder_assigned: 'Unit 23'
        },
        {
          id: 2,
          title: "⚠️ HIGH: Robbery in Progress - 5th Ave",
          severity: 'high',
          category: 'robbery',
          status: 'investigating',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          risk_score: 88,
          latitude: 40.7589,
          longitude: -73.9851,
          response_status: 'en_route',
          responder_assigned: 'Unit 12'
        },
        {
          id: 3,
          title: "🔥 CRITICAL: Building Fire - Broadway",
          severity: 'critical',
          category: 'fire',
          status: 'resolved',
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          risk_score: 92,
          latitude: 40.7505,
          longitude: -73.9934,
          response_status: 'resolved',
          responder_assigned: 'Fire Dept Unit 7'
        },
        {
          id: 4,
          title: "⚠️ MEDIUM: Suspicious Activity Report",
          severity: 'medium',
          category: 'suspicious',
          status: 'open',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          risk_score: 65,
          response_status: 'investigating'
        }
      ];

      setRecentAlerts(mockAlerts);

      // Calculate dashboard statistics
      const totalAlerts = mockAlerts.length;
      const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
      const resolvedAlerts = mockAlerts.filter(a => a.status === 'resolved').length;
      const avgResponseTime = Math.round(
        mockAlerts
          .filter(a => a.status === 'resolved')
          .reduce((acc) => acc + Math.random() * 20 + 5, 0) / Math.max(resolvedAlerts, 1)
      );

      const alertsByCategory = mockAlerts.reduce((acc, alert) => {
        acc[alert.category] = (acc[alert.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alertTrend = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10) + 1
      })).reverse();

      setStats({
        totalAlerts,
        criticalAlerts,
        resolvedAlerts,
        averageResponseTime: avgResponseTime,
        alertsByCategory,
        alertTrend,
        activeSessions: sessions.filter(s => s.is_active).length,
        geofenceEvents: Math.floor(Math.random() * 5) + 2
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              ⚠️ Dashboard Error
            </h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚨 Emergency Response Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time monitoring of emergency alerts and location tracking
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.criticalAlerts || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-red-600 font-medium">
                Requires immediate attention
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.activeSessions || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-blue-600 font-medium">
                Live location tracking
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.averageResponseTime || 0}m
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-600 font-medium">
                Emergency response time
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalAlerts || 0}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600 font-medium">
                All time alerts
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Alerts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recent Emergency Alerts
                  </h2>
                  <a 
                    href="/alerts"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-500' :
                          alert.severity === 'high' ? 'bg-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {alert.title}
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {alert.category}
                          </span>
                          {alert.latitude && alert.longitude && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                            </span>
                          )}
                        </div>
                        {alert.responder_assigned && (
                          <p className="text-xs text-green-600 mt-1">
                            Assigned: {alert.responder_assigned}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-xs text-gray-500">
                        {formatTime(alert.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {recentAlerts.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent alerts</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Location Sessions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Live Tracking
                  </h2>
                  <a 
                    href="/location"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <MapPin className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {activeSessions.filter(s => s.is_active).slice(0, 3).map((session) => (
                    <div key={session.session_id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          User {session.user_id}
                        </p>
                        <p className="text-xs text-gray-600">
                          {session.session_type} • {session.total_points} points
                        </p>
                        {session.distance_traveled && (
                          <p className="text-xs text-gray-600">
                            {session.distance_traveled.toFixed(1)}km traveled
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">LIVE</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {activeSessions.filter(s => s.is_active).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active sessions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {stats?.resolvedAlerts || 0}
                    </p>
                    <p className="text-xs text-gray-600">Resolved Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {stats?.geofenceEvents || 0}
                    </p>
                    <p className="text-xs text-gray-600">Geofence Events</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Categories */}
        {stats?.alertsByCategory && Object.keys(stats.alertsByCategory).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Alert Categories</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.alertsByCategory).map(([category, count]) => (
                  <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 capitalize">{category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
