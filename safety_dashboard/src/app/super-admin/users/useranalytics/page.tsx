"use client";
import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import mockUsers from '@/data/mockUsers';
import mockTickets from '@/data/mockTickets';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as any;

type DateRangeOption = 7 | 30 | 90;

function daysAgoIso(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function formatDateLabel(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function UserAnalyticsPage(){
  const [roleFilter, setRoleFilter] = useState<'all' | 'citizen' | 'admin' | 'police'>('all');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<DateRangeOption>(30);

  // Persist filters
  useEffect(() => {
    try {
      const raw = localStorage.getItem('userAnalyticsFilters');
      if (raw) {
        const p = JSON.parse(raw);
        if (p.role) setRoleFilter(p.role);
        if (p.range) setRange(p.range);
        if (p.query) setQuery(p.query);
      }
    } catch (e) {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('userAnalyticsFilters', JSON.stringify({ role: roleFilter, range, query })); } catch (e) {}
  }, [roleFilter, range, query]);

  // Base user list (mock)
  const users = mockUsers;

  // Derived fields
  const totalUsers = users.length;
  const ticketsCount = users.reduce((acc, u) => acc + (u.ticketIds?.length || 0), 0);
  const avgTicketsPerUser = totalUsers ? (ticketsCount / totalUsers) : 0;

  const usersByRole = useMemo(() => {
    return users.reduce((acc: Record<string, number>, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {} as Record<string, number>);
  }, [users]);

  // Treat created_at as last_active for mock data
  const isWithin = (iso?: string, daysWindow = 7) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return t >= Date.now() - daysWindow * 86400000;
  };

  const activeUsers7 = users.filter(u => isWithin(u.created_at, 7)).length;
  const activeUsers14 = users.filter(u => isWithin(u.created_at, 14)).length;
  const activeUsers30 = users.filter(u => isWithin(u.created_at, 30)).length;

  const newSignups7 = users.filter(u => isWithin(u.created_at, 7)).length;

  // Time series: new signups over last 30 days
  const signupSeries = useMemo(() => {
    const daysN = 30;
    const arr: number[] = [];
    const labels: string[] = [];
    for (let i = daysN - 1; i >= 0; i--) {
      const day = new Date();
      day.setHours(0,0,0,0);
      day.setDate(day.getDate() - i);
      const start = day.getTime();
      const end = start + 86400000;
      const count = users.filter(u => {
        const t = u.created_at ? new Date(u.created_at).getTime() : 0;
        return t >= start && t < end;
      }).length;
      arr.push(count);
      labels.push(formatDateLabel(day));
    }
    return { arr, labels };
  }, [users]);

  // Active users trend: daily active (using created_at as proxy)
  const activeSeries = useMemo(() => {
    const daysN = range;
    const arr: number[] = [];
    const labels: string[] = [];
    for (let i = daysN - 1; i >= 0; i--) {
      const day = new Date(); day.setHours(0,0,0,0); day.setDate(day.getDate() - i);
      const start = day.getTime(); const end = start + 86400000;
      const count = users.filter(u => {
        const t = u.created_at ? new Date(u.created_at).getTime() : 0;
        return t >= start && t < end;
      }).length;
      arr.push(count);
      labels.push(formatDateLabel(day));
    }
    return { arr, labels };
  }, [users, range]);

  // Donut: users by role
  const donutSeries = useMemo(() => [usersByRole.citizen || 0, usersByRole.admin || 0, usersByRole.police || 0], [usersByRole]);
  const donutLabels = ['citizen','admin','police'];

  // Top locations
  const topLocations = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => {
      const loc = u.location ? u.location.split(',')[0].trim() : 'Unknown';
      map[loc] = (map[loc] || 0) + 1;
    });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,6);
  }, [users]);

  // Devices histogram
  const devices = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => { const d = u.device || 'Unknown'; map[d] = (map[d]||0)+1; });
    return Object.entries(map);
  }, [users]);

  // Recent signups and top users by tickets
  const recentSignups = useMemo(() => users.slice().sort((a,b) => (new Date(b.created_at||0).getTime()) - (new Date(a.created_at||0).getTime())).slice(0,6), [users]);
  const topUsersByTickets = useMemo(() => users.slice().sort((a,b) => (b.ticketIds?.length||0) - (a.ticketIds?.length||0)).slice(0,6), [users]);

  // Filters for lists
  const filteredUsersForExport = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => (roleFilter === 'all' || u.role === roleFilter) && (!q || u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || (u.location||'').toLowerCase().includes(q)));
  }, [users, roleFilter, query]);

  const exportCsv = () => {
    const rows = [ ['id','username','name','role','location','device','tickets','created_at'] ];
    filteredUsersForExport.forEach(u => {
      rows.push([u.id,u.username,u.name,u.role,u.location||'',u.device||'',String((u.ticketIds||[]).length),u.created_at||'']);
    });
    const csv = rows.map(r => r.map(c => '"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click(); URL.revokeObjectURL(url);
  };

  // Chart opts
  const signupOpts = { chart: { id: 'signups', toolbar: { show: false } }, xaxis: { categories: signupSeries.labels }, stroke: { curve: 'smooth' } };
  const activeOpts = { chart: { id: 'active', toolbar: { show: false } }, xaxis: { categories: activeSeries.labels }, stroke: { curve: 'smooth' } };
  const donutOpts = { labels: donutLabels, legend: { position: 'bottom' } };
  const barOpts = { chart: { toolbar: { show: false } }, xaxis: { categories: topLocations.map(x=>x[0]) } };
  const deviceOpts = { chart: { toolbar: { show: false } }, xaxis: { categories: devices.map(d=>d[0]) } };

  return (
    <>
      <AppHeader />
      <AppSidebar />
      <main style={{ marginLeft: 'var(--sidebar-width, 290px)', paddingTop: '64px' }} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">User Analytics</h1>
          <div className="flex items-center gap-3">
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search" className="border px-3 py-2 rounded" />
            <select value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value as any)} className="border px-3 py-2 rounded">
              <option value="all">All roles</option>
              <option value="citizen">citizen</option>
              <option value="admin">admin</option>
              <option value="police">police</option>
            </select>
            <select value={range} onChange={(e)=>setRange(Number(e.target.value) as DateRangeOption)} className="border px-3 py-2 rounded">
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
            <button onClick={exportCsv} className="px-3 py-2 bg-gray-100 rounded">Export CSV</button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-500">Total users</div><div className="text-2xl font-bold">{totalUsers}</div></div>
          <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-500">Active (7d)</div><div className="text-2xl font-bold">{activeUsers7}</div></div>
          <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-500">Active (30d)</div><div className="text-2xl font-bold">{activeUsers30}</div></div>
          <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-500">New signups (7d)</div><div className="text-2xl font-bold">{newSignups7}</div></div>
          <div className="p-4 bg-white rounded shadow"><div className="text-sm text-gray-500">Avg tickets / user</div><div className="text-2xl font-bold">{avgTicketsPerUser.toFixed(2)}</div></div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-500 mb-2">New signups (last 30 days)</div>
            <Chart options={signupOpts} series={[{ name: 'Signups', data: signupSeries.arr }]} type="area" height={220} />
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-500 mb-2">Users by role</div>
            <Chart options={donutOpts} series={donutSeries} type="donut" height={220} />
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-500 mb-2">Active users trend ({range} days)</div>
            <Chart options={activeOpts} series={[{ name: 'Active', data: activeSeries.arr }]} type="line" height={220} />
          </div>

          <div className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-500 mb-2">Top locations</div>
            <Chart options={barOpts} series={[{ name: 'Users', data: topLocations.map(x=>x[1]) }]} type="bar" height={220} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-3">Recent signups</h3>
            <ul className="space-y-2">
              {recentSignups.map(u => (
                <li key={u.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{u.name} <span className="text-xs text-gray-500">@{u.username}</span></div>
                    <div className="text-xs text-gray-500">{u.role} • {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="text-sm text-gray-500">{(u.ticketIds||[]).length} tickets</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded shadow p-4">
            <h3 className="font-semibold mb-3">Top users by tickets</h3>
            <ul className="space-y-2">
              {topUsersByTickets.map(u => (
                <li key={u.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{u.username}</div>
                    <div className="text-xs text-gray-500">{u.name}</div>
                  </div>
                  <div className="text-sm text-gray-500">{(u.ticketIds||[]).length} • {u.ticketIds && u.ticketIds.length ? (mockTickets.find(t=>t.id===u.ticketIds![0])?.status || '') : '—'}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </main>
    </>
  );
}
