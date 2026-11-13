import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { Archive, FolderKanban } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProjectForm } from "@/components/operations/project-form";
import { archiveProject } from "@/lib/operations/project-actions";
import { getCurrentProfile, requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <Suspense fallback={<p className="p-10 text-sm text-muted">Loading projects…</p>}><ProjectsData searchParams={searchParams} /></Suspense>;
}

async function ProjectsData({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  await connection();
  await requireRole(["admin"]);
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [{ data: projects, error }, { data: clients, error: clientError }] = await Promise.all([
    supabase.from("projects").select("id, client_id, reference, title, property_address, property_type, category, service_type, description, priority, status, start_date, target_completion_date, internal_notes, clients(name)", { count: "exact" }).is("archived_at", null).order("created_at", { ascending: false }).range((page - 1) * 50, page * 50 - 1),
    supabase.from("clients").select("id, name").is("archived_at", null).order("name").range(0, 999),
  ]);
  if (error || clientError) throw new Error("Project records could not be loaded.");
  const projectClients = clients ?? [];

  return <DashboardShell profile={profile}>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#168f8b]">Delivery management</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">Projects</h1><p className="mt-2 text-sm text-muted">Manage engineering work and keep it connected to the right client.</p></div><span className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-navy">{projects.length} active records</span></div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="h-fit rounded-2xl border border-line bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-navy">Create a project</h2><p className="mb-5 mt-1 text-sm text-muted">Start with a client record, then add scope and delivery dates.</p>{projectClients.length ? <ProjectForm clients={projectClients} /> : <p className="rounded-xl bg-background p-4 text-sm leading-6 text-muted">Create a client record first. <a className="font-semibold text-navy underline" href="/clients">Go to clients</a>.</p>}</section>
      <section className="space-y-4" aria-label="Project records">
        {!projects.length && <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center"><FolderKanban className="mx-auto text-[#168f8b]" /><h2 className="mt-3 font-semibold text-navy">No projects yet</h2><p className="mt-1 text-sm text-muted">New project records will appear here.</p></div>}
        {projects.map((project) => <details className="group rounded-2xl border border-line bg-white" key={project.id}>
          <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-5 sm:p-6"><span><span className="block text-xs font-bold uppercase tracking-wide text-[#168f8b]">{project.reference} · {project.status.replaceAll("_", " ")}</span><span className="mt-1 block font-semibold text-navy">{project.title}</span><span className="mt-1 block text-sm text-muted">{(project.clients as unknown as {name: string} | null)?.name ?? "Client"} · {project.property_address?.formatted ?? "No address"}</span></span><span className="rounded-md bg-background px-3 py-2 text-xs font-semibold text-navy group-open:bg-navy group-open:text-white">Edit project</span></summary>
          <div className="border-t border-line p-5 sm:p-6"><ProjectForm clients={projectClients} project={project} compact /><form action={archiveProject} className="mt-4 border-t border-line pt-4"><input type="hidden" name="id" value={project.id} /><button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50" type="submit"><Archive size={15} aria-hidden="true" />Archive project</button></form></div>
        </details>)}
        {(projects.length === 50 || page > 1) && <nav aria-label="Project pages" className="flex items-center justify-between rounded-xl border border-line bg-white p-3"><span className="text-xs text-muted">Page {page}</span><div className="flex gap-2">{page > 1 && <Link className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-navy" href={`/projects?page=${page - 1}`}>Previous</Link>}{projects.length === 50 && <Link className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-navy" href={`/projects?page=${page + 1}`}>Next</Link>}</div></nav>}
      </section>
    </div>
  </DashboardShell>;
}
