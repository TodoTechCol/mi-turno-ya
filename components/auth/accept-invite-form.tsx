"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { acceptInvitationSchema, type AcceptInvitationFormValues } from "@/schemas/invitation.schema";
import { toast } from "sonner";

interface Props {
  token: string;
  email: string;
}

export default function AcceptInviteForm({ token, email }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: AcceptInvitationFormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token, password: data.password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo activar tu acceso");
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });

      if (signInError) {
        toast.error("Cuenta activada, pero no se pudo iniciar sesión automáticamente. Ingresá manualmente.");
        router.push("/auth/login");
        return;
      }

      toast.success("¡Listo! Ya tenés acceso a tu panel.");
      router.push("/dashboard");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo activar tu acceso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl shadow-sm border border-pizarra-100 p-6 space-y-4"
    >
      <input type="hidden" {...register("token")} />

      <div>
        <label className="block text-sm font-medium text-pizarra-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm bg-pizarra-50 text-pizarra-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-pizarra-700 mb-1">Contraseña</label>
        <input
          type="password"
          {...register("password")}
          className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-pizarra-700 mb-1">Confirmar contraseña</label>
        <input
          type="password"
          {...register("confirm_password")}
          className="w-full px-3 py-2.5 border border-pizarra-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lila-500 focus:border-transparent"
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
        className="w-full py-2.5 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Activando..." : "Activar mi acceso"}
      </motion.button>
    </motion.form>
  );
}
