# DIDSECPLUS — Safety Dashboard (local fork)

This README documents the safety_dashboard application contained in this workspace — a Next.js + TypeScript admin dashboard customized for local development and demonstration. It describes what is implemented here, how to run it, and where to find the code you will likely edit.

Status: developer/demo build
- Many admin features are implemented using mock data under `src/data/` for quick iteration.
- Client-only mapping and charting components are used (Leaflet / react-leaflet, ApexCharts).
- Some runtime-only libraries are imported dynamically to avoid SSR issues.

Quick links
- App root: `safety_dashboard/`
- Sidebar component: `src/layout/AppSidebar.tsx`
- Header: `src/layout/AppHeader.tsx`
- Mock data: `src/data/mockAlerts.ts`, `src/data/mockTickets.ts`, `src/data/mockUsers.ts`
- Users pages: `src/app/super-admin/users/*`
- Location pages: `src/app/super-admin/location/*`
- LGA client component: `src/components/location/LgaChoroplethClient.tsx`
- Security map client: `src/components/location/SecurityMapClient.tsx`

What this fork contains (high level)
- Sidebar / header chrome that can be collapsed; when collapsed a CSS variable `--sidebar-width` is emitted so the main content can offset itself.
- Alerts and Tickets pages under `/super-admin/*` wired to mock data.
- Users management pages (All Users, User Roles, User Analytics): search, pagination, create-user modal, details drawer, analytics dashboards.
- Location modules: client-only Leaflet map and LGA choropleth using Turf for robust geometry operations.
- CSV export helpers and simple client-side persistence (localStorage) for demo data.

Important pages (dev URLs)
- All Users — http://localhost:3000/super-admin/users/allusers
- User Roles — http://localhost:3000/super-admin/users/userroles
- User Analytics — http://localhost:3000/super-admin/users/useranalytics
- State Analysis — http://localhost:3000/super-admin/location/state-analysis
- Security Map — http://localhost:3000/super-admin/location/securitymap

Required packages (install before running)
This project relies on a few browser-only and chart/map libraries which must be installed:

- @turf/turf — geometry operations for choropleth and point-in-polygon
- leaflet, react-leaflet — mapping
- leaflet.markercluster — clustering (dynamically imported at runtime)
- apexcharts, react-apexcharts — charts (sparklines, area/line/donut)

Install (npm):

```bash
cd safety_dashboard
npm install @turf/turf leaflet react-leaflet leaflet.markercluster apexcharts react-apexcharts
# optionally install types for dev
npm install -D @types/leaflet @types/leaflet.markercluster
```

If you modified package.json already, run `npm install` to sync node_modules.

Run the dev server

```bash
cd safety_dashboard
npm run dev
# open http://localhost:3000/super-admin/users/allusers
```

Developer tips and gotchas
- Client-only libraries: Leaflet and some marker cluster plugins are browser-only. Map components live in client components (look for files that import from `react-leaflet` and use `dynamic` imports). Do not import these from server components.
- If you see "Cannot find module '@turf/turf'" or similar — stop the dev server, install the package, then restart.
- Sidebar overlay: the sidebar exposes `--sidebar-width` to offset main content. Use `margin-left: var(--sidebar-width)` (already used on the example pages) or adjust your layout so the sidebar isn't visually covered by maps/content.
- Local persistence: the Users list is persisted to `localStorage` (key: `mockUsers`) for convenient testing. Clear localStorage if you want to reset to the shipped mock dataset.
- Charts: the analytics page uses dynamic import for `react-apexcharts` (client-only). If charts don't appear, make sure dependencies are installed and the page is rendering on the client.

Mock data
- `src/data/mockAlerts.ts` — demo alerts used in map and alerts pages
- `src/data/mockTickets.ts` — demo tickets; tickets link to alerts where appropriate
- `src/data/mockUsers.ts` — demo users used by the Users pages and analytics

Where to change behavior
- Sidebar collapse behavior: `src/layout/AppSidebar.tsx` and `src/context/SidebarContext.tsx`
- Map & LGA logic: `src/components/location/SecurityMapClient.tsx` and `src/components/location/LgaChoroplethClient.tsx` (uses Turf for geometry checks)
- Users UI: `src/app/super-admin/users/*` (list, roles, analytics)
- Mock dataset: edit or extend files in `src/data/` to change sample records.

Recommended next improvements
- Replace mock data with a small JSON API (or Next.js API routes) to simulate server-side interactions.
- Add tests for critical UI flows (create user, detail drawer, map interactions).
- Improve accessibility of modal/drawer (focus trap, ARIA) for production readiness.

Contact / notes
- This fork has focused changes for local demo and development. If you want me to wire persistent storage, API endpoints, or convert forms to Server Actions, tell me which feature to implement next.
