import { Suspense } from "react";
import { connection } from "next/server";
import { Activity, ClipboardCheck, FileClock, FolderKanban, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { getCurrentProfile } from "@/lib/auth/dal";
import { getDashboardMetrics } from "@/lib/dashboard/metrics";

function DashboardLoading() {
  return <div aria-label="Loading dashboard" className="space-y-6" role="status"><div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div className="h-36 animate-pulse rounded-2xl border border-line bg-white" key={index} />)}</div></div>;
}

export default function DashboardPage() {
  return <Suspense fallback={<DashboardLoading />}><DashboardData /></Suspense>;
}

async function DashboardData() {
  await connection();
  const profile = await getCurrentProfile();
  const metrics = await getDashboardMetrics();
  const dashboardCards = [
    { label: "Active projects", value: metrics.activeProjects, hint: "Projects currently underway", icon: FolderKanban, tone: "navy" as const },
    { label: "Clients", value: metrics.clients, hint: "Active client records", icon: UsersRound, tone: "teal" as const },
    { label: "Inspections scheduled", value: metrics.scheduledInspections, hint: "Awaiting a site visit", icon: ClipboardCheck, tone: "navy" as const },
    { label: "Inspections in progress", value: metrics.inspectionsInProgress, hint: "Currently being completed", icon: Activity, tone: "teal" as const },
    { label: "Inspections for review", value: metrics.inspectionsForReview, hint: "Submitted or under review", icon: FileClock, tone: "amber" as const },
    { label: "Reports in technical QA", value: metrics.reportsInQa, hint: "Awaiting a QA decision", icon: FileClock, tone: "amber" as const },
    { label: "Reports for final approval", value: metrics.reportsAwaitingApproval, hint: "QA complete; final decision pending", icon: ClipboardCheck, tone: "navy" as const },
    { label: "Open assignments", value: metrics.activeTasks, hint: "Offered, accepted, or in progress", icon: Activity, tone: "teal" as const },
  ];

  return (
    <DashboardShell profile={profile}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#168f8b]">Operations overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy">Good to see you, {profile.full_name.split(" ")[0]}.</h1>
          <p className="mt-2 text-sm leading-6 text-muted">A live view of work you’re authorized to see.</p>
        </div>
        <p className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-muted">Updated from RCC database</p>
      </div>

      <section aria-label="Current work metrics" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => <MetricCard key={card.label} {...card} />)}
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-base font-semibold text-navy">Workflow at a glance</h2><p className="mt-1 text-sm text-muted">Counts reflect records allowed by your account.</p></div>
            <span className="rounded-lg bg-teal/15 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#148d89]">Live data</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-background p-4"><p className="text-xs text-muted">Inspection handoff</p><p className="mt-2 text-2xl font-semibold text-navy">{metrics.inspectionsForReview.toLocaleString()}</p><p className="mt-1 text-xs text-muted">awaiting review</p></div>
            <div className="rounded-xl bg-background p-4"><p className="text-xs text-muted">Technical review</p><p className="mt-2 text-2xl font-semibold text-navy">{metrics.reportsInQa.toLocaleString()}</p><p className="mt-1 text-xs text-muted">reports in QA</p></div>
            <div className="rounded-xl bg-background p-4"><p className="text-xs text-muted">Final decision</p><p className="mt-2 text-2xl font-semibold text-navy">{metrics.reportsAwaitingApproval.toLocaleString()}</p><p className="mt-1 text-xs text-muted">reports to approve</p></div>
          </div>
        </div>
        <aside className="rounded-2xl bg-navy p-6 text-white sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Your workspace</p>
          <h2 className="mt-3 text-xl font-semibold">{profile.role?.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Employee"}</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">Your project and assignment access is checked in the database for every request.</p>
          <div className="mt-7 border-t border-white/15 pt-5">
            <p className="text-xs text-white/55">Assigned open work</p>
            <p className="mt-1 text-3xl font-semibold">{metrics.activeTasks.toLocaleString()}</p>
          </div>
        </aside>
      </section>
    </DashboardShell>
  );
}
