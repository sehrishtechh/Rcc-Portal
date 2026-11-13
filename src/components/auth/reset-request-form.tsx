"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthActionState } from "@/lib/auth/actions";
import { AuthMessage } from "./auth-message";

const initialState: AuthActionState = {};

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);
  return (
    <form action={action} className="space-y-5">
      <AuthMessage error={state.error} message={state.message} />
      <label className="block text-sm font-medium text-navy" htmlFor="email">
        Work email
        <input className="auth-input" id="email" name="email" type="email" autoComplete="email" required />
      </label>
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>
    </form>
  );
}
