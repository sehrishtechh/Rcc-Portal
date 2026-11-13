import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardMetrics() {
  const supabase = await createClient();
  const queries = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).is("archived_at", null),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "active").is("archived_at", null),
    supabase.from("inspections").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
    supabase.from("inspections").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("inspections").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "submitted_for_qa"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending_final_approval"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).in("status", ["offered", "accepted", "in_progress"]),
  ]);

  const failed = queries.find((query) => query.error);
  if (failed?.error) {
    throw new Error("Dashboard data could not be loaded. Check the database migration and access policies.");
  }

  return {
    clients: queries[0].count ?? 0,
    activeProjects: queries[1].count ?? 0,
    scheduledInspections: queries[2].count ?? 0,
    inspectionsInProgress: queries[3].count ?? 0,
    inspectionsForReview: queries[4].count ?? 0,
    reportsInQa: queries[5].count ?? 0,
    reportsAwaitingApproval: queries[6].count ?? 0,
    activeTasks: queries[7].count ?? 0,
  };
}
