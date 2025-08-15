"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import stateCentroids from '@/data/nigeriaStateCentroids';
import * as turf from '@turf/turf';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as any;

import mockTickets from '@/data/mockTickets';

export type AlertLike = {
  id: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  created_at?: string;
  status?: string;
  [k: string]: any;
};

export type LgaProps = {
  state?: string;
  alerts?: AlertLike[];
  selectedLga?: string;
};

function slug(v?: string) {
  if (!v) return '';
  return String(v).toLowerCase().replace(/\s+/g, '_');
}

function getColor(count: number) {
  if (!count) return '#f2f2f2';
  if (count >= 5) return '#7f1d1d';
  if (count >= 3) return '#b91c1c';
  if (count >= 2) return '#ef4444';
  return '#f97316';
}

export default function LgaChoroplethClient({ state = '', alerts = [], selectedLga }: LgaProps) {
  const [geo, setGeo] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setError(null);
      setGeo(null);
      const candidates = [
        `/geojson/${slug(state)}_lgas.geojson`,
        `/geojson/nigeria_lgas.geojson`,
        `/geojson/nigeria_states.geojson`,
      ];
      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Not found');
          const j = await res.json();
          if (mounted) {
            setGeo(j);
            return;
          }
        } catch (err) {
          // continue
        }
      }
      if (mounted) setError('No LGA geojson found under /public/geojson');
    };
    load();
    return () => {
      mounted = false;
    };
  }, [state]);

  const center: [number, number] = useMemo(() => {
    if (state) {
      const key = Object.keys(stateCentroids).find(k => String(k).toLowerCase() === String(state).toLowerCase());
      if (key) return (stateCentroids as any)[key];
    }
    return [9.0820, 8.6753];
  }, [state]);

  // Compute counts per feature using turf for robust geometry ops
  const { featureCounts, max, features } = useMemo(() => {
    if (!geo) return { featureCounts: new Map<string, number>(), max: 0, features: [] as any[] };
    const counts = new Map<string, number>();
    const feats: any[] = geo.features || [];
    let maxCount = 0;
    // initialize
    for (const feat of feats) {
      const name = feat.properties?.NAME || feat.properties?.name || feat.properties?.LGA || feat.properties?.ADM2 || 'unknown';
      counts.set(name, 0);
    }

    // convert features to turf polygons once
    const turfFeatures = feats.map((f) => {
      try {
        return turf.feature(f.geometry, f.properties);
      } catch (e) {
        return null;
      }
    });

    for (const a of alerts) {
      if (typeof a.latitude !== 'number' || typeof a.longitude !== 'number') continue;
      const pt = turf.point([a.longitude, a.latitude]);
      for (let i = 0; i < turfFeatures.length; i++) {
        const tf = turfFeatures[i];
        if (!tf) continue;
        try {
          if (turf.booleanPointInPolygon(pt, tf as any)) {
            const feat = feats[i];
            const name = feat.properties?.NAME || feat.properties?.name || feat.properties?.LGA || feat.properties?.ADM2 || 'unknown';
            const prev = counts.get(name) || 0;
            counts.set(name, prev + 1);
            if (prev + 1 > maxCount) maxCount = prev + 1;
            break; // point can belong to only one polygon
          }
        } catch (e) {
          // ignore geometric errors per feature
        }
      }
    }

    return { featureCounts: counts, max: maxCount, features: feats };
  }, [geo, alerts]);

  // Top LGAs
  const topLgas = useMemo(() => {
    const arr: { name: string; count: number }[] = [];
    for (const [k, v] of featureCounts.entries()) arr.push({ name: k, count: v });
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 10);
  }, [featureCounts]);

  // Build 7-day timeseries for a given LGA
  const lgaSeries = (lgaName: string) => {
    const days = 7;
    const now = new Date();
    const series: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const cnt = alerts.filter((a) => {
        const t = a.created_at ? new Date(a.created_at).getTime() : 0;
        if (typeof a.latitude !== 'number' || typeof a.longitude !== 'number') return false;
        // check if point is inside any feature with the given name
        // find corresponding feature geometry
        const matched = (features || []).find((feat: any) => {
          const name = feat.properties?.NAME || feat.properties?.name || feat.properties?.LGA || feat.properties?.ADM2 || 'unknown';
          if (String(name) !== String(lgaName)) return false;
          try {
            const tf = turf.feature(feat.geometry, feat.properties);
            return turf.booleanPointInPolygon(turf.point([a.longitude, a.latitude]), tf as any);
          } catch (e) {
            return false;
          }
        });
        if (!matched) return false;
        return t >= start && t < end;
      }).length;
      series.push(cnt);
    }
    return series;
  };

  // If a selectedLga is present compute tickets and series
  const selectedData = useMemo(() => {
    if (!selectedLga) return null;
    const tickets = mockTickets.filter((tk: any) => (String((tk as any).location || '').toLowerCase().includes(String(selectedLga || '').toLowerCase()) || String((tk as any).alert_id || '').toLowerCase().includes(String(selectedLga || '').toLowerCase())));
    const series = lgaSeries(selectedLga);
    const count = featureCounts.get(selectedLga) || 0;
    return { tickets, series, count };
  }, [selectedLga, featureCounts, alerts]);

  const exportCsv = () => {
    const rows = [['LGA', 'Alerts']];
    for (const { name, count } of topLgas) rows.push([name, String(count)]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug(state || 'nigeria')}_top_lgas.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        {error}
      </div>
    );
  }

  if (!geo) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading map…</div>
    );
  }

  return (
    <div className="relative h-full w-full flex gap-4">
      <div className="relative flex-1 h-full">
        <MapContainer center={center} zoom={8} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON
            data={geo as any}
            style={(feature: any) => {
              const name = feature.properties?.NAME || feature.properties?.name || feature.properties?.LGA || feature.properties?.ADM2 || 'unknown';
              const count = featureCounts.get(name) || 0;
              return {
                fillColor: getColor(count),
                weight: 1,
                opacity: 1,
                color: '#444',
                dashArray: '0',
                fillOpacity: 0.7,
              } as any;
            }}
            onEachFeature={(feature: any, layer: any) => {
              const name = feature.properties?.NAME || feature.properties?.name || feature.properties?.LGA || feature.properties?.ADM2 || 'unknown';
              const count = featureCounts.get(name) || 0;
              layer.bindPopup(`<div><strong>${name}</strong><div>Alerts: ${count}</div><div style="margin-top:6px"><a href="#" data-lga="${encodeURIComponent(name)}" class="lga-drill">View details</a></div></div>`);
              layer.on('popupopen', () => {
                const el = document.querySelector('.lga-drill') as HTMLAnchorElement | null;
                if (el) {
                  el.onclick = (e) => {
                    e.preventDefault();
                    const lga = decodeURIComponent(el.getAttribute('data-lga') || '');
                    // navigate to same page with lga query
                    const params = new URLSearchParams(location.search);
                    if (state) params.set('state', state);
                    params.set('lga', lga);
                    router.push(`/super-admin/location/state-analysis?${params.toString()}`);
                  };
                }
              });
              layer.on('mouseover', function () {
                layer.setStyle({ weight: 2, color: '#000' });
              });
              layer.on('mouseout', function () {
                layer.setStyle({ weight: 1, color: '#444' });
              });
            }}
          />

        </MapContainer>

        <div className="absolute left-3 bottom-3 bg-white p-2 rounded shadow-sm text-xs">
          <div className="font-semibold mb-1">Legend</div>
          <div className="flex items-center gap-2"><span className="w-4 h-3 block" style={{ background: getColor(0) }} /> 0</div>
          <div className="flex items-center gap-2"><span className="w-4 h-3 block" style={{ background: getColor(1) }} /> 1</div>
          <div className="flex items-center gap-2"><span className="w-4 h-3 block" style={{ background: getColor(2) }} /> 2</div>
          <div className="flex items-center gap-2"><span className="w-4 h-3 block" style={{ background: getColor(3) }} /> 3+</div>
        </div>
      </div>

      <aside className="w-80 max-w-xs h-full overflow-y-auto bg-white border-l p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Top LGAs</h3>
          <button onClick={exportCsv} className="text-sm text-brand-500">Export CSV</button>
        </div>

        <div className="space-y-2">
          {topLgas.map((t) => (
            <div key={t.name} className="p-2 border rounded-sm flex items-center gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-gray-400">{t.count} alerts</div>
              </div>
              <div className="w-24 h-8">
                <Chart options={{ chart: { sparkline: { enabled: true } }, stroke: { width: 2 }, xaxis: { categories: [] } }} series={[{ data: lgaSeries(t.name) }]} type="area" height={40} />
              </div>
            </div>
          ))}
        </div>

        {selectedData ? (
          <div className="mt-4 border-t pt-3">
            <h4 className="font-semibold mb-2">{selectedLga}</h4>
            <div className="text-xs text-gray-500 mb-2">Alerts: {selectedData.count}</div>
            <div className="mb-3 h-12">
              <Chart options={{ chart: { sparkline: { enabled: true } }, stroke: { width: 2 } }} series={[{ data: selectedData.series }]} type="area" height={48} />
            </div>

            <div className="mb-2 font-medium">Tickets</div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedData.tickets.length === 0 && <div className="text-xs text-gray-400">No tickets for this LGA</div>}
              {selectedData.tickets.map((tk: any) => (
                <div key={tk.id} className="p-2 border rounded-sm">
                  <div className="text-sm font-medium">{tk.title}</div>
                  <div className="text-xs text-gray-400">{tk.status} • {new Date(tk.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-xs text-gray-500">Click an LGA polygon or open LGA from map popup to see details.</div>
        )}
      </aside>
    </div>
  );
}
