"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { clientSchema } from "./schemas";

export type OperationActionState = { error?: string; message?: string };

export async function saveClient(_state: OperationActionState, formData: FormData): Promise<OperationActionState> {
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the client details and try again." };
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();
  const { id, name, companyName, email, phone, contactPerson, billingDetails, address, internalNotes } = parsed.data;
  const values = {
    name,
    company_name: companyName || null,
    email: email || null,
    phone: phone || null,
    contact_person: contactPerson || null,
    billing_details: billingDetails ? { notes: billingDetails } : {},
    address: address ? { formatted: address } : {},
    internal_notes: internalNotes || null,
    updated_at: new Date().toISOString(),
  };
  const query = id
    ? supabase.from("clients").update(values).eq("id", id).eq("organization_id", profile.organization_id).is("archived_at", null)
    : supabase.from("clients").insert({ ...values, organization_id: profile.organization_id, created_by: profile.user_id });
  const { data, error } = await query.select("id").maybeSingle();
  if (error || !data) return { error: "The client could not be saved. Check that the name is unique and try again." };
  revalidatePath("/clients");
  return { message: id ? "Client details updated." : "Client created." };
}

export async function archiveClient(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid client.");
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update({ archived_at: new Date().toISOString() })
    .eq("id", id).eq("organization_id", profile.organization_id).is("archived_at", null);
  if (error) throw new Error("The client could not be archived.");
  revalidatePath("/clients");
}
