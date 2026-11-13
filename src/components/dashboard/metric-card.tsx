import type { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, hint, icon: Icon, tone = "navy" }: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone?: "navy" | "teal" | "amber";
}) {
  const styles = {
    navy: "bg-navy/5 text-navy",
    teal: "bg-teal/15 text-[#148d89]",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-[0_3px_16px_-14px_rgba(20,36,58,0.32)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-muted">{label}</p>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${styles}`}><Icon size={19} aria-hidden="true" /></span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-navy tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-1.5 text-xs text-muted">{hint}</p>
    </article>
  );
}
