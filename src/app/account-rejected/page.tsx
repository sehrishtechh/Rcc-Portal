import Link from "next/link";
import { Mail } from "lucide-react";

export default function AccountRejectedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-line bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-background text-muted"><Mail size={24} aria-hidden="true" /></span>
        <h1 className="mt-6 text-2xl font-semibold text-navy">Account request not approved</h1>
        <p className="mt-3 text-sm leading-6 text-muted">This account does not have access to RCC Portal. Contact an administrator if you think this is a mistake.</p>
        <Link className="mt-7 inline-flex rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white" href="/">Return to portal home</Link>
      </section>
    </main>
  );
}
