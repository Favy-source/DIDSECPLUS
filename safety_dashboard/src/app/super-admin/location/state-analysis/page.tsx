"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import AppSidebar from '@/layout/AppSidebar';
import AppHeader from '@/layout/AppHeader';
import mockAlerts from '@/data/mockAlerts';
import stateCentroids from '@/data/nigeriaStateCentroids';
import type { LgaProps } from '@/components/location/types';

const LgaChoroplethClient = dynamic(
  () => import('@/components/location/LgaChoroplethClient').then((mod) => mod.default as React.ComponentType<LgaProps>),
  { ssr: false }
) as React.ComponentType<LgaProps>;

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false }) as any;

function normalizeStatus(s?: string) {
  if (!s) return 'unknown';
  const v = String(s).toLowerCase();
  if (v === 'active' || v === 'investigating' || v === 'investigate') return 'open';
  if (v === 'resolved' || v === 'closed') return 'resolved';
  return v;
}

export default function Page({ searchParams }: { searchParams?: Record<string, string> }) {
  const state = searchParams?.state || '';

  // Filter alerts for the chosen state and normalize statuses
  const alerts = useMemo(() => {
    return mockAlerts
      .map((a) => ({ ...a, _normalized_status: normalizeStatus(a.status) }))
      .filter((a) => (state ? String(a.location || '').toLowerCase().includes(state.toLowerCase()) : true));
  }, [state]);

  const counts = useMemo(() => {
    return alerts.reduce((acc: any, a: any) => {
      acc.total = (acc.total || 0) + 1;
      acc.open = (acc.open || 0) + (a._normalized_status === 'open' ? 1 : 0);
      acc.resolved = (acc.resolved || 0) + (a._normalized_status === 'resolved' ? 1 : 0);
      return acc;
    }, {} as any);
  }, [alerts]);

  // Prepare 7-day sparkline series based on created_at
  const sparkData = useMemo(() => {
    const days = 7;
    const now = new Date();
    const series: number[] = [];
    const labels: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const cnt = alerts.filter((a: any) => {
        const t = new Date(a.created_at).getTime();
        return t >= start && t < end;
      }).length;
      series.push(cnt);
      labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    }
    return { series, labels };
  }, [alerts]);

  const chartOptions = {
    chart: {
      id: 'alerts-sparkline',
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: { opacity: 0.2 },
    tooltip: { enabled: true },
    xaxis: { categories: sparkData.labels },
  } as any;

  // alias typed dynamic component
  const LgaComp = LgaChoroplethClient;

  const selectedLga = (searchParams && (searchParams as any).lga) ? (searchParams as any).lga : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <AppHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-1 dark:bg-black">
          <div className="p-4 md:p-6 2xl:p-10">
            <h1 className="text-title-md2 font-semibold mb-4">State Analysis {state ? `— ${state}` : ''}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="rounded-sm border bg-white p-4 shadow-default">
                <div className="text-sm text-gray-500">Totals</div>
                <div className="mt-2 text-xl font-semibold">{counts.total || 0}</div>
                <div className="mt-3 text-xs text-gray-400">Open: {counts.open || 0} • Resolved: {counts.resolved || 0}</div>
              </div>

              <div className="rounded-sm border bg-white p-4 shadow-default lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Activity (last 7 days)</div>
                    <div className="mt-2 text-base font-medium">Alerts trend</div>
                  </div>
                </div>
                <div className="mt-4">
                  {typeof window !== 'undefined' && (
                    <Chart
                      options={chartOptions}
                      series={[{ name: 'alerts', data: sparkData.series }]}
                      type="area"
                      height={120}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-sm border bg-white p-4 shadow-default">
              <h2 className="text-sm font-semibold mb-3">LGA Coverage & Drilldown</h2>
              <p className="text-xs text-gray-500 mb-3">Click a polygon to drill down to the selected LGA. If LGA geojson is not present in <code>/public/geojson</code> a friendly message will be shown.</p>
              <div className="h-[480px]">
                {/* Render dynamic client component with typed props */}
                {typeof window !== 'undefined' ? <LgaComp state={state} alerts={alerts} selectedLga={selectedLga} /> : null}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
