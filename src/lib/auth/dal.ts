import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EmployeeRole =
  | "admin"
  | "senior_engineer"
  | "inspector"
  | "report_writer"
  | "designer"
  | "drafter";

export type EmployeeProfile = {
  user_id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: EmployeeRole | null;
  status: "pending" | "approved" | "rejected" | "suspended";
};

export async function getCurrentProfile(): Promise<EmployeeProfile> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_id, organization_id, email, full_name, role, status")
    .eq("user_id", claimsData.claims.sub)
    .maybeSingle();

  if (error) {
    throw new Error("We could not verify your employee access. Please try again.");
  }

  if (!profile || profile.status === "pending") {
    redirect("/pending-approval");
  }
  if (profile.status === "rejected") {
    redirect("/account-rejected");
  }
  if (profile.status === "suspended") {
    redirect("/account-suspended");
  }

  return profile as EmployeeProfile;
}

export async function requireRole(roles: EmployeeRole[]) {
  const profile = await getCurrentProfile();
  if (!profile.role || !roles.includes(profile.role)) {
    redirect("/unauthorized");
  }
  return profile;
}
