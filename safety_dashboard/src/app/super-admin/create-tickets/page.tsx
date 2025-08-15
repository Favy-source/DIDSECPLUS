"use client";

import React, { useState } from 'react';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import CreateTicketModal from '@/components/tickets/CreateTicketModal';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-1 dark:bg-black">
          <div className="p-4 md:p-6 2xl:p-10">
            {/* Minimal background — no map or full tickets list for this create route */}
            <div className="rounded-sm border bg-white p-6 shadow-default flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Create Ticket</h2>
                <p className="text-sm text-gray-600">The ticket creation modal is open by default on this route.</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setOpen(true)} className="px-4 py-2 bg-primary text-white rounded">Create Ticket</button>
                <button onClick={() => router.push('/super-admin/tickets')} className="px-4 py-2 border rounded">View All Tickets</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateTicketModal
        open={open}
        alert={null}
        onClose={() => {
          setOpen(false);
          router.push('/super-admin/tickets');
        }}
        onCreated={(created) => {
          setOpen(false);
          router.push('/super-admin/tickets');
        }}
      />
    </div>
  );
}
