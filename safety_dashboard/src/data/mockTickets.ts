import mockAlerts from '@/data/mockAlerts';
import { Ticket } from '@/types';

const now = new Date();

// map alert severity -> ticket priority
const severityToPriority = (s: string) => {
  const v = s?.toLowerCase?.() || 'low';
  if (v.includes('crit') || v === 'critical') return 'high';
  if (v === 'high') return 'high';
  if (v === 'medium') return 'medium';
  return 'low';
};

const mockTickets: Ticket[] = mockAlerts.map((a, idx) => ({
  id: `TKT-${a.id.split('-').slice(1).join('')}-${String(idx + 1).padStart(4, '0')}`,
  title: `Ticket for: ${a.title}`,
  description: a.description || `Generated ticket for alert ${a.id}`,
  priority: severityToPriority(a.severity as string) as any,
  status: a.status === 'resolved' ? 'resolved' : 'open',
  assigned_to: undefined,
  latitude: (a as any).latitude ?? undefined,
  longitude: (a as any).longitude ?? undefined,
  location: a.location || '',
  alert_id: a.id,
  created_at: a.created_at || now.toISOString(),
  updated_at: a.updated_at || a.created_at || now.toISOString(),
  created_by: a.created_by || 'system',
}));

export default mockTickets;
