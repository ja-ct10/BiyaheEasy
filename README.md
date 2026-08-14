# BiyaheEasy

AI-assisted commuting and route-planning platform for the Philippines. Plan trips, customize transportation preferences, compare routes, save trips, view trip history, and track transportation budgets across Metro Manila.

## Tech Stack

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form + Zod
- next-pwa (Progressive Web App)

### Backend

- Node.js + Express.js
- TypeScript
- JWT Authentication
- Zod validation
- Winston logging

### Database & Services

- Supabase PostgreSQL
- Supabase Auth (Email/Password + Google OAuth)
- Row Level Security (RLS)

### DevOps

- ESLint + Prettier
- Helmet security
- CORS configuration
- API rate limiting
- Compression

---

## Project Structure

```
biyaheeasy/
├── frontend/                  # Next.js 15 PWA
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── page.tsx      # Home (authenticated dashboard)
│   │   │   ├── plan/         # Plan Trip (Plan + Customize + Results tabs)
│   │   │   ├── trips/        # My Trips (Saved + History tabs)
│   │   │   ├── budget/       # Budget Dashboard
│   │   │   ├── profile/      # Profile & Settings
│   │   │   ├── login/        # Login
│   │   │   ├── register/     # Register
│   │   │   └── auth/         # OAuth callback
│   │   ├── components/
│   │   │   ├── layout/       # AppShell, Navigation, MobileNav
│   │   │   └── ui/           # Button, Card, Input, InstallPrompt, etc.
│   │   ├── context/          # AuthContext (Supabase Auth)
│   │   ├── lib/              # Supabase, API, utils, constants
│   │   └── types/            # TypeScript interfaces
│   ├── public/               # Static assets, manifest, offline page
│   └── package.json
├── backend/                   # Express.js API
│   ├── src/
│   │   ├── config/           # Database, env, CORS
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, validation, rate limiting
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   ├── validators/       # Zod schemas
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Logger, response helpers
│   │   ├── app.ts            # Express configuration
│   │   └── server.ts         # Entry point
│   └── package.json
└── database/                  # Supabase migrations
    ├── migrations/
    │   ├── 001_create_tables.sql
    │   ├── 002_enable_rls.sql
    │   └── 003_create_functions.sql
    └── seed/
        └── seed_data.sql
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### 1. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run migrations in order:
   - `database/migrations/001_create_tables.sql`
   - `database/migrations/002_enable_rls.sql`
   - `database/migrations/003_create_functions.sql`
3. (Optional) Enable Google Auth in Authentication > Providers
4. Copy your project URL and anon key from Settings > API

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your Supabase credentials in .env
npm install
npm run dev
```

The API will start on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and API URL
npm install
npm run dev
```

The app will start on `http://localhost:3000`.

### 4. Seed Demo Data (Optional)

1. Create a user account through the app
2. Copy the user UUID from Supabase Auth dashboard
3. Replace `DEMO_USER_ID` in `database/seed/seed_data.sql` with the UUID
4. Run the seed SQL in Supabase SQL Editor

---

## Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| POST   | /api/auth/register | Register new user             |
| POST   | /api/auth/login    | Login with email/password     |
| POST   | /api/auth/logout   | Logout and invalidate session |
| POST   | /api/auth/refresh  | Refresh access token          |

### Trips

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| POST   | /api/trips/plan  | Plan a trip with preferences |
| POST   | /api/trips/save  | Save a trip                  |
| GET    | /api/trips/saved | Get saved trips              |
| DELETE | /api/trips/:id   | Delete a saved trip          |

### Routes

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| POST   | /api/routes/generate | Generate route options |
| GET    | /api/routes/history  | Get trip history       |

### Budget

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| GET    | /api/budget/summary | Get budget summary |
| POST   | /api/budget/goal    | Set budget goal    |

### Profile

| Method | Endpoint     | Description         |
| ------ | ------------ | ------------------- |
| GET    | /api/profile | Get user profile    |
| PUT    | /api/profile | Update user profile |

---

## Features

- Smart route planning across 6 transport modes (Jeepney, Bus, MRT/LRT, UV Express, Tricycle, Walking)
- Real-time route comparison with fare, duration, transfers, comfort score, and CO2 estimates
- Budget tracking with daily/weekly/monthly spending analytics
- Saved trips with tags, favorites, search, and reuse
- Trip history timeline with analytics
- Customizable commuting preferences (Build Your Biyahe)
- Progressive Web App (installable, offline support)
- Dark premium UI with the BiyaheEasy design system
- Responsive design (mobile + tablet + desktop)
- Supabase Auth with email/password and Google OAuth
- Row Level Security on all database tables

---

## Design System

| Token         | Value   |
| ------------- | ------- |
| Background    | #050816 |
| Surface       | #0B1220 |
| Surface 2     | #111827 |
| Accent        | #E8F000 |
| Text          | #FFFFFF |
| Muted         | #94A3B8 |
| Card Radius   | 24px    |
| Button Radius | 16px    |
| Input Radius  | 14px    |
| Font          | Inter   |

---

## PWA

The app is fully installable as a Progressive Web App:

- Web App Manifest configured
- Service Worker with offline caching (production only)
- App shortcuts for "Plan a Trip" and "Saved Trips"
- Offline fallback page
- Theme color: #E8F000
- Background color: #050816

---

## License

MIT
