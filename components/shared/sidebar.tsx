"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  CalendarDays,
  Tag,
  Users,
  Clock,
  MapPin,
  Store,
  BarChart3,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Logo from "./logo";

interface Props {
  organizationName: string;
  role: "organization_admin" | "professional";
}

const baseLinks = [
  { href: "/dashboard", label: "Hoy", icon: Calendar },
  { href: "/dashboard/appointments", label: "Todos", icon: CalendarDays },
  { href: "/dashboard/reports", label: "Reportes", icon: BarChart3 },
];

const adminOnlyLinks = [
  { href: "/dashboard/services", label: "Servicios", icon: Tag },
  { href: "/dashboard/professionals", label: "Profesionales", icon: Users },
  { href: "/dashboard/branches", label: "Sedes", icon: MapPin },
  { href: "/dashboard/business", label: "Mi negocio", icon: Store },
];

const professionalOnlyLinks = [{ href: "/dashboard/my-schedule", label: "Mi horario", icon: Clock }];

export default function Sidebar({ organizationName, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links =
    role === "organization_admin" ? [...baseLinks, ...adminOnlyLinks] : [...baseLinks, ...professionalOnlyLinks];
  const roleLabel = role === "organization_admin" ? "Administrador" : "Profesional";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const content = (
    <>
      <Link href="/dashboard" className="flex items-center px-5 py-5 shrink-0" onClick={() => setOpen(false)}>
        <Logo iconClassName="h-9 w-9" textClassName="text-lg" />
      </Link>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-lila-50 text-lila-600"
                : "text-pizarra-500 hover:text-pizarra-900 hover:bg-pizarra-50"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-pizarra-100 p-4 shrink-0">
        <div className="flex items-center gap-2.5 px-1 mb-3">
          <div className="w-8 h-8 rounded-full bg-lila-50 flex items-center justify-center shrink-0">
            <span className="text-lila-600 font-semibold text-xs">{getInitials(organizationName || "?")}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-pizarra-900 truncate">{organizationName}</p>
            <p className="text-xs text-pizarra-400">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-pizarra-500 hover:text-status-danger hover:bg-status-danger/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Barra superior — solo mobile, da acceso al panel lateral */}
      <header className="md:hidden sticky top-0 z-20 bg-white border-b border-pizarra-100 flex items-center justify-between px-4 h-14">
        <Link href="/dashboard">
          <Logo iconClassName="h-8 w-8" showText={false} />
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-pizarra-500 hover:text-pizarra-900"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Panel lateral fijo — desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:h-screen md:sticky md:top-0 bg-white border-r border-pizarra-100">
        {content}
      </aside>

      {/* Panel lateral deslizable — mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-end px-3 pt-3 shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-pizarra-400 hover:text-pizarra-900"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
