"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Logo from "@/components/shared/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.code === "email_not_confirmed") {
        toast.error("Todavía no confirmaste tu email. Revisá tu bandeja de entrada.");
      } else {
        toast.error("Email o contraseña incorrectos");
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel de marca — oculto en mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-pizarra-950 items-center justify-center overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-lila-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-lila-400/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex flex-col items-center text-center px-10"
        >
          <div className="w-28 h-28 bg-white rounded-3xl p-4 mb-6 shadow-[0_0_40px_rgba(124,102,220,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mi-turno-ya-icon.png" alt="Mi Turno Ya" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white mb-2">Tu tiempo manda.</h2>
          <p className="text-pizarra-400 text-sm max-w-xs">
            Te agendás, te recuerdan y te atienden sin esperar.
          </p>
        </motion.div>
      </div>

      {/* Panel de formulario */}
      <div className="flex-1 flex items-center justify-center bg-pizarra-50 px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo compacto — solo visible en mobile */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex lg:hidden flex-col items-center mb-8"
          >
            <Logo iconClassName="w-14 h-14" textClassName="text-xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
            className="mb-6"
          >
            <h1 className="text-xl font-semibold text-pizarra-900">Bienvenido de nuevo</h1>
            <p className="text-sm text-pizarra-500 mt-1">
              Ingresá para gestionar los turnos de tu negocio.
            </p>
          </motion.div>

          {/* Formulario */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
            onSubmit={handleLogin}
            className="bg-white rounded-2xl shadow-sm border border-pizarra-100 p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-pizarra-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pizarra-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </motion.button>
          </motion.form>

          <p className="text-center text-sm text-pizarra-500 mt-6">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/signup" className="text-lila-600 font-medium hover:underline">
              Creá tu negocio
            </Link>
          </p>

          <p className="text-center text-xs text-pizarra-400 mt-4 lg:hidden">
            Tu tiempo manda.
          </p>
        </div>
      </div>
    </div>
  );
}
