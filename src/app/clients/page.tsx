import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { Archive, Building2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ClientForm } from "@/components/operations/client-form";
import { archiveClient } from "@/lib/operations/client-actions";
import { getCurrentProfile, requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <Suspense fallback={<p className="p-10 text-sm text-muted">Loading clients…</p>}><ClientsData searchParams={searchParams} /></Suspense>;
}

async function ClientsData({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  await connection();
  await requireRole(["admin"]);
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: clients, count, error } = await supabase.from("clients")
    .select("id, name, company_name, email, phone, contact_person, billing_details, address, internal_notes, created_at", { count: "exact" })
    .is("archived_at", null).order("name").range((page - 1) * 50, page * 50 - 1);
  if (error) throw new Error("Client records could not be loaded.");

  return <DashboardShell profile={profile}>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#168f8b]">Organization records</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">Clients</h1><p className="mt-2 text-sm text-muted">Create and maintain client contact and billing details.</p></div>
      <span className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-navy">{count ?? clients.length} active clients</span>
    </div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="h-fit rounded-2xl border border-line bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-navy">Add a client</h2><p className="mb-5 mt-1 text-sm text-muted">Contact details stay private to this organization.</p><ClientForm /></section>
      <section className="space-y-4" aria-label="Client records">
        {clients.length === 0 && <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center"><Building2 className="mx-auto text-[#168f8b]" /><h2 className="mt-3 font-semibold text-navy">No client records yet</h2><p className="mt-1 text-sm text-muted">Use the form to add your first client.</p></div>}
        {clients.map((client) => <details className="group rounded-2xl border border-line bg-white" key={client.id}>
          <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5 sm:p-6"><span><span className="block font-semibold text-navy">{client.name}</span><span className="mt-1 block text-sm text-muted">{client.company_name || client.email || "No company or email provided"}</span></span><span className="rounded-md bg-background px-3 py-2 text-xs font-semibold text-navy group-open:bg-navy group-open:text-white">Edit details</span></summary>
          <div className="border-t border-line p-5 sm:p-6"><ClientForm client={client} compact /><form action={archiveClient} className="mt-4 border-t border-line pt-4"><input type="hidden" name="id" value={client.id} /><button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50" type="submit"><Archive size={15} aria-hidden="true" />Archive client</button></form></div>
        </details>)}
        {(count ?? 0) > 50 && <nav aria-label="Client pages" className="flex items-center justify-between rounded-xl border border-line bg-white p-3"><span className="text-xs text-muted">Page {page} of {Math.ceil((count ?? 0) / 50)}</span><div className="flex gap-2">{page > 1 && <Link className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-navy" href={`/clients?page=${page - 1}`}>Previous</Link>}{page < Math.ceil((count ?? 0) / 50) && <Link className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-navy" href={`/clients?page=${page + 1}`}>Next</Link>}</div></nav>}
      </section>
    </div>
  </DashboardShell>;
}
