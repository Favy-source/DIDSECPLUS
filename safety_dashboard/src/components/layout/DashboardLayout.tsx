import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
// ...existing code...

interface NavItem {
  name: string;
  href: string;
  icon: string;
  current?: boolean;
  roles: ('user' | 'police' | 'admin' | 'super_admin')[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['user', 'police', 'admin', 'super_admin'] },
  { name: 'Security Map', href: '/dashboard/security-map', icon: '🗺️', roles: ['police', 'admin', 'super_admin'] },
  { name: 'Alerts', href: '/dashboard/alerts', icon: '🚨', roles: ['user', 'police', 'admin', 'super_admin'] },
  { name: 'Tickets', href: '/dashboard/tickets', icon: '🎫', roles: ['police', 'admin', 'super_admin'] },
  { name: 'Location', href: '/dashboard/location', icon: '📍', roles: ['user', 'police', 'admin', 'super_admin'] },
  { name: 'Users', href: '/dashboard/users', icon: '👥', roles: ['admin', 'super_admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', roles: ['user', 'police', 'admin', 'super_admin'] },
];


export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => 
    user ? item.roles.includes(user.role as any) : false
  );

  return (
    <div className="flex h-screen bg-white border-r border-gray-200">
      <div className="flex flex-col w-64">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 bg-green-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🇳🇬</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-white">Nigeria SARS</h1>
              <p className="text-xs text-green-100">Security Alert & Response</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-green-50 border-r-2 border-green-600 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-900">System Status</p>
              <p className="text-xs text-green-600">All Systems Operational</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="px-4 py-3 bg-red-50 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs font-medium text-red-800">Emergency Hotline</p>
            <p className="text-sm font-bold text-red-900">199 | 911</p>
            <p className="text-xs text-red-600">24/7 Response Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Header component for the main content area

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Administrator';
      case 'admin': return 'Administrator';
      case 'police': return 'Police Officer';
      case 'user': return 'Citizen';
      default: return 'User';
    }
  } 

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  } 

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
            {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name?.split(' ').map((n) => n[0]).join('').slice(0,2)}
            </span>
                </div>
              </div>
            )}
            
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">View notifications</span>
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Logout"
            >
              <span className="text-xl">🚪</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main layout wrapper
export function DashboardLayout({ 
  children, 
  title, 
  subtitle 
}: { 
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
