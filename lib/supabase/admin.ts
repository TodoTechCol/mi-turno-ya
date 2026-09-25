import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Cliente con la service role key — bypassea RLS por completo.
 *
 * SOLO para usar desde código server-side de confianza (API routes,
 * services) para operaciones puntuales que necesitan leer/escribir
 * más allá de lo que un usuario anónimo o logueado debería poder
 * hacer directamente (ej: deduplicar clientes por teléfono al
 * reservar). NUNCA importar desde un componente cliente ("use client")
 * ni exponer su resultado directamente a un request público.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
