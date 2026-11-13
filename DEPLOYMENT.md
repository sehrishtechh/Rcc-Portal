# Deployment

Production deployment is intentionally not configured yet. First create and verify a dedicated development Supabase project, apply migrations there, and test Auth, RLS, and private Storage policies with separate users.

Before production:

1. Review the Git diff and connect the correct RCC Portal repository.
2. Configure separate Vercel Preview and Production environment variables without exposing secrets.
3. Configure production Supabase Auth redirect URLs and Storage policies.
4. Run lint, TypeScript, production build, and security/workflow checks.
5. Apply migrations through a controlled process and verify backups/recovery.
6. Obtain explicit approval before production deployment.
