"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Página a la que redirige el link de confirmación de email (generado con
 * admin.generateLink en /api/signup). Supabase entrega la sesión como
 * fragmento de la URL (#access_token=...&refresh_token=...) — el cliente de
 * @supabase/ssr fuerza flowType "pkce" (busca un ?code=), así que la
 * detección automática (detectSessionInUrl) NUNCA agarra este formato.
 * Por eso acá se parsea el hash a mano y se llama setSession()
 * explícitamente, que sí persiste la sesión en cookies sin importar el
 * flowType configurado.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function run() {
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        // Puede que ya haya una sesión válida (ej. navegación repetida al link)
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (session) {
          router.replace("/dashboard");
          router.refresh();
        } else {
          setStatus("error");
        }
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (!active) return;
      if (error) {
        setStatus("error");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    }

    run();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pizarra-50 px-4">
      <div className="w-full max-w-sm text-center bg-white rounded-2xl shadow-sm border border-pizarra-100 p-8">
        {status === "loading" ? (
          <>
            <div className="w-10 h-10 border-2 border-lila-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-pizarra-500">Confirmando tu cuenta...</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-pizarra-900 mb-2">No pudimos confirmar el link</h1>
            <p className="text-sm text-pizarra-500 mb-6">
              Puede que ya haya sido usado o que haya vencido. Iniciá sesión directamente o pedí uno nuevo.
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-4 py-2 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors"
            >
              Ir a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
