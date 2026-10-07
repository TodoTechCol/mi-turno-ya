"use client";

import { Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Logo from "@/components/shared/logo";

interface Props {
  organizationName: string;
}

/**
 * Pantalla que ve cualquier miembro (admin o profesional) de una
 * organización todavía no aprobada por un platform_admin. Reemplaza
 * por completo el dashboard normal — no muestra NavBar con links que
 * de todos modos estarían bloqueados por RLS.
 */
export default function PendingApproval({ organizationName }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pizarra-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo iconClassName="w-12 h-12" showText={false} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-pizarra-100 p-8">
          <div className="w-12 h-12 rounded-full bg-status-warning/10 flex items-center justify-center mx-auto mb-4">
            <Clock3 className="w-5 h-5 text-status-warning" />
          </div>
          <h1 className="text-lg font-semibold text-pizarra-900 mb-2">Cuenta en revisión</h1>
          <p className="text-sm text-pizarra-500">
            <strong>{organizationName}</strong> todavía no fue aprobada. Nuestro equipo revisa cada
            negocio nuevo antes de activarlo — te avisamos por email apenas esté listo.
          </p>
          <button
            onClick={handleLogout}
            className="mt-6 text-sm font-medium text-lila-600 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
