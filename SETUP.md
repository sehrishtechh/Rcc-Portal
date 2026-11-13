# Local setup

## Requirements

- Node.js 20.9 or newer
- npm
- Docker Desktop for the local Supabase stack
- A separate Supabase development project for hosted Auth/Storage integration

## Install and configure

```sh
npm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Do not put a service-role key in a `NEXT_PUBLIC_*` variable, commit it, or send it in chat.

## Local Supabase

```sh
SUPABASE_HOME=/private/tmp/rcc-supabase-home npm run db:start
SUPABASE_HOME=/private/tmp/rcc-supabase-home npm run db:reset
```

`db:reset` rebuilds the local database from migrations and seed files. It does not target the hosted project. Keep `SUPABASE_HOME` set in this restricted environment because the default `~/.supabase` location is outside the writable workspace.

## Run the web app

```sh
npm run dev
```

The app is served at `http://127.0.0.1:3000`. Useful checks:

```sh
npm run lint
npm run typecheck
npm run build
```

## Hosted development project

Use a dedicated Supabase development project. Configure its Auth redirect URLs for the local app and use only its project URL and publishable key in `.env.local`. Apply reviewed migrations with `npm run db:push` only after the linked project has been verified as the development project.

The first organization administrator must be bootstrapped by the project owner after registering through the app. In the Supabase SQL Editor for the verified development project, replace the email below with the owner's registration email and run:

```sql
update public.profiles
set status = 'approved', role = 'admin'
where email = 'owner@example.com'
  and status = 'pending'
  and role is null;
```

Confirm the editor reports exactly one updated row. This one-time bootstrap is required because public registration intentionally cannot grant an administrator role. Never run this against production without following the organization's access approval process.

## Current implementation boundary

The app shell, Supabase Auth flows, protected dashboard, employee approval screen, client/project CRUD, initial schema, RLS policies, storage buckets and workflow RPCs are in place. The database migration has not yet been executed or integration-tested: this environment has no Docker runtime, and the connected Supabase dashboard did not finish loading. Inspection capture, report authoring, task workflow screens, notifications, analytics, and document generation remain to be implemented before the acceptance criteria are met.
