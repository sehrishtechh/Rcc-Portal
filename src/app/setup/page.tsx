import Link from "next/link";
import { CircleHelp, KeyRound } from "lucide-react";
import { getSupabaseEnvironment } from "@/lib/supabase/env";
import { BrandMark } from "@/components/brand-mark";

export default function SetupPage() {
  const configured = Boolean(getSupabaseEnvironment());
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-10">
        <BrandMark />
        <div className="mt-10 flex size-12 items-center justify-center rounded-2xl bg-teal/15 text-navy">{configured ? <CircleHelp size={22} aria-hidden="true" /> : <KeyRound size={22} aria-hidden="true" />}</div>
        <h1 className="mt-5 text-2xl font-semibold text-navy">{configured ? "Database setup is incomplete" : "Connect the development database"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{configured ? "The app has project keys, but its database migrations or Auth setup are not ready yet. Ask the project administrator to finish the development setup." : "The Supabase development project is not connected yet. Protected pages stay closed until the project URL and publishable key are configured."}</p>
        <div className="mt-6 rounded-2xl bg-background p-5">
          <p className="text-sm font-semibold text-navy">Local configuration</p>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-muted">
            <li>Copy <code className="rounded bg-white px-1.5 py-0.5 text-xs text-navy">.env.example</code> to <code className="rounded bg-white px-1.5 py-0.5 text-xs text-navy">.env.local</code>.</li>
            <li>Set the development project URL and publishable key.</li>
            <li>Apply the reviewed migrations to the development database.</li>
          </ol>
        </div>
        <p className="mt-5 text-xs leading-5 text-muted">Never place a service-role key in browser code. Normal employee operations use the signed-in session and database Row Level Security.</p>
        <Link className="mt-7 inline-flex rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white" href="/">Back to RCC Portal</Link>
      </section>
    </main>
  );
}
