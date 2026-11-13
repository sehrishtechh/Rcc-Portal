# RCC Portal

RCC Portal is an engineering operations workspace for client projects, structural inspections, report delivery, technical review, design and drafting assignments.

## Local setup

1. Install Node.js 20.9 or newer and Docker Desktop.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and add the public URL and publishable key for the **development** Supabase project.
4. Start the local Supabase stack with `SUPABASE_HOME=/private/tmp/rcc-supabase-home npm run db:start`.
5. Apply migrations and seed data with `SUPABASE_HOME=/private/tmp/rcc-supabase-home npm run db:reset`.
6. Run the app with `npm run dev`.

The CLI state path above is a workspace-safe example for this Codex environment. On a normal development machine, the CLI uses `~/.supabase` by default.

## Current implementation status

The repository is being built in phases. Database migrations are the source of truth for the schema. Do not point migrations at a production Supabase project. The dashboard must use database-backed records; development seed data is separate from production data.

See [SETUP.md](./SETUP.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [DATABASE.md](./DATABASE.md), [SECURITY.md](./SECURITY.md), [WORKFLOWS.md](./WORKFLOWS.md), and [DEPLOYMENT.md](./DEPLOYMENT.md) for the operating guides as they are completed.
