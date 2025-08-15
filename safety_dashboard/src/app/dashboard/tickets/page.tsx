"use client";

import React from 'react';
import TicketsPage from '@/app/tickets/page';

export default function DashboardTicketsPage() {
  // Reuse the existing top-level Tickets page under the dashboard route to
  // avoid duplicate logic and fix 404 when navigating to /dashboard/tickets
  return <TicketsPage />;
}
