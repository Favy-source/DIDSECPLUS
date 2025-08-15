# DIDSECPLUS — API Endpoints (mock / spec for mobile developers)

This document describes the REST endpoints we use or plan to expose for the safety_dashboard demo. The frontend currently uses mock data under `src/data/` but the following endpoints are the recommended contract for a small backend (Next.js API routes or any REST service) to support the mobile app and the admin dashboard.

Notes
- All endpoints return JSON and use standard HTTP status codes.
- For the demo, the frontend reads mock data; implement these endpoints and return the sample shapes to integrate with mobile clients.
- Authentication is out of scope here; endpoints assume an Authorization bearer token in headers when protected.

Base path (recommended)
- /api/v1

---

## Authentication

### POST /api/v1/auth/login
- Description: Sign in and receive an access token.
- Request body:
  - email (string)
  - password (string)
- Response 200:
```json
{ "access_token": "<jwt>", "expires_in": 3600, "user": { "id":"u2","username":"asmith","role":"admin" } }
```

### POST /api/v1/auth/logout
- Description: Invalidate current token (optional for mobile).
- Response: 204 No Content

---

## Alerts

### GET /api/v1/alerts
- Query params: page, page_size, status (active|investigating|resolved), state, lga, from, to
- Response:
```json
{
  "data": [{ "id":"a1","title":"Robbery","description":"...","status":"active","latitude":6.5244,"longitude":3.3792,"created_at":"2025-08-14T...Z" }],
  "meta": { "page":1, "page_size":20, "total":43 }
}
```

### GET /api/v1/alerts/:id
- Response: single alert object with full geo, images, and related tickets

### POST /api/v1/alerts
- Create an alert (mobile will use this). Body:
  - title, description, latitude, longitude, source (phone|app|web), user_id (optional)
- Response 201: created alert object

### PATCH /api/v1/alerts/:id
- Update status or assigned unit. Body: { status: 'investigating' }

### DELETE /api/v1/alerts/:id
- Remove alert (admin). Response 204

---

## Tickets

### GET /api/v1/tickets
- Query: page, page_size, status (open|in_progress|resolved), assigned_to, created_by, alert_id
- Response: paginated tickets with ticket fields

Example ticket shape:
```json
{
  "id": "t1",
  "title": "Follow up: Robbery a1",
  "description": "Officer dispatched",
  "status": "open",
  "priority": "high",
  "alert_id": "a1",
  "created_by": "operator:+234xxxxxxxx",
  "assigned_to": "police-123",
  "created_at": "2025-08-14T10:12:00Z"
}
```

### GET /api/v1/tickets/:id
- Ticket details including linked alert and updates/notes

### POST /api/v1/tickets
- Create ticket (body: title, description, priority, alert_id, created_by, assigned_to?)
- Response 201 created ticket

### PATCH /api/v1/tickets/:id
- Update status, assignment, or add notes

### DELETE /api/v1/tickets/:id
- Delete ticket (admin)

---

## Users

### GET /api/v1/users
- Query: page, page_size, role, q (search), location
- Response: paginated users
- User shape:
```json
{
  "id":"u1",
  "username":"jdoe",
  "name":"John Doe",
  "role":"citizen",
  "location":"Lagos, Ikeja",
  "device":"Android",
  "ticketIds":["t1"],
  "created_at":"2025-08-14T...Z"
}
```

### GET /api/v1/users/:id
- Return user profile and recent tickets

### POST /api/v1/users
- Create user. Body: username, name, role, location, device
- Response 201: created user

### PATCH /api/v1/users/:id
- Update user profile or role

### DELETE /api/v1/users/:id
- Remove user (admin)

---

## Locations & Geo

### GET /api/v1/locations/states
- Return list of states and simple centroids
- Response:
```json
[{ "id":"NG-LA", "name":"Lagos", "centroid": [6.5244, 3.3792] }]
```

### GET /api/v1/locations/states/:stateId/lgas
- Return LGA polygons (GeoJSON) for the given state
- Response: GeoJSON FeatureCollection

### GET /api/v1/locations/lgas?bbox=... or ?state=...
- Filtered LGA geojson or stats per LGA (counts)

---

## Analytics endpoints (optional)
- GET /api/v1/analytics/users?from=2025-07-01&to=2025-08-15&role=all
  - Returns time series for signups, active counts, device breakdown, top locations
- GET /api/v1/analytics/alerts?from=&to=&state=&lga=
  - Returns aggregated counts per day and per polygon

Response shape (example):
```json
{ "signups": { "labels": ["8/1","8/2"], "series": [2,5] }, "by_role": {"citizen": 50, "admin": 3 } }
```

---

## Notes for mobile developers
- Authentication: include `Authorization: Bearer <token>` for protected endpoints.
- Geo fields: latitude and longitude are floats in WGS84 (EPSG:4326).
- Time fields: use ISO 8601 strings in UTC.
- Pagination: follow `page` and `page_size` query params and return `meta` with total counts.
- Error handling: return standard HTTP error codes and a JSON body `{ error: true, message: '...' }`.

---

## Mock integration tips
- For local mobile development, implement a mock server (JSON Server or small Express/Next route) that returns the shapes above using the local `src/data/*.ts` as seed data.
- The frontend demo persists users to `localStorage` under key `mockUsers` — clear this key to reset sample data.

If you want, I can scaffold Next.js API routes (`src/app/api/*`) that implement these endpoints backed by the existing mock files so the mobile developer can point at `http://localhost:3000/api/v1/...` during development. Tell me if you want that scaffolding created.
