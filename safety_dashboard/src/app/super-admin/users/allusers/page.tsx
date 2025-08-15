"use client";

import React, { useMemo, useState } from 'react';
import mockUsers from '@/data/mockUsers';
import mockTickets from '@/data/mockTickets';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';

const PAGE_SIZE = 10;

export default function AllUsersPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  // users state persisted to localStorage for developer convenience
  const [users, setUsers] = useState<import('@/data/mockUsers').MockUser[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<import('@/data/mockUsers').MockUser | null>(null);

  const [form, setForm] = useState({ username: '', name: '', role: 'citizen', location: '', device: '' } as { username: string; name: string; role: import('@/data/mockUsers').UserRole; location?: string; device?: string });

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('mockUsers');
      if (raw) {
        const parsed = JSON.parse(raw) as import('@/data/mockUsers').MockUser[];
        if (Array.isArray(parsed) && parsed.length) setUsers(parsed);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Persist users whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('mockUsers', JSON.stringify(users));
    } catch (e) {
      // ignore
    }
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u =>
      !q || u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || (u.location || '').toLowerCase().includes(q)
    );
  }, [query, users]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <AppHeader />
      <AppSidebar />
      <main style={{ marginLeft: 'var(--sidebar-width, 290px)', paddingTop: '64px' }} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">All Users</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Create User
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search username, name, location"
            className="border px-3 py-2 rounded w-80"
          />
        </div>

        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="text-left bg-gray-50">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Tickets</th>
                <th className="px-4 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(u)}>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.location}</td>
                  <td className="px-4 py-3">{u.device}</td>
                  <td className="px-4 py-3">
                    {u.ticketIds?.map(tid => {
                      const t = mockTickets.find(x => x.id === tid);
                      return t ? <div key={tid} className="text-sm text-gray-600">{t.title} ({t.status})</div> : null;
                    })}
                  </td>
                  <td className="px-4 py-3">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded">Prev</button>
          <div>Page {page} / {pageCount}</div>
          <button onClick={() => setPage(p => Math.min(pageCount, p+1))} className="px-3 py-1 border rounded">Next</button>
        </div>
        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setIsModalOpen(false)} />
            <div className="relative bg-white rounded shadow-lg w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">Create User</h2>
              <div className="space-y-3">
                <input value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Username" className="w-full border px-3 py-2 rounded" />
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="w-full border px-3 py-2 rounded" />
                <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as any }))} className="w-full border px-3 py-2 rounded">
                  <option value="citizen">citizen</option>
                  <option value="admin">admin</option>
                  <option value="police">police</option>
                </select>
                <input value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="w-full border px-3 py-2 rounded" />
                <input value={form.device} onChange={(e) => setForm(f => ({ ...f, device: e.target.value }))} placeholder="Device" className="w-full border px-3 py-2 rounded" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
                <button
                  onClick={() => {
                    // simple validation
                    if (!form.username || !form.name) return alert('username and name required');
                    const id = `u${Date.now()}`;
                    const created_at = new Date().toISOString();
                    const newUser = { id, username: form.username, name: form.name, role: form.role, location: form.location, device: form.device, ticketIds: [], created_at } as import('@/data/mockUsers').MockUser;
                    setUsers(prev => [newUser, ...prev]);
                    setIsModalOpen(false);
                    setForm({ username: '', name: '', role: 'citizen', location: '', device: '' });
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Details drawer */}
        {selectedUser && (
          <div className="fixed right-0 top-0 h-full z-[10002]">
            <div className="w-[380px] bg-white h-full shadow-xl p-6 pt-20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <div className="text-sm text-gray-500">@{selectedUser.username}</div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-500">Close</button>
              </div>

              <div className="mt-4 space-y-3">
                <div><strong>Role:</strong> {selectedUser.role}</div>
                <div><strong>Location:</strong> {selectedUser.location || '—'}</div>
                <div><strong>Device:</strong> {selectedUser.device || '—'}</div>
                <div>
                  <strong>Tickets:</strong>
                  <div className="mt-2 space-y-1">
                    {selectedUser.ticketIds && selectedUser.ticketIds.length ? selectedUser.ticketIds.map(tid => {
                      const t = mockTickets.find(x => x.id === tid);
                      return t ? <div key={tid} className="text-sm">{t.title} — <span className="text-xs text-gray-500">{t.status}</span></div> : <div key={tid} className="text-sm">{tid}</div>;
                    }) : <div className="text-sm text-gray-500">No tickets</div>}
                  </div>
                </div>
                <div><strong>Joined:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : '—'}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
