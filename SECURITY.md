# Security

- Keep `.env.local`, Supabase access tokens, database passwords, and service-role keys out of Git and chat.
- Browser code may use only the Supabase URL and publishable key. RLS must protect every exposed table and Storage object.
- Never trust client-supplied role, organization, owner, or approval fields.
- Check authorization inside every Server Action and Route Handler that reads or changes business data.
- Use explicit permission grants for sensitive actions, especially final report approval.
- Keep Storage buckets private and issue signed URLs only after checking the owning record.
- Record consequential workflow changes in append-only activity history.
- Test cross-organization and cross-employee access with separate identities before production deployment.

The current migration is an initial foundation. Do not treat this document or a passing lint/build as a completed security audit.
