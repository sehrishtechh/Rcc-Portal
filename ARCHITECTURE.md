# Architecture

## Application boundaries

- `src/app` contains App Router pages, layouts, Server Actions, and Route Handlers.
- `src/components` contains reusable interface components.
- `src/lib` contains Supabase clients, validation, authorization, and domain helpers.
- `supabase/migrations` is the versioned PostgreSQL schema and Row Level Security source of truth.
- `supabase/seed.sql` contains development-only fixtures.

## Request and data flow

1. A request is handled by Next.js App Router.
2. Server Components and Server Actions use the Supabase SSR server client and the signed-in user's cookies.
3. Supabase Auth establishes identity; profile status and permission checks decide application access.
4. PostgreSQL Row Level Security is the final data boundary. UI visibility and route redirects are not authorization.
5. Private files live in private Supabase Storage buckets. The server generates short-lived signed URLs only after checking record access.

Use Server Components by default. Keep client components for interactions that need browser state, such as camera capture and rich editing. Avoid caching user-specific results across sessions.

## Authorization model

Profiles carry organization membership, approval status, and a work role. Role defaults cover ordinary work; sensitive actions such as final report approval require an explicit permission grant. Business tables carry `organization_id`; project membership and assignment relations narrow access further. Database policies must be tested with multiple users before production use.
