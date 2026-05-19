# Packet of Lies

Packet of Lies is a malware investigation operations platform for internal security teams.

## Phase 3 Status

Core platform capabilities now live:

- Next.js 16 App Router application
- Tailwind CSS v4 and shadcn/ui setup
- Vercel-ready app structure
- Supabase SSR auth and role-protected routing
- Supabase-backed case creation workflow
- Supabase-backed submissions intake workflow
- Admin role management controls
- Packet of Lies design system and operations shell

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase SSR helpers
- Zod
- React Hook Form
- Sentry SDK

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in the Supabase values in `.env.local`.

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Environment variables

See `.env.example` for the required keys.

## Current routes

- `/dashboard`
- `/cases`
- `/submissions`
- `/indicators`
- `/reports`
- `/admin`

## Notes

- Routes are protected and require authentication.
- Admin role is required for `/admin`.
- The `reference` folder is visual inspiration only and is not part of the runtime app.
