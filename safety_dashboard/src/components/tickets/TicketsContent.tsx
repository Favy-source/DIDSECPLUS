"use client";

import React, { useMemo, useState } from 'react';
import mockTickets from '@/data/mockTickets';
import mockAlerts from '@/data/mockAlerts';
import SecurityMap from '@/components/location/SecurityMap';
import CreateTicketModal from '@/components/tickets/CreateTicketModal';
import { Ticket } from '@/types';
import { useTicketStore } from '@/store/tickets';
import DateTimeClient from '@/components/common/DateTimeClient';
import { useRouter } from 'next/navigation';

type Props = {
  initialTickets?: Ticket[];
  defaultStatus?: string;
  autoOpenCreate?: boolean;
};

export default function TicketsContent({ initialTickets = mockTickets, defaultStatus = 'open', autoOpenCreate = false }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  // auto open create modal when requested by a route wrapper
  React.useEffect(() => {
    if (autoOpenCreate) setShowCreate(true);
  }, [autoOpenCreate]);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(defaultStatus);
  const [search, setSearch] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const router = useRouter();

  const { tickets, createTicket } = useTicketStore();

  // seed store with initial tickets if store is empty
  React.useEffect(() => {
    if ((!tickets || tickets.length === 0) && initialTickets && initialTickets.length > 0) {
      // ensure some tickets are marked resolved for demo
      const seeded = initialTickets.map((t, i) => ({ ...(t as any), status: i % 5 === 0 ? 'resolved' : t.status }));
      seeded.forEach((t) => createTicket(t as any));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (highlightId) {
      // wait for DOM update
      setTimeout(() => {
        const el = document.querySelector(`[data-ticket-id="${highlightId}"]`);
        if (el && typeof (el as any).scrollIntoView === 'function') {
          (el as any).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // clear highlight after 8 seconds
        setTimeout(() => setHighlightId(null), 8000);
      }, 200);
    }
  }, [highlightId]);

  const list = useMemo(() => {
    const all = tickets && tickets.length > 0 ? tickets : initialTickets;
    return all.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.alert_id || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, initialTickets, filterStatus, search]);

  // derive alerts list for the map from tickets -> alert_id (use mockAlerts fallback)
  const alertsForMap = useMemo(() => {
    try {
      // try to load mockAlerts dataset to map ticket.alert_id -> alert
      const allAlertsModule = mockAlerts as any[];
      const alertById = new Map<string, any>();
      allAlertsModule.forEach((a) => alertById.set(String(a.id), a));

      const alerts = list
        .map((t) => alertById.get(String(t.alert_id)) || null)
        .filter(Boolean);
      return alerts as any[];
    } catch (e) {
      // fallback: map tickets that include lat/lng
      return (list as any[]).filter(t => (t as any).latitude && (t as any).longitude).map(t => ({ id: t.alert_id || t.id, title: t.title, description: t.description, latitude: (t as any).latitude, longitude: (t as any).longitude, category: 'incident', severity: t.priority || 'low', location: (t as any).location || '' }));
    }
  }, [list]);

  // highlighted alert for the map based on selectedTicket
  const highlightedAlert = useMemo(() => {
    if (!selectedTicket) return null;

    // try find in mockAlerts
    const all = mockAlerts as any[];
    const match = all.find((a) => String(a.id) === String(selectedTicket.alert_id));
    if (match) return match as any;

    // if ticket has coordinates, create a transient alert object so the map can focus
    if ((selectedTicket as any).latitude && (selectedTicket as any).longitude) {
      return {
        id: selectedTicket.alert_id || selectedTicket.id,
        title: selectedTicket.title,
        description: selectedTicket.description,
        latitude: (selectedTicket as any).latitude,
        longitude: (selectedTicket as any).longitude,
        category: 'incident',
        severity: selectedTicket.priority || 'low',
        location: (selectedTicket as any).location || '',
      } as any;
    }

    return null;
  }, [selectedTicket]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tickets</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            Create Ticket
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <select
          value={filterStatus || ''}
          onChange={(e) => setFilterStatus(e.target.value || undefined)}
          className="select">
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
        <input
          className="input"
          placeholder="Search tickets"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-1">
          <div className="overflow-x-auto bg-white border rounded">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Priority</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((t) => (
                  <tr
                    key={t.id}
                    data-ticket-id={t.id}
                    onClick={() => { setSelectedTicket(t); setHighlightId(t.id); }}
                    className={`cursor-pointer hover:bg-gray-50 ${highlightId === t.id ? 'bg-blue-50' : ''}`}>
                    <td className="px-3 py-2 text-sm">{t.id}</td>
                    <td className="px-3 py-2 text-sm">{t.title}</td>
                    <td className="px-3 py-2 text-sm">{t.priority}</td>
                    <td className="px-3 py-2 text-sm">{t.status}</td>
                    <td className="px-3 py-2 text-sm"><DateTimeClient iso={t.created_at} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2">
          <div className="h-96 border rounded overflow-hidden">
            <SecurityMap alerts={alertsForMap} highlightAlert={highlightedAlert} />
          </div>

          {selectedTicket && (
            <div className="mt-4 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h3 className="text-lg font-semibold mb-2">{selectedTicket.title}</h3>
              <div className="text-sm text-gray-600 mb-2">ID: {selectedTicket.id} • Priority: {selectedTicket.priority} • Status: {selectedTicket.status}</div>
              <div className="text-sm mb-4">{selectedTicket.description}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="text-sm">
                    { (selectedTicket as any).location 
                      || (highlightedAlert && (highlightedAlert.location || (highlightedAlert.latitude && highlightedAlert.longitude ? `${highlightedAlert.latitude}, ${highlightedAlert.longitude}` : ''))) 
                      || 'Unknown' }
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="text-sm"><DateTimeClient iso={selectedTicket.created_at} /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateTicketModal
          open={showCreate}
          alert={null}
          onClose={() => setShowCreate(false)}
          onCreated={(created: any) => {
            // highlight and navigate to super-admin tickets list
            if (created?.id) {
              setHighlightId(created.id);
            }
            setShowCreate(false);
            // ensure we are on the super-admin tickets route
            router.push('/super-admin/tickets');
          }}
        />
      )}
    </div>
  );
}
