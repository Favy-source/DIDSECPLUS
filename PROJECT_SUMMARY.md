# DIDSECPLUS — Project Summary

A concise summary of the DIDSECPLUS repository and the safety dashboard project. Use this as a high-level reference for developers and deployers.

## Overview
- Purpose: A security alert and incident management dashboard for Nigeria with map-based visualizations, alerts, tickets, user administration and analytics.
- Repos structure highlights:
  - Frontend: `safety_dashboard` (Next.js, TypeScript, Tailwind)
  - Backend service (Rust): `Security_alert-main` (actix/axum or similar — Rust service source present)
  - Geo assets: `public/geojson/` (states and LGAs)

## Tech stack
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
- Mapping: Leaflet + react-leaflet, leaflet.markercluster (dynamically loaded), OpenStreetMap tiles
- Geometry: turf.js (@turf/turf) for robust spatial operations
- Charts: ApexCharts via react-apexcharts (client-only dynamic import)
- Persistence and Auth (recommended): Supabase (Postgres + Auth + Storage)
- Backend/service: Rust service in `Security_alert-main` (for server-side logic, integrations)

## Features implemented (frontend)
- Sidebar with hide-on-collapse behavior and CSS variable `--sidebar-width` for layout offsets
- Alerts UI moved under `/super-admin/alerts` and fed by mock data
- Tickets UI under `/super-admin/tickets` with create flow and mock ticket generation
- Location analytics:
  - Client-only `SecurityMapClient` (Leaflet) with marker clustering and state drilldown
  - `LgaChoroplethClient` with turf-based spatial aggregation, per-LGA detail panel, sparklines and CSV export
- Users admin area under `/super-admin/users`:
  - All Users list, Create User modal, details drawer, and localStorage-backed demo persistence
  - User Roles filter and User Analytics (KPIs and charts)
- README and `API_ENDPOINTS.md` with recommended backend contract for mobile/dev clients

## Key files & locations
- Frontend root: `safety_dashboard/`
- Map components: `safety_dashboard/src/components/location/SecurityMapClient.tsx`, `LgaChoroplethClient.tsx`
- Sidebar: `safety_dashboard/src/layout/AppSidebar.tsx`
- Mock data: `safety_dashboard/src/data/` (mockAlerts, mockTickets, mockUsers, nigeriaStateCentroids)
- Super-admin pages: `safety_dashboard/src/app/super-admin/*`
- API contract: `safety_dashboard/API_ENDPOINTS.md`
- Type shims: `safety_dashboard/src/types/turf.d.ts` (small shim added)

## Environment & secrets
- Local dev uses `.env.local` in `safety_dashboard/` (this file should not be committed). Typical keys:
  - NEXT_PUBLIC_SUPABASE_URL (public)
  - NEXT_PUBLIC_SUPABASE_ANON_KEY (public)
  - NEXT_PUBLIC_API_URL (frontend → backend proxy during dev)
  - NEXT_PUBLIC_WS_URL (wss in prod)
  - Feature flags: NEXT_PUBLIC_ENABLE_MOCK_DATA, NEXT_PUBLIC_ENABLE_WEBSOCKETS
- Server-only secrets (must be set in host or backend):
  - SUPABASE_SERVICE_ROLE_KEY (do not expose)
  - DATABASE_URL (Postgres connection)
  - SENTRY_DSN, other private keys

## How to run locally
1. cd `safety_dashboard`
2. npm ci
3. copy `.env.local.example` → `.env.local` (or set the env vars) and ensure `NEXT_PUBLIC_ENABLE_MOCK_DATA=true` for demo mode
4. npm run dev
5. Rust backend (optional): cd `Security_alert-main` and run with Cargo if you plan to use it

## Deployment notes
- Frontend (recommended): Vercel
  - Set project root to `safety_dashboard`
  - Production env vars must be configured in Vercel (do not rely on `.env.local`)
