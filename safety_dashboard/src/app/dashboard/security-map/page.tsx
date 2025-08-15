"use client";

import React from 'react';
import SecurityMap from '@/components/location/SecurityMap';
import type { Alert } from '@/types';
import { useAuthStore } from '@/store';
import Link from 'next/link';

export default function SecurityMapPage() {
  const user = useAuthStore((s) => s.user);
  const dummyAlerts: Alert[] = [];

  if (!user) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Security Map</h2>
        <p className="text-sm text-gray-600">
          You must <Link href="/login" className="text-blue-600">sign in</Link> to view the security map.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Security Map</h2>

      <div className="mb-4">
        {user.role === 'super_admin' ? (
          <div className="text-sm text-green-700">Super Admin view — full controls enabled.</div>
        ) : user.role === 'admin' ? (
          <div className="text-sm text-yellow-700">Admin view — limited controls.</div>
        ) : user.role === 'police' ? (
          <div className="text-sm text-blue-700">Police view — limited controls.</div>
        ) : (
          <div className="text-sm text-gray-600">Limited view</div>
        )}
      </div>

      <div className="h-[600px]">
        <SecurityMap alerts={dummyAlerts} />
      </div>
    </div>
  );
}
