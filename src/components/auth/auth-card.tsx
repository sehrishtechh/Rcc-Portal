import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export function AuthCard({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
      <section className="relative hidden overflow-hidden bg-navy px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-40 -top-32 size-[34rem] rounded-full border border-white/10" />
        <div className="absolute -right-24 -top-16 size-[24rem] rounded-full border border-white/10" />
        <BrandMark />
        <div className="relative max-w-xl pb-12">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-teal">Structural engineering operations</p>
          <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight">Clear delivery.<br />Confident decisions.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">A secure workspace for inspections, technical reviews, reports and project delivery.</p>
        </div>
        <p className="text-xs text-white/45">RCC Portal · Internal engineering workspace</p>
      </section>
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-navy">
            <ArrowLeft size={16} aria-hidden="true" /> Back to RCC Portal
          </Link>
          <div className="mb-8 lg:hidden"><BrandMark /></div>
          <h2 className="text-3xl font-semibold tracking-tight text-navy">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
