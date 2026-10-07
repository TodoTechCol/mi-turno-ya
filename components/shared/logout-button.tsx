"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  className?: string;
}

export default function LogoutButton({ className }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      title="Cerrar sesión"
      className={
        className ??
        "p-1.5 rounded-lg text-pizarra-400 hover:text-status-danger hover:bg-status-danger/10 transition-colors"
      }
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
