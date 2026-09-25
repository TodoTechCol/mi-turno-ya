"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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
      toast.error("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel de marca — oculto en mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 items-center justify-center overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex flex-col items-center text-center px-10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-todotech.png"
            alt="Todo Tech"
            className="w-32 h-32 rounded-3xl object-cover mb-6 shadow-[0_0_40px_rgba(34,211,238,0.25)]"
          />
          <p className="text-gray-400 text-sm max-w-xs">
            Tecnología que resuelve. Innova. Conecta.
          </p>
        </motion.div>
      </div>

      {/* Panel de formulario */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo compacto — solo visible en mobile */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex lg:hidden flex-col items-center mb-8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-todotech.png"
              alt="Todo Tech"
              className="w-20 h-20 rounded-2xl object-cover mb-3"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
            className="mb-6"
          >
            <h1 className="text-xl font-semibold text-gray-900">Bienvenido de nuevo</h1>
            <p className="text-sm text-gray-500 mt-1">
              Ingresá para gestionar los turnos de tu negocio.
            </p>
          </motion.div>

          {/* Formulario */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
            onSubmit={handleLogin}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </motion.button>
          </motion.form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/signup" className="text-cyan-600 font-medium hover:underline">
              Creá tu negocio
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4 lg:hidden">
            Panel de profesionales · Todo Tech
          </p>
        </div>
      </div>
    </div>
  );
}
