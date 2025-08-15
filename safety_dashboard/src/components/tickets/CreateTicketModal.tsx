"use client";

import React, { useState, useEffect } from 'react';
import { Alert } from '@/types';
import { useTicketStore } from '@/store/tickets';
import stateCentroids from '@/data/nigeriaStateCentroids';

type Props = {
  open: boolean;
  alert: Alert | null;
  onClose: () => void;
  onCreated?: (ticket: any) => void;
};

export default function CreateTicketModal({ open, alert, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [officers, setOfficers] = useState<Array<{ id: string; name: string }>>([]);
  const [officersLoading, setOfficersLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createTicketStore = useTicketStore(state => state.createTicket);
  // new location/state selection
  const [stateSelection, setStateSelection] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    if (open && alert) {
      setTitle(`Ticket: ${alert.title}`);
      setDescription(`From alert (${alert.id})\n${alert.description || ''}`);
      setPriority(alert.severity === 'critical' ? 'high' : (alert.severity || 'low') as any);
      setAssignedTo(undefined);
      // populate location fields from the alert when available
      const alertLocation = alert.location ?? null;
      setLocation(alertLocation);
      // if alert location matches a known state, select it and autofill coords
      if (alertLocation && Object.prototype.hasOwnProperty.call(stateCentroids, alertLocation)) {
        setStateSelection(alertLocation);
        const coords = (stateCentroids as any)[alertLocation];
        setLatitude(coords?.[0] ?? null);
        setLongitude(coords?.[1] ?? null);
      } else {
        setStateSelection(null);
        setLatitude((alert as any)?.latitude ?? null);
        setLongitude((alert as any)?.longitude ?? null);
      }
      setError(null);
    }
    if (!open) {
      setTitle('');
      setDescription('');
      setPriority('low');
      setAssignedTo(undefined);
      setStateSelection(null);
      setLocation(null);
      setLatitude(null);
      setLongitude(null);
      setError(null);
    }
  }, [open, alert]);

  // load units/officers for assignment dropdown
  useEffect(() => {
    let mounted = true;
    const loadOfficers = async () => {
      setOfficersLoading(true);
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        // try common endpoints; backend might expose units or officers
        const tries = [`${base}/api/units`, `${base}/api/officers`, `${base}/api/users?role=police`, `/api/units`, `/api/officers`];
        for (const url of tries) {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) continue;
            const payload = await res.json();
            const items = Array.isArray(payload) ? payload : payload.data || payload.items || [];
            const mapped = items.map((u: any) => ({ id: String(u.id ?? u._id ?? u.name ?? u.unit ?? u.code ?? u.label), name: u.name ?? u.label ?? u.unit ?? u.name ?? String(u.id) }));
            if (mounted) {
              setOfficers(mapped);
              setOfficersLoading(false);
            }
            return;
          } catch (err) {
            // try next
          }
        }
      } catch (err) {
        // fallthrough to mock
      }
      if (mounted) {
        // fallback mock options
        setOfficers([
          { id: 'unit-1', name: 'Unit 1 - Patrol' },
          { id: 'unit-2', name: 'Unit 2 - Rapid Response' },
          { id: 'officer-1', name: 'Officer A' },
        ]);
        setOfficersLoading(false);
      }
    };

    if (open) loadOfficers();
    return () => { mounted = false; };
  }, [open]);

  const showToast = (message: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Ticket', { body: message });
    } else if (typeof document !== 'undefined') {
      const el = document.createElement('div');
      el.textContent = message;
      el.className = 'fixed right-4 top-4 bg-black text-white px-4 py-2 rounded z-50';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      priority,
      alert_id: alert?.id ?? null,
      assigned_to: assignedTo || undefined,
      // prefer selected state/location, otherwise alert fallback
      location: stateSelection || location || alert?.location || null,
      coordinates: latitude != null && longitude != null ? { latitude, longitude } : (alert ? { latitude: (alert as any).latitude, longitude: (alert as any).longitude } : null),
      // default created_by for operator-created tickets
      created_by: 'operator:phone',
    };

    try {
      const created = await createTicketStore(payload as any);
      showToast('Ticket created');
      onCreated?.(created);
      onClose();
      // modal no longer navigates directly; parent should handle navigation/highlight
    } catch (err: any) {
      console.error('Create ticket failed', err);
      setError(err?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    // position modal near top so it appears on top of the map rather than low on the page
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded shadow-lg p-6 z-10 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create Ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm block mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded p-2 bg-white dark:bg-gray-800" />
          </div>

          <div>
            <label className="text-sm block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required className="w-full border rounded p-2 bg-white dark:bg-gray-800" />
          </div>

          <div>
            <label className="text-sm block mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full border rounded p-2 bg-white dark:bg-gray-800">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* State dropdown with automatic geocoding */}
          <div>
            <label className="text-sm block mb-1">State (select to autofill location)</label>
            <select
              value={stateSelection ?? ''}
              onChange={(e) => {
                const val = e.target.value || null;
                setStateSelection(val);
                if (val && Object.prototype.hasOwnProperty.call(stateCentroids, val)) {
                  const coords = (stateCentroids as any)[val];
                  setLatitude(coords?.[0] ?? null);
                  setLongitude(coords?.[1] ?? null);
                  setLocation(val);
                } else {
                  setLatitude(null);
                  setLongitude(null);
                }
              }}
              className="w-full border rounded p-2 bg-white dark:bg-gray-800"
            >
              <option value="">-- Select State (optional) --</option>
              {Object.keys(stateCentroids).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Location (free text)</label>
            <input value={location ?? ''} onChange={(e) => { setLocation(e.target.value || null); setStateSelection(null); }} placeholder="e.g. Lagos, Ikeja" className="w-full border rounded p-2 bg-white dark:bg-gray-800" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">Latitude (optional)</label>
              <input value={latitude ?? ''} onChange={(e) => { setLatitude(e.target.value ? Number(e.target.value) : null); setStateSelection(null); }} placeholder="Latitude" className="w-full border rounded p-2 bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="text-sm block mb-1">Longitude (optional)</label>
              <input value={longitude ?? ''} onChange={(e) => { setLongitude(e.target.value ? Number(e.target.value) : null); setStateSelection(null); }} placeholder="Longitude" className="w-full border rounded p-2 bg-white dark:bg-gray-800" />
            </div>
          </div>

          <div>
            <label className="text-sm block mb-1">Assign To (optional)</label>
            {officersLoading ? (
              <select className="w-full border rounded p-2 bg-white dark:bg-gray-800" disabled>
                <option>Loading units...</option>
              </select>
            ) : (
              <select value={assignedTo || ''} onChange={(e) => setAssignedTo(e.target.value || undefined)} className="w-full border rounded p-2 bg-white dark:bg-gray-800">
                <option value="">Unassigned</option>
                {officers.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            )}
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded">{loading ? 'Creating...' : 'Create Ticket'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
