"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CalendarDays, Tag, Users, Clock, MapPin } from "lucide-react";
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
];

const adminOnlyLinks = [
  { href: "/dashboard/services", label: "Servicios", icon: Tag },
  { href: "/dashboard/professionals", label: "Profesionales", icon: Users },
  { href: "/dashboard/branches", label: "Sedes", icon: MapPin },
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
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard">
          <Logo iconClassName="h-9 w-9" textClassName="text-lg hidden sm:inline" />
        </Link>

        {/* Nav links */}
        <nav className="flex gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-pizarra-400 hidden sm:block">{userEmail}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
