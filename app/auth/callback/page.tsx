"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Página a la que redirige el link de confirmación de email (generado con
 * admin.generateLink en /api/signup). Supabase entrega la sesión como
 * fragmento de la URL (#access_token=...), no como query param — por eso
 * esto corre client-side: el SDK del browser (detectSessionInUrl) la
 * detecta solo al montar y la persiste en cookies para que el resto de la
 * app (server-side) ya la vea logueada.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      // El listener puede tardar un instante en procesar el hash de la URL.
      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (newSession) {
          router.replace("/dashboard");
          router.refresh();
        }
      });

      const timeout = setTimeout(() => {
        if (active) setStatus("error");
      }, 5000);

      return () => {
        sub.subscription.unsubscribe();
        clearTimeout(timeout);
      };
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {status === "loading" ? (
          <>
            <div className="w-10 h-10 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Confirmando tu cuenta...</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">No pudimos confirmar el link</h1>
            <p className="text-sm text-gray-500 mb-6">
              Puede que ya haya sido usado o que haya vencido. Iniciá sesión directamente o pedí uno nuevo.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Ir a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
