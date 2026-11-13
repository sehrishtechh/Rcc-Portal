"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword, type AuthActionState } from "@/lib/auth/actions";
import { AuthMessage } from "./auth-message";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, initialState);
  return (
    <form action={action} className="space-y-4">
      <AuthMessage error={state.error} message={state.message} />
      <label className="block text-sm font-medium text-navy" htmlFor="password">
        New password
        <input className="auth-input" id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
        <span className="mt-1 block text-xs font-normal text-muted">Use 12–128 characters with a lowercase letter, uppercase letter, number, and symbol.</span>
      </label>
      <label className="block text-sm font-medium text-navy" htmlFor="confirmation">
        Confirm password
        <input className="auth-input" id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
      </label>
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Updating password…" : "Update password"}</button>
      <p className="pt-2 text-center text-sm text-muted"><Link className="font-semibold text-navy underline decoration-teal decoration-2 underline-offset-4" href="/login">Return to sign in</Link></p>
    </form>
  );
}
