"use client";
import React, { useMemo, useState } from 'react';
import mockUsers from '@/data/mockUsers';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';

export default function UserRolesPage() {
  const [roleFilter, setRoleFilter] = useState<'all' | 'citizen' | 'admin' | 'police'>('all');
  const roles = ['all','citizen','admin','police'] as const;

  const filtered = useMemo(() => mockUsers.filter(u => roleFilter === 'all' ? true : u.role === roleFilter), [roleFilter]);

  return (
    <>
      <AppHeader />
      <AppSidebar />
      <main style={{ marginLeft: 'var(--sidebar-width, 290px)', paddingTop: '64px' }} className="p-6">
        <h1 className="text-2xl font-semibold mb-4">User Roles</h1>
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm">Filter by role:</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="border px-3 py-2 rounded">
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="text-left bg-gray-50">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
