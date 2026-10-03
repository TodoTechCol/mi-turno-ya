"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Página del link de "restablecer contraseña" (generado con
 * admin.generateLink type: recovery). Mismo mecanismo que
 * /auth/callback para levantar la sesión del hash de la URL
 * (ver memoria del proyecto: @supabase/ssr fuerza flowType pkce y no
 * detecta el hash solo), pero acá en vez de mandar derecho al
 * dashboard se pide la contraseña nueva antes de dejar pasar.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        if (active) setStatus("error");
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (!active) return;
      setStatus(error ? "error" : "ready");
    }

    run();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast.error("No se pudo actualizar la contraseña");
      return;
    }

    toast.success("Contraseña actualizada");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pizarra-50 px-4">
      <div className="w-full max-w-sm">
        {status === "loading" && (
          <div className="bg-white rounded-2xl shadow-sm border border-pizarra-100 p-8 text-center">
            <div className="w-10 h-10 border-2 border-lila-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-pizarra-500">Verificando el link...</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white rounded-2xl shadow-sm border border-pizarra-100 p-8 text-center">
            <h1 className="text-lg font-semibold text-pizarra-900 mb-2">Link no válido</h1>
            <p className="text-sm text-pizarra-500">
              El link venció o ya fue usado. Pedí uno nuevo.
            </p>
          </div>
        )}

        {status === "ready" && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-pizarra-100 p-6 space-y-4"
          >
            <div className="text-center mb-2">
              <h1 className="text-xl font-display font-semibold text-pizarra-900">Nueva contraseña</h1>
              <p className="text-sm text-pizarra-500 mt-1">Elegí una contraseña nueva para tu cuenta.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-pizarra-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-lila-500/15 focus:border-lila-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pizarra-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-lila-500/15 focus:border-lila-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
