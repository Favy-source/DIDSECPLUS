"use client";

import React from 'react';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import AlertsContent from '@/components/alerts/AlertsContent';
import mockAlerts from '@/data/mockAlerts';
import { Alert } from '@/types';

export default function SuperAdminAlertHistory() {
  // show full history (all alerts) for super-admin
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-1 dark:bg-black">
          <div className="p-4 md:p-6 2xl:p-10">
            <AlertsContent initialAlerts={mockAlerts} defaultStatus="all" />
          </div>
        </main>
      </div>
    </div>
  );
}
