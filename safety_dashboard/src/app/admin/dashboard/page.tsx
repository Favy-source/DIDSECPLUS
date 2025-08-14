"use client";
import { useAuthStore } from '@/store';

import React, { useState, useEffect } from 'react';
// ...existing code...
import { useRouter } from 'next/navigation';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import { useSidebar } from '@/context/SidebarContext';

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  stationOfficers: number;
  avgResponseTime: number;
}

interface TicketSummary {
  id: string;
  title: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'responding' | 'resolved';
  createdAt: string;
  assignedTo?: string;
}

const AdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = false; // Set to false or use loading state from store if available
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      // Mock data for now - replace with actual API calls
      const mockStats: DashboardStats = {
        totalTickets: 145,
        openTickets: 23,
        stationOfficers: 28,
        avgResponseTime: 8.5
      };

      const mockTickets: TicketSummary[] = [
        {
          id: '1',
          title: 'Armed robbery reported in Victoria Island',
          location: 'Victoria Island, Lagos',
          priority: 'critical',
          status: 'assigned',
          createdAt: '5 minutes ago',
          assignedTo: 'Officer John Doe'
        },
        {
          id: '2',
          title: 'Suspicious activity near shopping mall',
          location: 'Ikeja, Lagos',
          priority: 'medium',
          status: 'new',
          createdAt: '12 minutes ago'
        },
        {
          id: '3',
          title: 'Missing person case',
          location: 'Surulere, Lagos',
          priority: 'high',
          status: 'responding',
          createdAt: '25 minutes ago',
          assignedTo: 'Officer Jane Smith'
        }
      ];

      setStats(mockStats);
      setRecentTickets(mockTickets);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      responding: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AppSidebar />
      
      <div className={`transition-all duration-300 ${isExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <AppHeader />
        
        <main className="p-4 lg:p-6">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome, {user.name} - Station Administrator
            </p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Station: LG001 | Department: Lagos State
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.openTickets}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Station Officers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.stationOfficers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.avgResponseTime}m</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Tickets</h2>
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                    Live Updates
                  </span>
                </div>
                
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{ticket.title}</h3>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{ticket.location}</span>
                            <span className="mx-2">•</span>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{ticket.createdAt}</span>
                          </div>
                          {ticket.assignedTo && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              Assigned to: {ticket.assignedTo}
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                          View Details
                        </button>
                        <button className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-xs font-medium transition-colors">
                          Assign Officer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => router.push('/tickets')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    View All Tickets
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Station Management</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/users')}
                    className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Officer Management</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/security-map')}
                    className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors border border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">Security Map</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Station Reports</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/tickets/create')}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Create Ticket</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Daily Report</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => router.push('/alerts')}
                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 17h3m-3 0v5m0-5l-5 5h5zM7 7h10v10H7V7z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Alert Center</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Station Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Station ID:</span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">LG001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Department:</span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Lagos State</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Rank:</span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Inspector</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Coverage Area:</span>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Lagos Island</span>
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

export default AdminDashboard;
