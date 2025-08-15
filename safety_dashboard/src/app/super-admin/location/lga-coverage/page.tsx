"use client";

import React from 'react';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import SecurityMap from '@/components/location/SecurityMap';
import mockAlerts from '@/data/mockAlerts';

export default function Page() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-1 dark:bg-black">
          <div className="p-4 md:p-6 2xl:p-10">
            <h1 className="text-title-md2 font-semibold mb-4">LGA Coverage</h1>
            <div className="rounded-sm border bg-white p-4 shadow-default">
              <SecurityMap alerts={mockAlerts} height="640px" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
