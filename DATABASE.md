# Database

Supabase PostgreSQL is the authoritative store. Keep all schema changes in timestamped SQL migrations under `supabase/migrations/`.

## Local database commands

- `npm run db:start`: start the isolated local Supabase services.
- `npm run db:reset`: discard and rebuild the local database from migrations and development seed data.
- `npm run db:push`: apply local migrations to the currently linked hosted project. Verify that project is development before using it.

Generate application types from the local database with `npx supabase gen types typescript --local > src/lib/database.types.ts` after migrations are applied. Review generated output before committing it.

## Tenant and identity rules

- `auth.users` is the identity provider's source of truth.
- `profiles` binds each identity to an organization and stores approval state and role.
- Public registration never sets its own role or approval status.
- Organization IDs and foreign keys are used on business records; RLS policies enforce membership and assignment boundaries.
- Audit records are append-only for application users.

Never use development seed records in the hosted production database.
