# BiyaheEasy Database

Database migrations and seed data for the BiyaheEasy commuter app, powered by Supabase (PostgreSQL).

## Database Schema

### Tables

| Table                 | Purpose                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `public.users`        | Extended user profiles (linked to Supabase `auth.users`) — stores name, avatar, home/work locations, and preferences |
| `public.saved_trips`  | User-saved routes with full route data, tags, and favorites                                                          |
| `public.trip_history` | Completed trip records with fare, duration, transport modes, and timestamps                                          |
| `public.budget_goals` | Monthly and daily spending limits per user                                                                           |

### Functions

| Function                                            | Purpose                                                                                       |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `get_monthly_spending(user_id, month, year)`        | Returns total spent, trip count, average fare, and transport mode breakdown for a given month |
| `get_daily_spending(user_id, start_date, end_date)` | Returns daily spending totals and trip counts for a date range                                |

## Setup Instructions

### Prerequisites

- A [Supabase](https://supabase.com) project (free tier works)
- Access to the Supabase Dashboard SQL Editor

### Running Migrations

1. Go to your Supabase Dashboard → **SQL Editor**
2. Run the migration files **in order**:

   ```
   1. database/migrations/001_create_tables.sql
   2. database/migrations/002_enable_rls.sql
   3. database/migrations/003_create_functions.sql
   ```

3. Each migration builds on the previous one, so order matters.

### Seeding Demo Data

1. First, create a user account through your app's sign-up flow (or via Supabase Auth dashboard)
2. Copy the user's UUID from the Supabase Auth → Users table
3. Open `database/seed/seed_data.sql`
4. Replace all instances of `'DEMO_USER_ID'` with the actual UUID (e.g., `'a1b2c3d4-e5f6-7890-abcd-ef1234567890'`)
5. Run the modified seed SQL in the SQL Editor

### Row Level Security (RLS)

All tables have RLS enabled. Policies ensure:

- Users can only **read, insert, update, and delete** their own data
- No cross-user data access is possible
- Trip history only allows insert and select (no editing past records)

### File Structure

```
database/
├── migrations/
│   ├── 001_create_tables.sql      # Tables, indexes, and triggers
│   ├── 002_enable_rls.sql         # Row Level Security policies
│   └── 003_create_functions.sql   # Budget calculation functions
├── seed/
│   └── seed_data.sql              # Demo data (Philippine commuter routes)
└── README.md                      # This file
```

## Notes

- The `users` table extends Supabase's built-in `auth.users` — the `id` column references `auth.users(id)` with cascading deletes
- All monetary values use `DECIMAL(10,2)` for Philippine Peso amounts
- Duration is stored in minutes as an integer
- Route data is stored as JSONB for flexibility in storing multi-modal route steps
- The `updated_at` columns are automatically maintained via database triggers
