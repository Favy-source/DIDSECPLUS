"use client";

import React, { useState, useEffect } from 'react';
// ...existing code...
import { useRouter } from 'next/navigation';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import { useSidebar } from '@/context/SidebarContext';
import apiClient from '@/services/api';

interface DashboardStats {
  totalUsers: number;
  totalAlerts: number;
  activeTickets: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'alert' | 'system';
  title: string;
  time: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const SuperAdminDashboard: React.FC = () => {
  // Backend authentication: check for JWT in localStorage or cookies
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const sidebar = useSidebar();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1245,
    totalAlerts: 89,
    activeTickets: 23,
    systemHealth: 'excellent'
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'user_created',
      title: 'New admin account created for Lagos Central',
      time: '2 minutes ago',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'alert',
      title: 'High priority security alert in Abuja',
      time: '5 minutes ago',
      priority: 'high'
    },
    {
      id: '3',
      type: 'system',
      title: 'Database backup completed successfully',
      time: '1 hour ago',
      priority: 'low'
    }
  ]);

  useEffect(() => {
    // Get token from localStorage (should match what auth store uses)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (!token) {
      setIsLoading(false);
      router.push('/super-admin/login');
      return;
    }
  
    // Fetch user info from backend
    const fetchUser = async () => {
      try {
        const response = await apiClient.getCurrentUser();
        if (response && response.user && response.user.role === 'super_admin') {
          setUser(response.user);
        } else {
          router.push('/super-admin/login');
        }
      } catch (err) {
        router.push('/super-admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const createAdmin = () => {
    router.push('/super-admin/create-admin');
  };

  const createPolice = () => {
    router.push('/super-admin/create-police');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-boxdark">
      {/* Sidebar */}
      <AppSidebar />
      
      <div className={"flex-1 flex flex-col transition-all duration-300 lg:ml-64"}>
        {/* Header */}
        <AppHeader />
        
          {/* Dashboard Content - TailAdmin Style */}
          <main className="p-4 md:p-6 2xl:p-10">
            {/* Welcome Header */}
            <div className="mb-6">
              <h1 className="text-title-md2 font-semibold text-black dark:text-white">
                Super Admin Dashboard
              </h1>
              <p className="text-regular text-body dark:text-bodydark">
                Welcome, {user.name || user.firstName || ''} {user.lastName || ''} - Complete system control and management
              </p>
            </div>

            {/* Key Statistics Cards - TailAdmin Style */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
              {/* Total Users Card */}
              <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <svg className="fill-primary dark:fill-white" width="22" height="16" viewBox="0 0 22 16" fill="none">
                    <path d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z" fill=""/>
                    <path d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z" fill=""/>
                  </svg>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                      {stats?.totalUsers.toLocaleString()}
                    </h4>
                    <span className="text-sm font-medium">Total Users</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
                    0.43%
                    <svg className="fill-meta-3" width="10" height="11" viewBox="0 0 10 11" fill="none">
                      <path d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z" fill=""/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Total Alerts Card */}
              <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <span className="text-xl">🚨</span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                      {stats?.totalAlerts.toLocaleString()}
                    </h4>
                    <span className="text-sm font-medium">Total Alerts</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
                    2.59%
                    <svg className="fill-meta-3" width="10" height="11" viewBox="0 0 10 11" fill="none">
                      <path d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z" fill=""/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Active Tickets Card */}
              <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <span className="text-xl">🎫</span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                      {stats?.activeTickets}
                    </h4>
                    <span className="text-sm font-medium">Active Tickets</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-meta-5">
                    0.95%
                    <svg className="fill-meta-5" width="10" height="11" viewBox="0 0 10 11" fill="none">
                      <path d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z" fill=""/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* System Health Card */}
              <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <span className="text-xl">⚡</span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white capitalize">
                      {stats?.systemHealth}
                    </h4>
                    <span className="text-sm font-medium">System Health</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-meta-3">
                    99.9%
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 2xl:gap-7.5 xl:grid-cols-3">
              {/* User Management Section */}
              <div className="col-span-12 xl:col-span-2">
                <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                  <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                    User Management
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button 
                      onClick={createAdmin}
                      className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 mr-4">
                          <span className="text-xl">👨‍💼</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-black dark:text-white">Create Admin Account</h3>
                          <p className="text-sm text-bodydark2">Add new station administrator</p>
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={createPolice}
                      className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4 mr-4">
                          <span className="text-xl">👮‍♂️</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-black dark:text-white">Create Police Account</h3>
                          <p className="text-sm text-bodydark2">Add new police officer</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h5 className="text-lg font-semibold text-black dark:text-white mb-4">Recent Activity</h5>
                    <div className="space-y-3">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-2 dark:bg-meta-4">
                          <div className="flex-shrink-0">
                            {activity.type === 'user_created' && <span className="text-lg">👤</span>}
                            {activity.type === 'alert' && <span className="text-lg">🚨</span>}
                            {activity.type === 'system' && <span className="text-lg">⚙️</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-black dark:text-white">{activity.title}</p>
                            <p className="text-xs text-bodydark2">{activity.time}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            activity.priority === 'high' ? 'bg-danger text-white' :
                            activity.priority === 'medium' ? 'bg-warning text-white' :
                            'bg-success text-white'
                          }`}>
                            {activity.priority.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status & Quick Actions */}
              <div className="col-span-12 xl:col-span-1">
                <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <h4 className="text-xl font-semibold text-black dark:text-white mb-6">
                    System Status
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-bodydark2">Database</span>
                      <span className="text-sm font-medium text-meta-3">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-bodydark2">API Services</span>
                      <span className="text-sm font-medium text-meta-3">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-bodydark2">Mobile App</span>
                      <span className="text-sm font-medium text-meta-3">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-bodydark2">Uptime</span>
                      <span className="text-sm font-medium text-meta-3">99.9%</span>
                    </div>
                  </div>

                  <h5 className="text-lg font-semibold text-black dark:text-white mt-6 mb-4">
                    Quick Actions
                  </h5>
                  <div className="space-y-3">
                    <button 
                      onClick={() => router.push('/super-admin/security-map')}
                      className="w-full text-left p-3 bg-gray-2 dark:bg-meta-4 hover:bg-gray-3 dark:hover:bg-meta-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-3">🗺️</span>
                        <span className="text-sm font-medium text-black dark:text-white">Nigerian Security Map</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => router.push('/super-admin/reports')}
                      className="w-full text-left p-3 bg-gray-2 dark:bg-meta-4 hover:bg-gray-3 dark:hover:bg-meta-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-3">📊</span>
                        <span className="text-sm font-medium text-black dark:text-white">System Reports</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => router.push('/super-admin/settings')}
                      className="w-full text-left p-3 bg-gray-2 dark:bg-meta-4 hover:bg-gray-3 dark:hover:bg-meta-4 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-3">⚙️</span>
                        <span className="text-sm font-medium text-black dark:text-white">System Settings</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
