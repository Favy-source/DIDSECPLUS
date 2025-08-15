"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Alert } from '@/types';
import stateCentroids from '@/data/nigeriaStateCentroids';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useRouter } from 'next/navigation';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

const normalizeSeverity = (s?: string) => {
  if (!s) return 'low';
  const v = s.toLowerCase();
  if (v.includes('crit')) return 'critical';
  if (v.includes('high')) return 'high';
  if (v.includes('med') || v.includes('mod')) return 'medium';
  if (v.includes('low')) return 'low';
  return 'low';
};

const createAlertIcon = (category: string, severity: string) => {
  const color = severity === 'critical' ? '#b91c1c' : severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#10b981';
  const shape = category === 'kidnapping' ? '🚨' : category === 'robbery' ? '💰' : category === 'assault' ? '⚠️' : category === 'suspicious' ? '👁️' : '📍';

  const svg = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><circle cx='18' cy='18' r='12' fill='${color}' stroke='%23fff' stroke-width='2'/><text x='18' y='22' font-size='14' text-anchor='middle'>${shape}</text></svg>`)} `;

  return L.icon({
    iconUrl: svg,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
    className: 'custom-svg-marker'
  });
};

interface SecurityMapProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
  highlightAlert?: Alert | null;
}

const NIGERIA_BOUNDS: [[number, number], [number, number]] = [
  [4.0, 2.7],
  [14.0, 14.7]
];

const NIGERIA_CENTER: [number, number] = [9.0, 7.5];

const FitNigeriaBounds: React.FC = () => {
  const map = useMap();
  useEffect(() => { map.fitBounds(NIGERIA_BOUNDS); }, [map]);
  return null;
};

