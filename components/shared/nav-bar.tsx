"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, CalendarDays, Tag, Users, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
];

export default function NavBar({ userEmail, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const links = role === "organization_admin" ? [...baseLinks, ...adminOnlyLinks] : baseLinks;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-todotech.png"
            alt="Todo Tech"
            className="h-11 w-11 rounded-lg object-cover"
          />
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
                  ? "bg-cyan-50 text-cyan-600"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
