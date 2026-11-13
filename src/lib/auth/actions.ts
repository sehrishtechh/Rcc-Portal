"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/env";
import { requireRole } from "@/lib/auth/dal";
import { employeeApprovalSchema, loginSchema, registrationSchema } from "@/lib/auth/schemas";

export type AuthActionState = { error?: string; message?: string };

export async function signIn(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email address and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Sign-in failed. Check your details and try again." };
  redirect("/dashboard");
}

export async function registerEmployee(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = registrationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") || undefined,
    jobTitle: formData.get("jobTitle") || undefined,
    professionalDetails: formData.get("professionalDetails") || undefined,
  });
  if (!parsed.success) return { error: "Check your details. Use a valid email and a password with at least 12 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=/pending-approval`,
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        job_title: parsed.data.jobTitle,
        professional_details: parsed.data.professionalDetails,
      },
    },
  });
  if (error) return { error: "Registration could not be completed. Check the email and try again." };

  return { message: "Registration received. Verify your email if asked; an administrator must approve your account before you can access project information." };
}

export async function requestPasswordReset(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.shape.email.safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: "We could not send the reset email. Please try again later." };
  return { message: "If an account exists for that email, password reset instructions are on the way." };
}

export async function resetPassword(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = formData.get("password");
  const confirmation = formData.get("confirmation");
  const parsed = registrationSchema.shape.password.safeParse(password);
  if (!parsed.success) return { error: "Use 12–128 characters with a lowercase letter, uppercase letter, number, and symbol." };
  if (confirmation !== parsed.data) return { error: "The passwords do not match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: "Your password could not be updated. Request a new reset link and try again." };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function reviewEmployeeRegistration(formData: FormData) {
  await requireRole(["admin"]);
  const parsed = employeeApprovalSchema.safeParse({
    userId: formData.get("userId"),
    decision: formData.get("decision"),
    role: formData.get("role") || undefined,
  });
  if (!parsed.success || (parsed.data.decision === "approved" && !parsed.data.role)) {
    throw new Error("Choose an employee role before approving this registration.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_employee_registration", {
    target_user_id: parsed.data.userId,
    decision: parsed.data.decision,
    assigned_role: parsed.data.role ?? null,
  });
  if (error) throw new Error("This registration could not be updated. Refresh the page and try again.");

  revalidatePath("/employee-approvals");
  revalidatePath("/dashboard");
}
