"use client";

import { useActionState } from "react";
import { saveProject } from "@/lib/operations/project-actions";
import type { OperationActionState } from "@/lib/operations/client-actions";

const initialState: OperationActionState = {};
type ProjectValues = {
  id?: string; client_id?: string; reference: string; title: string;
  property_address?: { formatted?: string } | null; property_type?: string | null;
  category?: string | null; service_type?: string | null; description?: string | null;
  priority?: number; status?: string; start_date?: string | null;
  target_completion_date?: string | null; internal_notes?: string | null;
};

export function ProjectForm({ clients, project, compact = false }: { clients: { id: string; name: string }[]; project?: ProjectValues; compact?: boolean }) {
  const [state, action, pending] = useActionState(saveProject, initialState);
  return <form action={action} className="space-y-4">
    {project?.id && <input type="hidden" name="id" value={project.id} />}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-navy">Client<select className="auth-input bg-white" name="clientId" required defaultValue={project?.client_id ?? ""}><option disabled value="">Choose client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
      <label className="block text-sm font-medium text-navy">Project reference<input className="auth-input" name="reference" defaultValue={project?.reference ?? ""} required maxLength={40} pattern="[A-Za-z0-9_-]+" /></label>
      <label className="block text-sm font-medium text-navy sm:col-span-2">Project title<input className="auth-input" name="title" defaultValue={project?.title ?? ""} required maxLength={180} /></label>
      <label className="block text-sm font-medium text-navy sm:col-span-2">Property address<textarea className="auth-input min-h-20 resize-y" name="propertyAddress" defaultValue={project?.property_address?.formatted ?? ""} required maxLength={500} /></label>
      <label className="block text-sm font-medium text-navy">Property type<input className="auth-input" name="propertyType" defaultValue={project?.property_type ?? ""} maxLength={100} /></label>
      <label className="block text-sm font-medium text-navy">Service type<input className="auth-input" name="serviceType" defaultValue={project?.service_type ?? ""} maxLength={120} /></label>
      <label className="block text-sm font-medium text-navy">Category<input className="auth-input" name="category" defaultValue={project?.category ?? ""} maxLength={100} /></label>
      <label className="block text-sm font-medium text-navy">Priority<select className="auth-input bg-white" name="priority" defaultValue={String(project?.priority ?? 3)}>{[1, 2, 3, 4, 5].map((priority) => <option key={priority} value={priority}>{priority}{priority === 1 ? " · Highest" : priority === 5 ? " · Lowest" : ""}</option>)}</select></label>
      <label className="block text-sm font-medium text-navy">Status<select className="auth-input bg-white" name="status" defaultValue={project?.status ?? "planning"}>{[["planning", "Planning"], ["active", "Active"], ["on_hold", "On hold"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="block text-sm font-medium text-navy">Start date<input className="auth-input" name="startDate" type="date" defaultValue={project?.start_date ?? ""} /></label>
      <label className="block text-sm font-medium text-navy">Target completion<input className="auth-input" name="targetCompletionDate" type="date" defaultValue={project?.target_completion_date ?? ""} /></label>
    </div>
    <label className="block text-sm font-medium text-navy">Description<textarea className="auth-input min-h-20 resize-y" name="description" defaultValue={project?.description ?? ""} maxLength={4000} /></label>
    <label className="block text-sm font-medium text-navy">Internal notes<textarea className="auth-input min-h-20 resize-y" name="internalNotes" defaultValue={project?.internal_notes ?? ""} maxLength={2000} /></label>
    {state.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{state.error}</p>}
    {state.message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{state.message}</p>}
    <button className={compact ? "rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-charcoal" : "auth-submit"} type="submit" disabled={pending}>{pending ? "Saving…" : project ? "Save project" : "Create project"}</button>
  </form>;
}
