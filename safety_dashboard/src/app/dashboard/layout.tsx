'use client';

import React from 'react';
import Sidebar, { Header } from '@/components/layout/DashboardLayout';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Default title/subtitle
  let title = 'Security Dashboard';
  let subtitle = 'Real-time monitoring and incident management';

  if (pathname?.startsWith('/dashboard/users')) {
    title = 'User Management';
    subtitle = '';
  } else if (pathname?.startsWith('/dashboard/security-map') || pathname?.startsWith('/dashboard/location')) {
    title = 'Location Tracking';
    subtitle = '';
  } else if (pathname?.startsWith('/dashboard/tickets') || pathname?.startsWith('/tickets')) {
    title = 'Tickets';
    subtitle = '';
  } else if (pathname?.startsWith('/dashboard/alerts') || pathname?.startsWith('/alerts')) {
    title = 'Alerts';
    subtitle = '';
  }

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
