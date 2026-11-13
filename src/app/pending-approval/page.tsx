import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export default function PendingApprovalPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-background px-5 text-sm text-muted">Loading account status…</main>}><PendingApprovalContent /></Suspense>;
}

async function PendingApprovalContent() {
  await connection();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const { data: profile } = claims?.claims?.sub
    ? await supabase.from("profiles").select("full_name, status").eq("user_id", claims.claims.sub).maybeSingle()
    : { data: null };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-line bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Clock3 size={24} aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Employee onboarding</p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">Your request is under review</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{profile?.full_name ? `Thanks, ${profile.full_name}. ` : "Thanks. "}An RCC administrator must approve your account and assign a role before project information becomes available.</p>
        <p className="mt-5 rounded-xl bg-background px-4 py-3 text-xs leading-5 text-muted">Current status: <span className="font-semibold capitalize text-navy">{profile?.status ?? "pending"}</span></p>
        <div className="mt-7 flex justify-center gap-3">
          <Link className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-navy" href="/">Portal home</Link>
          <form action={signOut}><button className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white" type="submit">Sign out</button></form>
        </div>
      </section>
    </main>
  );
}
