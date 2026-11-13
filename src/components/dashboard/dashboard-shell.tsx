import Link from "next/link";
import { Activity, ChevronDown, ClipboardList, FolderKanban, LayoutDashboard, UsersRound } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { signOut } from "@/lib/auth/actions";
import type { EmployeeProfile } from "@/lib/auth/dal";
import type { ReactNode } from "react";

function formatRole(role: EmployeeProfile["role"]) {
  if (!role) return "Employee";
  return role.split("_").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

export function DashboardShell({ profile, children }: { profile: EmployeeProfile; children: ReactNode }) {
  const initials = profile.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden border-r border-line bg-white lg:flex lg:flex-col">
        <div className="flex h-[76px] items-center border-b border-line px-6"><BrandMark /></div>
        <nav className="flex-1 px-4 py-6" aria-label="Main navigation">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-muted">Workspace</p>
          <Link className="mt-3 flex items-center gap-3 rounded-xl bg-navy px-3 py-3 text-sm font-semibold text-white" href="/dashboard" aria-current="page">
            <LayoutDashboard size={18} aria-hidden="true" /> Dashboard
          </Link>
          {profile.role === "admin" && <div className="mt-2 space-y-1">
            <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-background hover:text-navy" href="/clients"><UsersRound size={18} aria-hidden="true" /> Clients</Link>
            <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-background hover:text-navy" href="/projects"><FolderKanban size={18} aria-hidden="true" /> Projects</Link>
            <Link className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition hover:bg-background hover:text-navy" href="/employee-approvals"><ClipboardList size={18} aria-hidden="true" /> Employee approvals</Link>
          </div>}
          <div className="mt-8 border-t border-line px-3 pt-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted"><Activity size={15} aria-hidden="true" /> RCC Portal</div>
            <p className="mt-2 text-xs leading-5 text-muted">Access to each operation is verified by your assigned role and project permissions.</p>
          </div>
        </nav>
        <div className="border-t border-line px-6 py-5 text-xs leading-5 text-muted">Assigned work and activity will appear here as each operations module is enabled.</div>
      </aside>

      <div className="min-w-0">
        <header className="flex h-[76px] items-center justify-between border-b border-line bg-white px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3 lg:hidden"><BrandMark compact /><span className="text-xs font-bold uppercase tracking-[0.12em] text-navy">RCC Portal</span></div>
          <div className="hidden text-xs text-muted lg:block">Engineering operations <span className="mx-2 text-line">/</span> <span className="font-semibold text-navy">Dashboard</span></div>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <span className="hidden h-8 w-px bg-line sm:block" />
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-white" aria-hidden="true">{initials || "RC"}</span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-40 truncate text-sm font-semibold text-navy">{profile.full_name}</span>
                <span className="mt-0.5 block text-[11px] text-muted">{formatRole(profile.role)}</span>
              </span>
              <ChevronDown className="hidden text-muted sm:block" size={16} aria-hidden="true" />
            </div>
            <form action={signOut} className="hidden sm:block"><button className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-muted hover:bg-background hover:text-navy" type="submit">Sign out</button></form>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
