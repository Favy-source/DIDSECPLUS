"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from '@/types';
import stateCentroids from '@/data/nigeriaStateCentroids';
import SecurityMap from '@/components/location/SecurityMap';
import { useSecurityAlerts } from '@/hooks/useWebSocket';

type Props = {
  initialAlerts?: Alert[];
  defaultStatus?: string; // 'all' | 'active' | 'investigating' | 'resolved'
};

// Render ISO on first paint (server & initial client) then replace with localized format after mount
const DateTime: React.FC<{ iso: string }> = ({ iso }) => {
  const [display, setDisplay] = useState<string>(iso || '');
  useEffect(() => {
    let mounted = true;
    try {
      const formatted = new Date(iso).toLocaleString();
      if (mounted) setDisplay(formatted);
    } catch (e) {
      // keep ISO if formatting fails
    }
    return () => { mounted = false; };
  }, [iso]);
  return <>{display}</>;
};

export default function AlertsContent({ initialAlerts, defaultStatus = 'all' }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts || []);
  const [filtered, setFiltered] = useState<Alert[]>(initialAlerts || []);
  const [loading, setLoading] = useState<boolean>(!initialAlerts);
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatus);
  const [search, setSearch] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { alerts: wsAlerts } = useSecurityAlerts();

  useEffect(() => {
    if (initialAlerts && initialAlerts.length) {
      setAlerts(initialAlerts);
      setFiltered(initialAlerts);
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        // Try public API first
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/alerts`);
          if (res.ok) {
            const data = await res.json();
            const raw = Array.isArray(data) ? data : data.data || [];
            const normalized: Alert[] = raw.map((a: any) => ({
              id: String(a.id),
              title: a.title || a.name || `Alert ${a.id}`,
              description: a.description || a.desc || '',
              severity: (a.severity as any) || 'low',
              category: (a.category as any) || 'other',
              latitude: a.latitude ?? stateCentroids[a.location]?.[0] ?? 0,
              longitude: a.longitude ?? stateCentroids[a.location]?.[1] ?? 0,
              location: a.location || a.place || '',
              status: (a.status as any) || 'active',
              created_at: a.created_at || new Date().toISOString(),
              updated_at: a.updated_at || a.created_at || new Date().toISOString(),
              created_by: a.created_by || null,
            }));
            if (!mounted) return;
            setAlerts(normalized);
            setFiltered(normalized);
            return;
          }
        } catch (e) {
          // ignore
        }

        try {
          const res2 = await fetch('/api/alerts');
          if (res2.ok) {
            const data = await res2.json();
            const raw = Array.isArray(data) ? data : data.data || [];
            const normalized: Alert[] = raw.map((a: any) => ({
              id: String(a.id),
              title: a.title || a.name || `Alert ${a.id}`,
              description: a.description || a.desc || '',
              severity: (a.severity as any) || 'low',
              category: (a.category as any) || 'other',
              latitude: a.latitude ?? stateCentroids[a.location]?.[0] ?? 0,
              longitude: a.longitude ?? stateCentroids[a.location]?.[1] ?? 0,
              location: a.location || a.place || '',
              status: (a.status as any) || 'active',
              created_at: a.created_at || new Date().toISOString(),
              updated_at: a.updated_at || a.created_at || new Date().toISOString(),
              created_by: a.created_by || null,
            }));
            if (!mounted) return;
            setAlerts(normalized);
            setFiltered(normalized);
            return;
          }
        } catch (e) {
          // ignore
        }

        // fallback to empty
        if (mounted) setAlerts([]);
      } catch (err) {
        console.error('Failed to load alerts', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [initialAlerts]);

  useEffect(() => {
    let list = alerts.slice();
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => (a.title || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) || (a.location || '').toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [alerts, statusFilter, search]);

  const stats = useMemo(() => ({
    total: alerts.length,
    open: alerts.filter((a) => a.status === 'active').length,
    investigating: alerts.filter((a) => a.status === 'investigating').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
  }), [alerts]);

  // merge incoming ws alerts preferring newer items
  useEffect(() => {
    if (wsAlerts && wsAlerts.length) {
      setAlerts(prev => {
        const ids = new Set(prev.map(p => p.id));
        const newOnes = wsAlerts.filter(a => !ids.has(a.id)).map((a:any) => ({
          id: String(a.id),
          title: a.title || a.name || `Alert ${a.id}`,
          description: a.description || a.desc || '',
          severity: (a.severity as any) || 'low',
          category: (a.category as any) || 'other',
          latitude: a.latitude ?? stateCentroids[a.location]?.[0] ?? 0,
          longitude: a.longitude ?? stateCentroids[a.location]?.[1] ?? 0,
          location: a.location || a.place || '',
          status: (a.status as any) || 'active',
          created_at: a.created_at || new Date().toISOString(),
          updated_at: a.updated_at || a.created_at || new Date().toISOString(),
          created_by: a.created_by || null,
        }));
        if (newOnes.length === 0) return prev;
        return [...newOnes, ...prev];
      });
    }
  }, [wsAlerts]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-title-md2 font-semibold text-black dark:text-white">Alerts</h1>
        <div className="flex gap-2">
          <button onClick={() => { setStatusFilter('all'); setSearch(''); setSelectedAlert(null); }} className="border px-4 py-2 rounded">Reset</button>
          <button onClick={async () => { setLoading(true); try { const res = await fetch('/api/alerts'); if (res.ok) { const d = await res.json(); setAlerts((Array.isArray(d) ? d : d.data || []).map((a:any)=>({ id:String(a.id), title:a.title||a.name||`Alert ${a.id}`, description:a.description||a.desc||'', severity:a.severity||'low', category:a.category||'other', latitude:a.latitude??stateCentroids[a.location]?.[0]??0, longitude:a.longitude??stateCentroids[a.location]?.[1]??0, location:a.location||a.place||'', status:a.status||'active', created_at:a.created_at||new Date().toISOString(), updated_at:a.updated_at||a.created_at||new Date().toISOString(), created_by:a.created_by||null }))); }
            } catch(e){ console.error(e);} finally{ setLoading(false); } }} className="border px-4 py-2 rounded">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black dark:text-white">Filters</h3>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="text-sm text-body block mb-2">Status</label>
                  <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="w-full border rounded p-2">
                    <option value="all">All</option>
                    <option value="active">Active / Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-body block mb-2">Search</label>
                  <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="title, description or location" className="w-full border rounded p-2" />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm text-gray-500 mb-2">Stats</h4>
              <div className="flex flex-col gap-2">
                <div className="text-sm">Total: <strong>{stats.total}</strong></div>
                <div className="text-sm">Open: <strong>{stats.open}</strong></div>
                <div className="text-sm">Investigating: <strong>{stats.investigating}</strong></div>
                <div className="text-sm">Resolved: <strong>{stats.resolved}</strong></div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Recent Alerts</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="text-center py-6">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-6">No alerts found</div>
              ) : (
                filtered.map((a) => (
                  <div key={a.id} className={`p-3 rounded border ${selectedAlert?.id === a.id ? 'border-brand-500 bg-gray-50' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-body">{a.location || 'Unknown'}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500"><DateTime iso={a.created_at} /></div>
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => setSelectedAlert(a)} className="px-3 py-1 bg-primary text-white rounded text-sm">Details</button>
                          <button onClick={() => setSelectedAlert(a)} className="px-3 py-1 border rounded text-sm">View on map</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Map</h3>
            <div style={{ height: '640px' }}>
              <SecurityMap
                alerts={alerts}
                onAlertClick={(a) => setSelectedAlert(a)}
                highlightAlert={selectedAlert}
                height="100%"
                zoom={6}
              />
            </div>
          </div>

          {selectedAlert && (
            <div className="mt-4 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold text-black dark:text-white">Alert Details</h3>
              <div className="mt-3">
                <div className="font-medium text-xl">{selectedAlert.title}</div>
                <div className="text-sm text-gray-500">{selectedAlert.location}</div>
                <p className="mt-2 text-body">{selectedAlert.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Severity</div>
                    <div className="font-semibold">{selectedAlert.severity}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="font-semibold">{selectedAlert.status}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Coordinates</div>
                    <div className="font-semibold">{selectedAlert.latitude}, {selectedAlert.longitude}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Created</div>
                    <div className="font-semibold"><DateTime iso={selectedAlert.created_at} /></div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={() => setSelectedAlert(null)} className="px-4 py-2 border rounded">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket creation removed from alerts UI for super-admin scope */}
    </div>
  );
}
