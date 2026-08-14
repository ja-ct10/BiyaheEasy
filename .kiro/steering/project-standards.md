---
inclusion: always
---

# BiyaheEasy Project Standards

## Architecture

- Full-stack TypeScript application: Next.js 15 frontend + Express.js backend + Supabase PostgreSQL
- Authenticated PWA with mobile-first design optimized for daily Filipino commuters
- 5 authenticated pages: Home, Plan Trip, My Trips, Budget, Profile
- 2 auth routes: /login, /register

## Frontend Conventions

- Use Next.js App Router with 'use client' for interactive components
- All authenticated pages must be wrapped in the `<AppShell>` component for route protection
- Use Framer Motion for animations (subtle, premium feel)
- Use Lucide React icons exclusively (no emojis)
- Use React Hook Form + Zod for form validation
- Tailwind CSS with the project's custom design tokens
- Mobile bottom tab bar (MobileNav), desktop top navigation bar (Navigation)

## Design System

- Background: #050816
- Surface: #0B1220
- Surface 2: #111827
- Accent: #E8F000 (bright yellow)
- Text: #FFFFFF
- Muted: #94A3B8
- Card radius: 24px (rounded-card)
- Button radius: 16px (rounded-btn)
- Input radius: 14px (rounded-input)
- Font: Inter
- Shadow: soft glow using accent at 10% opacity

## Component Patterns

- Reusable UI: Button, Card, Input, Skeleton, ErrorBoundary, InstallPrompt
- Layout: AppShell (auth guard + nav), Navigation (desktop), MobileNav (mobile PWA tabs)
- Use `cn()` utility from @/lib/utils for conditional classnames
- Use `formatCurrency()`, `formatDuration()`, `formatDistance()` from @/lib/utils

## Backend Conventions

- Express.js with TypeScript strict mode
- Controller → Service → Supabase architecture
- Zod validation on all inputs via middleware
- JWT auth middleware on protected routes
- Winston structured logging
- Standardized API response: `{ success, data?, error?, message? }`
- Rate limiting: 100 req/15min general, 20 req/15min auth

## Database

- Supabase PostgreSQL with Row Level Security on all tables
- Tables: users, saved_trips, trip_history, budget_goals
- All user data scoped by auth.uid() via RLS policies

## PWA

- next-pwa configured for service worker + offline caching (production only)
- Web App Manifest with theme_color #E8F000, background_color #050816
- Offline fallback page at /public/offline.html
- InstallPrompt component for beforeinstallprompt event
- Safe-area padding for mobile bottom nav

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- Single quotes, 2-space indent, trailing commas (es5)
- Prefer named exports for components, default exports for pages
