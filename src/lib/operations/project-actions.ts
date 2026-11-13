"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "./schemas";
import type { OperationActionState } from "./client-actions";

export async function saveProject(_state: OperationActionState, formData: FormData): Promise<OperationActionState> {
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the project details. Reference must use letters, numbers, hyphens, or underscores." };
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();
  const values = {
    client_id: parsed.data.clientId,
    reference: parsed.data.reference,
    title: parsed.data.title,
    property_address: { formatted: parsed.data.propertyAddress },
    property_type: parsed.data.propertyType || null,
    category: parsed.data.category || null,
    service_type: parsed.data.serviceType || null,
    description: parsed.data.description || null,
    priority: parsed.data.priority,
    status: parsed.data.status,
    start_date: parsed.data.startDate || null,
    target_completion_date: parsed.data.targetCompletionDate || null,
    internal_notes: parsed.data.internalNotes || null,
    updated_at: new Date().toISOString(),
  };
  const query = parsed.data.id
    ? supabase.from("projects").update(values).eq("id", parsed.data.id).eq("organization_id", profile.organization_id).is("archived_at", null)
    : supabase.from("projects").insert({ ...values, organization_id: profile.organization_id, created_by: profile.user_id });
  const { data, error } = await query.select("id").maybeSingle();
  if (error || !data) return { error: "The project could not be saved. Check the reference and selected client." };
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { message: parsed.data.id ? "Project details updated." : "Project created." };
}

export async function archiveProject(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid project.");
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ archived_at: new Date().toISOString() })
    .eq("id", id).eq("organization_id", profile.organization_id).is("archived_at", null);
  if (error) throw new Error("The project could not be archived.");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
