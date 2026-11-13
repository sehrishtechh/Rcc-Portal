"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/lib/auth/actions";
import { AuthMessage } from "./auth-message";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="space-y-5">
      <AuthMessage error={state.error} message={state.message} />
      <label className="block text-sm font-medium text-navy" htmlFor="email">
        Work email
        <input className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal focus:ring-4 focus:ring-teal/15" id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
      </label>
      <label className="block text-sm font-medium text-navy" htmlFor="password">
        Password
        <input className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal focus:ring-4 focus:ring-teal/15" id="password" name="password" type="password" autoComplete="current-password" required />
      </label>
      <div className="flex justify-end">
        <Link className="text-sm font-semibold text-navy underline decoration-teal decoration-2 underline-offset-4 hover:text-teal" href="/forgot-password">Forgot password?</Link>
      </div>
      <button className="flex w-full items-center justify-center rounded-xl bg-navy px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#203650] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal/35 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="pt-2 text-center text-sm text-muted">New to RCC Portal? <Link className="font-semibold text-navy underline decoration-teal decoration-2 underline-offset-4" href="/register">Request an account</Link></p>
    </form>
  );
}
