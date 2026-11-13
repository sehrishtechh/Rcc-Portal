import { ClipboardList, UserRoundCheck } from "lucide-react";
import { connection } from "next/server";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentProfile, requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { reviewEmployeeRegistration } from "@/lib/auth/actions";

const assignableRoles = [
  ["senior_engineer", "Senior engineer"],
  ["inspector", "Inspection personnel"],
  ["report_writer", "Report writer"],
  ["designer", "Designer"],
  ["drafter", "Drafter"],
] as const;

export default function EmployeeApprovalsPage() {
  return <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-16 text-sm text-muted">Loading employee requests…</div>}><EmployeeApprovalsContent /></Suspense>;
}

async function EmployeeApprovalsContent() {
  await connection();
  await requireRole(["admin"]);
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data: registrations, error } = await supabase
    .from("profiles")
    .select("user_id, email, full_name, phone, job_title, professional_details, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw new Error("Pending employee registrations could not be loaded.");

  return (
    <DashboardShell profile={profile}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#168f8b]">Organization access</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">Employee approvals</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Review registrations and assign only the role each employee needs.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-semibold text-navy"><UserRoundCheck size={16} aria-hidden="true" /> {registrations.length} pending</span>
      </div>

      {registrations.length === 0 ? (
        <section className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-teal/15 text-[#148d89]"><ClipboardList size={21} aria-hidden="true" /></span>
          <h2 className="mt-4 text-base font-semibold text-navy">No registrations awaiting review</h2>
          <p className="mt-1 text-sm text-muted">New employee requests will appear here.</p>
        </section>
      ) : (
        <div className="mt-8 space-y-4">
          {registrations.map((registration) => (
            <article className="rounded-2xl border border-line bg-white p-5 sm:p-6" key={registration.user_id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-navy">{registration.full_name}</h2>
                  <p className="mt-1 break-all text-sm text-muted">{registration.email}</p>
                  <div className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                    <div><p className="text-xs font-medium uppercase tracking-wide text-muted">Job title</p><p className="mt-1 text-navy">{registration.job_title || "Not provided"}</p></div>
                    <div><p className="text-xs font-medium uppercase tracking-wide text-muted">Phone</p><p className="mt-1 text-navy">{registration.phone || "Not provided"}</p></div>
                    {registration.professional_details && <div className="sm:col-span-2"><p className="text-xs font-medium uppercase tracking-wide text-muted">Professional details</p><p className="mt-1 max-w-3xl leading-6 text-navy">{registration.professional_details}</p></div>}
                    <p className="text-xs text-muted sm:col-span-2">Requested {new Date(registration.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-3 rounded-xl bg-background p-4 lg:max-w-sm">
                  <form action={reviewEmployeeRegistration} className="space-y-3">
                    <input type="hidden" name="userId" value={registration.user_id} />
                    <label className="block text-xs font-semibold text-navy" htmlFor={`role-${registration.user_id}`}>Role for approval
                      <select className="auth-input mt-2 bg-white" defaultValue="" id={`role-${registration.user_id}`} name="role">
                        <option disabled value="">Choose a role</option>
                        {assignableRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <button className="auth-submit" name="decision" value="approved" type="submit">Approve employee</button>
                    <button className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200" name="decision" value="rejected" type="submit">Reject request</button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
