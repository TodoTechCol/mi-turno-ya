"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { signupSchema, type SignupFormValues } from "@/schemas/signup.schema";
import { toast } from "sonner";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: data.business_name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo crear la cuenta");
      }

      // La cuenta y la organización ya quedaron creadas, pero sin confirmar
      // todavía — recién con el link del email se activa el login.
      setSentTo(data.email);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel de marca — oculto en mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 items-center justify-center overflow-hidden">
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

          {sentTo ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-cyan-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-5 h-5 text-cyan-600" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 mb-2">Revisá tu correo</h1>
              <p className="text-sm text-gray-500">
                Te mandamos un link de confirmación a <strong>{sentTo}</strong>. Entrá a tu
                bandeja de entrada y confirmá tu cuenta para poder ingresar al panel.
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
                className="mb-6"
              >
                <h1 className="text-xl font-semibold text-gray-900">Creá tu cuenta</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Empezá a gestionar los turnos de tu negocio en minutos.
                </p>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del negocio
                  </label>
                  <input
                    {...register("business_name")}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Barbería El Maestro"
                  />
                  {errors.business_name && (
                    <p className="text-xs text-red-500 mt-1">{errors.business_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    {...register("confirm_password")}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  {errors.confirm_password && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </motion.button>
              </motion.form>

              <p className="text-center text-sm text-gray-500 mt-6">
                ¿Ya tenés cuenta?{" "}
                <Link href="/auth/login" className="text-cyan-600 font-medium hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
