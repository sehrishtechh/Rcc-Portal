import Link from "next/link";
import { ArrowRight, ClipboardCheck, FileCheck2, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

const capabilities = [
  { icon: ClipboardCheck, title: "Inspection to evidence", text: "Keep site observations and photo evidence attached to the right project." },
  { icon: FileCheck2, title: "Reports with review", text: "Move report drafts through technical QA and a separate final approval." },
  { icon: ShieldCheck, title: "Access by assignment", text: "Give each employee the records their work requires, protected by database policies." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <BrandMark />
        <div className="flex items-center gap-3">
          <Link className="hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-navy hover:bg-background sm:inline-flex" href="/login">Sign in</Link>
          <Link className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#203650]" href="/register">Request access <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-12 lg:pb-28 lg:pt-24">
        <div className="absolute -right-24 top-8 hidden size-[34rem] rounded-full bg-teal/10 blur-3xl lg:block" />
        <div className="relative max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-navy"><span className="size-1.5 rounded-full bg-teal" /> Engineering operations</p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-navy sm:text-6xl lg:text-7xl">Every project.<br /><span className="text-[#168f8b]">One clear view.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">RCC Portal brings inspections, evidence, report reviews, and specialist assignments into one secure engineering workspace.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203650]" href="/register">Request employee access <ArrowRight size={16} aria-hidden="true" /></Link>
            <Link className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-6 py-3.5 text-sm font-semibold text-navy transition hover:bg-background" href="/login">Sign in to your account</Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-muted">Employee access is approved by an RCC administrator. Public registration never grants a role.</p>
        </div>

        <div className="relative rounded-3xl border border-line bg-background p-4 shadow-[0_24px_80px_-40px_rgba(20,36,58,0.35)] sm:p-6">
          <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-line pb-5">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Project delivery</p><p className="mt-1 text-lg font-semibold text-navy">Connected workflow</p></div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal/15 text-[#148d89]"><ClipboardCheck size={21} aria-hidden="true" /></span>
            </div>
            <div className="space-y-3 pt-5">
              {[
                ["01", "Schedule inspection", "Assigned to inspector"],
                ["02", "Record site evidence", "Observations and photos"],
                ["03", "Prepare report", "Writer works from submitted evidence"],
                ["04", "Review and approve", "QA and final approval are separate"],
              ].map(([number, title, detail], index) => (
                <div className="flex items-center gap-4 rounded-xl border border-line/80 px-4 py-3.5" key={number}>
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${index < 2 ? "bg-teal/15 text-[#148d89]" : "bg-background text-muted"}`}>{number}</span>
                  <div><p className="text-sm font-semibold text-navy">{title}</p><p className="mt-0.5 text-xs text-muted">{detail}</p></div>
                  {index < 2 && <span className="ml-auto size-2 rounded-full bg-teal" aria-label="Foundation workflow" />}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-navy px-4 py-4 text-white">
              <p className="text-xs font-medium text-white/60">Access model</p>
              <p className="mt-1 text-sm font-medium">Organization data · project membership · task permissions</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-background/70">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#168f8b]">Built around the work</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl">From the site visit to the signed-off report.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, text }) => (
              <article className="rounded-2xl border border-line bg-white p-6" key={title}>
                <span className="flex size-11 items-center justify-center rounded-xl bg-teal/15 text-[#148d89]"><Icon size={21} aria-hidden="true" /></span>
                <h3 className="mt-5 text-base font-semibold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <BrandMark compact />
        <p>RCC Portal · Internal engineering operations</p>
      </footer>
    </main>
  );
}