- Backend (Rust): deploy to Fly or Render using Docker; set `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in platform secrets
- Supabase: create project, enable PostGIS if required, create tables (users, alerts, tickets, locations), and configure RLS policies

## Next recommended steps / TODOs
- Add SQL migration files for Supabase tables and RLS policies (I can scaffold these)
- Add Next.js API routes under `safety_dashboard/src/app/api/v1/*` to proxy mock data using server-side secrets if you want an API for mobile clients
- Harden TypeScript types and remove any temporary `any` usage
- Run `npm install` in `safety_dashboard` to ensure `@turf/turf` and chart libs are present before building
- Create `vercel.json` (optional) to pin project root and rewrites for any API routes
- Add CI (Github Actions) for linting and build verification

## Quick contacts
- Repo root: `/home/favour-nwachukwu/Downloads/DIDSECPLUS`
- Frontend root for Vercel: `safety_dashboard`
- Rust service: `Security_alert-main`

If you want, I can now scaffold any of:
- SQL migrations + RLS policies (seed + migration files),
- Next.js API routes for `/api/v1/*` backed by the mock data,
- Dockerfile + `fly.toml` for the Rust service,
- `vercel.json` for Vercel settings.

Choose which scaffolds you want next (A/B/C/D).

## Mobile app (user flow)

A brief specification for a companion mobile app used by citizens and operators to report and manage alerts.

Overview
- Purpose: allow citizens to report incidents quickly with location, photos and minimal text; allow operators/police to receive, triage and convert reports into tickets and dispatch units.
- Platforms: iOS and Android (React Native recommended for parity with web UX and code reuse).

Minimal panic-button UX (primary mobile experience)
- After registration/login the app shows a simple home screen with a single prominent red panic button (large FAB) and minimal chrome.
- When the user presses the red button:
  - The app captures current GPS coordinates (and optionally coarse accuracy / timestamp).
  - The app collects device metadata (platform, model, OS version, app version) and a short device identifier.
  - The app calls POST /api/v1/alerts with payload: { latitude, longitude, source: 'panic_button', device: {platform, model, os}, user_id }
  - Backend behavior (recommended): create an alert record, immediately create a correlated ticket (status: open) and notify the admin/operator via realtime and push.
- Admin/operator view on dashboard:
  - Sees the incoming alert and its auto-generated ticket in the inbox.
  - Ticket details include the user device information, exact reported location (lat/lng and resolved LGA/state), timestamp and any metadata.
  - Operator can dispatch police: update ticket status and assign to police unit; dispatch logs are recorded on the ticket.

Key constraints & privacy
- Panic reports should be fast: minimise user input and avoid blocking the flow with optional fields.
- Allow anonymous mode (no PII) by sending only device ID and coords if user chooses.
- Secure uploads: use HTTPS and authenticated requests; server-only keys must never be present in the mobile app.

Key screens
- Onboarding / Auth
  - Sign up / Sign in (email/password, phone OTP, or social login via Supabase OAuth)
  - Brief permissions request (location, camera, push notifications)
- Home / Map
  - Map-centered feed showing nearby alerts and clusters
  - Quick-report button (FAB) to start a new alert
  - Filter and search (by severity, category, timeframe)
- Report flow (fast path)
  - Capture: take photo(s) or attach from gallery
  - Location: auto-detect GPS + allow manual pin-drop on a map; reverse-geocode suggestion (Nominatim)
  - Details: select category, severity, optional description, contact/anonymous toggle
  - Submit: shows confirmation and estimated ETA if operator assigned
- Alerts list / Details
  - Chronological list with map thumbnail, distance, severity badge
  - Detail page: full description, photos, timeline, related tickets or updates
  - Actions: follow, share, mark as false/duplicate (if allowed for role)
- Operator view (role-based)
  - Inbox of incoming reports with quick actions (acknowledge, assign, escalate)
  - Ticket view with notes, assignment, status updates and dispatch logs
- Profile & Settings
  - Manage contact info, notification preferences, saved locations
  - Data export / privacy & delete account requests

End-to-end flow (simple)
1. User opens app, grants location permission.
2. User taps Quick Report → camera opens; user takes photo and confirms.
3. App auto-fills GPS coords and suggests nearest LGA/state; user optionally adjusts pin.
4. User selects category (eg. robbery) and severity then taps Submit.
5. App POSTs to POST /api/v1/alerts (or directly to Supabase via client) with auth token.
6. Backend creates alert, optionally generates a ticket and notifies operators (via webhook / realtime / push).
7. Operator receives the alert in admin dashboard or operator mobile app; they can create/assign a ticket and update status.
8. User receives push notification on status changes or operator messages.

Offline & sync
- Allow creating reports offline: store locally, queue upload when network restored.
- Save local photos and metadata securely until upload; retry with exponential backoff.
- Show a synced/unsynced badge on pending reports.

Push notifications & realtime
- Use Supabase Realtime or FCM/APNs for push notifications to mobile clients.
- Notifications: new assignment, ticket updates, operator messages, and alerts in user's subscribed area.

Security & privacy
- Use secure auth (Supabase Auth) and short-lived access tokens.
- Never embed server-only keys (SUPABASE_SERVICE_ROLE_KEY) in the app.
- Minimize PII collection; allow anonymous reporting where appropriate.
- Encrypt sensitive attachments in transit (HTTPS) and store in private Supabase Storage buckets where required.

API integration notes
- Mobile calls should follow API contract in `API_ENDPOINTS.md`.
- Required endpoints for the mobile fast path:
  - POST /api/v1/auth/login (or use Supabase client auth)
  - POST /api/v1/alerts (report creation)
  - GET /api/v1/alerts?state=...&bbox=... (map feed)
  - GET /api/v1/alerts/:id (detail)
  - GET /api/v1/tickets?created_by=<user> (user ticket list)
- Use pagination and delta-sync for feeds; request only updates since last sync timestamp.

Testing & QA
- Test on low-bandwidth and airplane-mode scenarios.
- Validate GPS accuracy fallback (manual pin-drop) and LGA/state resolution.
- Test push notifications across FCM/APNs and token rotation.