const AlertUpdateHandler: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  const map = useMap();
  useEffect(() => {
    const latestAlert = alerts
      .filter(alert => {
        const alertTime = new Date(alert.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - alertTime.getTime()) / (1000 * 60);
        return diffMinutes <= 5;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (latestAlert) {
      const lat = (latestAlert as any).latitude || stateCentroids[latestAlert.location || '']?.[0];
      const lng = (latestAlert as any).longitude || stateCentroids[latestAlert.location || '']?.[1];
      if (lat && lng) map.setView([lat, lng], 12, { animate: true, duration: 1.5 });
    }
  }, [alerts, map]);
  return null;
};

const ClusterLayer: React.FC<{ alerts: Alert[]; onAlertClick?: (a: Alert) => void }> = ({ alerts, onAlertClick }) => {
  const map = useMap();
  useEffect(() => {
    let clusterGroup: any = (L as any).markerClusterGroup ? (L as any).markerClusterGroup() : new (L as any).LayerGroup();

    alerts.forEach((a) => {
      if (!(a as any).latitude || !(a as any).longitude) return;
      const marker = L.marker([(a as any).latitude, (a as any).longitude], { icon: createAlertIcon(a.category, normalizeSeverity(a.severity)) });
      marker.on('click', () => onAlertClick?.(a));
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    return () => { if (clusterGroup) map.removeLayer(clusterGroup); };
  }, [alerts, map, onAlertClick]);
  return null;
};

const StatesLayer: React.FC<{ alerts: Alert[]; onAlertClick?: (a: Alert) => void }> = ({ alerts, onAlertClick }) => {
  const map = useMap();
  const [geojson, setGeojson] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/geojson/nigeria_states.geojson')
      .then((r) => { if (!r.ok) throw new Error('No geojson'); return r.json(); })
      .then((data) => { if (mounted) setGeojson(data); })
      .catch(() => setGeojson(null));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (geojson) {
      const layer = (L as any).geoJSON(geojson, {
        style: (feature: any) => {
          const name = feature.properties?.NAME || feature.properties?.name || '';
          const count = alerts.filter(a => a.location?.includes(name) || a.title?.includes(name)).length;
          const status = count > 60 ? 'critical' : count > 40 ? 'high' : count > 20 ? 'moderate' : 'safe';
          const color = status === 'critical' ? '#b91c1c' : status === 'high' ? '#ef4444' : status === 'moderate' ? '#f59e0b' : '#10b981';
          return { fillColor: color, color: '#333', weight: 1, fillOpacity: 0.45 };
        },
        onEachFeature: (feature: any, layerFeature: any) => {
          const name = feature.properties?.NAME || feature.properties?.name || '';
          layerFeature.on('click', () => {
            const match = alerts.find(a => a.location?.includes(name) || a.title?.includes(name));
            if (match) onAlertClick?.(match);
          });
        }
      });

      map.addLayer(layer);
      return () => { map.removeLayer(layer); };
    } else {
      const circleGroup = new (L as any).LayerGroup();
      Object.entries(stateCentroids).forEach(([name, coords]) => {
        const count = alerts.filter(a => a.location?.includes(name) || a.title?.includes(name)).length;
        const status = count > 60 ? 'critical' : count > 40 ? 'high' : count > 20 ? 'moderate' : 'safe';
        const color = status === 'critical' ? '#b91c1c' : status === 'high' ? '#ef4444' : status === 'moderate' ? '#f59e0b' : '#10b981';
        const circle = L.circle(coords as any, { radius: Math.max(8000, count * 100), color, fillColor: color, fillOpacity: 0.25 });
        circle.on('click', () => {
          const match = alerts.find(a => a.location?.includes(name) || a.title?.includes(name));
          if (match) onAlertClick?.(match);
        });
        circleGroup.addLayer(circle);
      });

      map.addLayer(circleGroup);
      return () => { map.removeLayer(circleGroup); };
    }
  }, [geojson, alerts, map, onAlertClick]);

  return null;
};

const FocusOnAlert: React.FC<{ alert?: Alert | null }> = ({ alert }) => {
  const map = useMap();
  useEffect(() => { if (!alert) return; if ((alert as any).latitude && (alert as any).longitude) map.setView([(alert as any).latitude, (alert as any).longitude], 13, { animate: true, duration: 1.2 }); }, [alert, map]);
  return null;
};

const MapControls: React.FC<{
  filterSeverity: string;
  setFilterSeverity: (severity: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}> = ({ filterSeverity, setFilterSeverity, filterCategory, setFilterCategory }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-sm font-semibold mb-2">Filter Alerts</h3>
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
        <select title="Filter by severity" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-3 py-1 border border-gray-300 rounded text-sm">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
        <select title="Filter by category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
          <option value="">All Categories</option>
          <option value="kidnapping">Kidnapping</option>
          <option value="robbery">Robbery</option>
          <option value="assault">Assault</option>
          <option value="suspicious">Suspicious Activity</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );
};

const SecurityMapClient: React.FC<SecurityMapProps> = ({ alerts, onAlertClick, height = '500px', center = NIGERIA_CENTER, zoom = 6, highlightAlert = null }) => {
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [fetchedAlerts, setFetchedAlerts] = useState<Alert[]>([]);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [selectedStateAlert, setSelectedStateAlert] = useState<Alert | null>(null);
  const router = useRouter();

  // dynamically load the markercluster plugin only on the client after mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Import the CJS plugin at runtime so Webpack/Next.js doesn't try to evaluate it during SSR
        await import('leaflet.markercluster');
        // plugin augments the global L object; nothing else needed
      } catch (err) {
        // Not fatal — clustering will just not be available
        // Log for debugging
        // eslint-disable-next-line no-console
        console.warn('leaflet.markercluster failed to load', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/alerts`;
    if (!url) return;
    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const items: Alert[] = Array.isArray(data) ? data : data.data || [];
        if (mounted) setFetchedAlerts(items);
      } catch (e) { }
    })();
    return () => { mounted = false; controller.abort(); };
  }, []);

  // defensive: alerts may be undefined when callers pass different prop names
  const incomingAlerts: Alert[] = Array.isArray(alerts) ? alerts : [];
  const mergedAlertsMap = new Map<string, Alert>();
  incomingAlerts.forEach((a) => { if (a && a.id != null) mergedAlertsMap.set(String(a.id), a); });
  fetchedAlerts.forEach((a) => { if (a && a.id != null) mergedAlertsMap.set(String(a.id), a); });
  const mergedAlerts = Array.from(mergedAlertsMap.values());

  const normalizedAlerts = mergedAlerts.map((a) => {
    const coords = ((a as any).latitude && (a as any).longitude) ? [(a as any).latitude, (a as any).longitude] : (stateCentroids[a.location || a.title || ''] || [null, null]);
    return { ...a, latitude: coords[0] as number, longitude: coords[1] as number } as Alert;
  }).filter(a => a.latitude && a.longitude);

  // compute counts per state for the side list
  const stateCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(stateCentroids).forEach((s) => { counts[s] = 0; });
    normalizedAlerts.forEach((a) => {
      if (!a.location) return;
      Object.keys(stateCentroids).forEach((s) => {
        if (String(a.location).toLowerCase().includes(String(s).toLowerCase()) || String(a.title).toLowerCase().includes(String(s).toLowerCase())) {
          counts[s] = (counts[s] || 0) + 1;
        }
      });
    });
    return counts;
  }, [normalizedAlerts]);

  // apply state filter to alerts
  const stateFilteredAlerts = React.useMemo(() => {
    if (!stateFilter) return normalizedAlerts;
    return normalizedAlerts.filter((a) => {
      const loc = String(a.location || '').toLowerCase();
      return loc.includes(stateFilter.toLowerCase()) || String(a.title || '').toLowerCase().includes(stateFilter.toLowerCase());
    });
  }, [normalizedAlerts, stateFilter]);

  const filteredAlerts = normalizedAlerts.filter(alert => {
    const severityMatch = !filterSeverity || normalizeSeverity(alert.severity) === filterSeverity;
    const categoryMatch = !filterCategory || alert.category.toLowerCase() === filterCategory;
    return severityMatch && categoryMatch;
  });

  const formatTime = (timestamp: string) => new Date(timestamp).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative w-full h-full">
      {/* Left state list / drilldown panel */}
      <aside className="absolute left-4 top-4 z-[1100] w-56 max-h-[70vh] overflow-auto bg-white rounded shadow-lg p-3">
        <h4 className="text-sm font-semibold mb-2">States</h4>
        <ul className="text-sm space-y-1">
          {Object.keys(stateCounts).map((s) => (
            <li key={s} className={`flex items-center justify-between p-1 rounded cursor-pointer hover:bg-gray-50 ${stateFilter === s ? 'bg-blue-50' : ''}`}>
              <button className="text-left flex-1" onClick={() => {
                setStateFilter(s);
                // create transient alert to focus map via existing FocusOnAlert component
                const coords = (stateCentroids as any)[s];
                setSelectedStateAlert({ id: `state-${s}`, title: s, description: `${s} overview`, category: 'other', severity: 'low', location: s, latitude: coords?.[0], longitude: coords?.[1], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: 'system' } as any);
              }}>
                {s}
              </button>
              <div className="text-xs text-gray-600 ml-2">{stateCounts[s] || 0}</div>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-2">
          <button onClick={() => { setStateFilter(null); setSelectedStateAlert(null); }} className="px-2 py-1 text-xs border rounded">Clear</button>
          <button onClick={() => { if (stateFilter) router.push(`/super-admn/location/state-analysis?state=${encodeURIComponent(stateFilter)}`); }} className="px-2 py-1 text-xs bg-primary text-white rounded">View Analysis</button>
        </div>
      </aside>

      <div style={{ height: height || '500px' }} className="w-full">
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} className="rounded-lg">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitNigeriaBounds />
          <AlertUpdateHandler alerts={filteredAlerts} />
          {/* prefer highlighting either external prop or internal state-based selection */}
          <FocusOnAlert alert={selectedStateAlert || highlightAlert} />
          <StatesLayer alerts={stateFilteredAlerts} onAlertClick={onAlertClick} />
          <ClusterLayer alerts={stateFilteredAlerts} onAlertClick={onAlertClick} />
          {stateFilteredAlerts.map((alert) => (
            <Marker key={alert.id} position={[(alert as any).latitude, (alert as any).longitude]} icon={createAlertIcon(alert.category, normalizeSeverity(alert.severity))} eventHandlers={{ click: () => onAlertClick?.(alert) }}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{alert.title}</div>
                  <div className="text-xs text-gray-600">{alert.category} • {normalizeSeverity(alert.severity)}</div>
                  <div className="mt-1 text-xs">{formatTime(alert.created_at)}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <MapControls filterSeverity={filterSeverity} setFilterSeverity={setFilterSeverity} filterCategory={filterCategory} setFilterCategory={setFilterCategory} />
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg">
        <div className="text-sm font-medium text-gray-800">Showing {stateFilteredAlerts.length} of {incomingAlerts.length} alerts</div>
        <div className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default SecurityMapClient;
