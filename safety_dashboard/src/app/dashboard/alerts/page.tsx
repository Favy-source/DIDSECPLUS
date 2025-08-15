"use client";

import React, { useEffect } from 'react';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import { useRouter } from 'next/navigation';

export default function DashboardAlertsPage() {
  const router = useRouter();

  useEffect(() => {
    // redirect to canonical alerts page
    router.replace('/alerts');
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-1 dark:bg-black">
          <div className="p-4 md:p-6 2xl:p-10">
            <h1 className="text-title-md2 font-semibold text-black dark:text-white">Redirecting to Alerts...</h1>
          </div>
        </main>
      </div>
    </div>
  );
}
