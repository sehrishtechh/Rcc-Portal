import Link from "next/link";

export default function AccountSuspendedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-line bg-white p-8 text-center shadow-sm sm:p-10">
        <h1 className="text-2xl font-semibold text-navy">Account access is paused</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Contact an organization administrator to review your account access.</p>
        <Link className="mt-7 inline-flex rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white" href="/">Return to portal home</Link>
      </section>
    </main>
  );
}
