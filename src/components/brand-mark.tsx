import { Building2 } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-xl bg-teal text-navy shadow-sm">
        <Building2 aria-hidden="true" size={21} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-[0.14em] text-navy">RCC</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Engineering Portal</span>
        </span>
      )}
    </span>
  );
}
