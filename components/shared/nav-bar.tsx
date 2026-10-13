"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CalendarDays, Tag, Users, Clock, MapPin, Store, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import LogoutButton from "./logout-button";

interface Props {
  userEmail: string;
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

const professionalOnlyLinks = [
  { href: "/dashboard/my-schedule", label: "Mi horario", icon: Clock },
];

export default function NavBar({ userEmail, role }: Props) {
  const pathname = usePathname();
  const links =
    role === "organization_admin" ? [...baseLinks, ...adminOnlyLinks] : [...baseLinks, ...professionalOnlyLinks];

  return (
    <header className="bg-white border-b border-pizarra-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        {/* Brand */}
        <Link href="/dashboard" className="shrink-0">
          <Logo iconClassName="h-9 w-9" textClassName="text-lg hidden sm:inline whitespace-nowrap" />
        </Link>

        {/* Nav links */}
        <nav className="flex flex-wrap gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
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

        {/* User + logout */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-pizarra-400 hidden sm:block truncate max-w-[180px]">{userEmail}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
