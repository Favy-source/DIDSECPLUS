SecurityAlert System

## Overview
A full-stack security alert management platform for citizens and government agencies, built with a Rust backend and a Next.js/TypeScript frontend. Features robust JWT authentication, role-based dashboards, and real-time alerting.

---

## Features
- **JWT Authentication** for all users
- **Role-based Dashboards**: Super Admin, Admin, Police, Regular User
- **Super Admin**: Permanent login, creates Admin/Police accounts
- **Admin/Police**: Login only, credentials provided by Super Admin
- **User**: Register/login, receives JWT for API access
- **Real-time Alerts** and WebSocket support
- **PostgreSQL** database
- **Email notifications** via SMTP
- **Dockerized** for easy deployment

---

## Authentication Flow
### Regular Users
1. Register or log in via frontend
2. Backend validates and issues JWT
3. Frontend stores JWT and uses it for all API calls

### Government Users (Super Admin, Admin, Police)
- **Super Admin**: Permanent credentials (see below), creates Admin/Police accounts
- **Admin/Police**: Login only, credentials provided by Super Admin

---

## Super Admin Default Credentials
- **Email:** `superadmin@didsecplus.com`
- **Password:** `sadmin@123`

> Change these in production!

---

## Environment Variables Example (`.env`)
```
DATABASE_URL=postgresql://postgres:Ziggy4759@localhost:5432/security_alert
JWT_SECRET=rejhfjdfkjndfnlfnldflrfhjbfbfkbjfhjbfbhjfhsdabksabkbkfbbfbabsdabnsdakbsdbbdb
JWT_EXPIRATION=86400
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=ejioforkelvin@gmail.com
SMTP_PASSWORD=pbmguiqfogkygwus
FROM_EMAIL=ejioforkelvin@gmail.com
FROM_NAME="Auth System"
```

---

## Local Development
1. Clone the repo and run `setup-dev.sh`
2. Start backend: `cd safety_backend && cargo run`
3. Start frontend: `cd safety_dashboard && npm install && npm run dev`
4. Access dashboards at `http://localhost:3000`

---

## Testing
- Use the login pages for each role
- Super Admin: `/super-admin/login`
- Admin: `/admin/login`
- Police: `/police/login`
- User: `/login` (register at `/signup`)
- All API calls use JWT in `Authorization` header

---

## Project Structure
- `safety_backend/` — Rust backend (Axum, SeaORM, JWT)
- `safety_dashboard/` — Next.js/TypeScript frontend
- `Security_alert-main (2)/` — Modular backend (reference/legacy)

---

<!-- ## Deployment
- Use Docker Compose for full stack deployment
- Update `.env` for production credentials -->

---

## Contact
For support, contact the project maintainer at ejioforkelvin@gmail.com
