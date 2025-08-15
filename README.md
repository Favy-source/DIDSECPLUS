# DIDSECPLUS — Safety Dashboard

Lightweight README for local development and feature overview.

## Summary
This repository contains a Next.js + TypeScript admin dashboard (safety_dashboard) and a Rust service (`Security_alert-main`). The frontend includes an admin area with Alerts, Tickets, Location analytics (maps + LGA choropleth), and Users management backed by mock data for local development.

## Key features (frontend)
- Sidebar that hides on hamburger collapse and exposes `--sidebar-width` for content offset.
- Emergency Alerts pages under `/super-admin/alerts` (mock data).
- Tickets UI under `/super-admin/tickets` with mock tickets and create modal.
- Location pages under `/super-admin/location/*`:
  - Security Map (client-only react-leaflet)
  - State Analysis (LGA choropleth, turf.js for point-in-polygon)
  - LGA Coverage
- Users area under `/super-admin/users/*` with:
  - All Users list (search, pagination, create user modal, details drawer)
  - User Roles filter
  - User Analytics (KPIs and charts using ApexCharts, mock-driven)
- Mock data stored in `src/data` (e.g. `mockAlerts.ts`, `mockTickets.ts`, `mockUsers.ts`). Some lists persist to `localStorage` for dev convenience.

## Important files
- Frontend root: `safety_dashboard/` (Next.js app router)
- Sidebar component: `src/layout/AppSidebar.tsx`
- Header: `src/layout/AppHeader.tsx`
- Map components: `src/components/location/SecurityMapClient.tsx` and `LgaChoroplethClient.tsx`
- Users pages: `src/app/super-admin/users/*`
- Mock data: `src/data/*.ts`
- Turf types shim (if present): `src/types/turf.d.ts`

## Setup (frontend)
From the project root run (choose npm/yarn/pnpm):

npm (recommended):

```bash
cd safety_dashboard
npm install
npm run dev
```

Required packages used by recent features:
- @turf/turf
- leaflet
- react-leaflet
- leaflet.markercluster
- apexcharts
- react-apexcharts

Dev types (optional): `@types/leaflet`, `@types/leaflet.markercluster`

Install example:

```bash
npm install @turf/turf leaflet react-leaflet leaflet.markercluster apexcharts react-apexcharts
npm install -D @types/leaflet @types/leaflet.markercluster
```

After installing, restart the dev server.

## Running and testing
- Start the frontend: `cd safety_dashboard && npm run dev`
- Open: `http://localhost:3000/super-admin/users/allusers` (or other pages under `/super-admin`)

## Development notes & gotchas
- Mapping libraries (Leaflet and some marker cluster plugins) are Browser-only — map components are client-side only.
- Turf (`@turf/turf`) must be installed; if you see "Cannot find module '@turf/turf'" install the package and restart the server.
- Sidebar exposes a CSS variable `--sidebar-width`. Main content should use `margin-left: var(--sidebar-width)` to avoid being covered.
- Mock data is used for offline/demo: update `src/data/mock*.ts` to change demo content.
- Some mock state is persisted to `localStorage` (users list) for convenience during development.
- Charts use `react-apexcharts` (client-only via dynamic import).

## Where to extend
- Add real API calls in `src/services/` and replace mock data usage in pages/components.
- Add full LGA/state GeoJSON files under `public/geojson/` for richer maps.

If you want, I can add automated scripts to seed mock data or wire a small JSON API for the frontend to consume.
