"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerEmployee, type AuthActionState } from "@/lib/auth/actions";
import { AuthMessage } from "./auth-message";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerEmployee, initialState);

  return (
    <form action={action} className="space-y-4">
      <AuthMessage error={state.error} message={state.message} />
      <label className="block text-sm font-medium text-navy" htmlFor="fullName">
        Full name
        <input className="auth-input" id="fullName" name="fullName" autoComplete="name" required minLength={2} maxLength={120} />
      </label>
      <label className="block text-sm font-medium text-navy" htmlFor="email">
        Work email
        <input className="auth-input" id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-navy" htmlFor="phone">
          Phone <span className="font-normal text-muted">(optional)</span>
          <input className="auth-input" id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
        <label className="block text-sm font-medium text-navy" htmlFor="jobTitle">
          Job title <span className="font-normal text-muted">(optional)</span>
          <input className="auth-input" id="jobTitle" name="jobTitle" autoComplete="organization-title" maxLength={120} />
        </label>
      </div>
      <label className="block text-sm font-medium text-navy" htmlFor="professionalDetails">
        Professional details <span className="font-normal text-muted">(optional)</span>
        <textarea className="auth-input min-h-20 resize-y" id="professionalDetails" name="professionalDetails" maxLength={500} placeholder="Qualifications, registration, or relevant experience" />
      </label>
      <label className="block text-sm font-medium text-navy" htmlFor="password">
        Password
        <input className="auth-input" id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
        <span className="mt-1 block text-xs font-normal text-muted">Use 12–128 characters with a lowercase letter, uppercase letter, number, and symbol.</span>
      </label>
      <p className="rounded-xl border border-line bg-white px-4 py-3 text-xs leading-5 text-muted">Every new account starts pending with no role. An administrator must approve the request before it can access company information.</p>
      <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Submitting request…" : "Request an account"}</button>
      <p className="pt-2 text-center text-sm text-muted">Already have access? <Link className="font-semibold text-navy underline decoration-teal decoration-2 underline-offset-4" href="/login">Sign in</Link></p>
    </form>
  );
}
