"use client";

import React from 'react';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-1 dark:bg-black">
          <div className="p-4 md:p-6 2xl:p-10">
            <h1 className="text-title-md2 font-semibold text-black dark:text-white">Dashboard</h1>
            <p className="mt-4 text-sm text-body">Welcome — use the sidebar to navigate to Alerts, Tickets, Security Map, and other sections.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
