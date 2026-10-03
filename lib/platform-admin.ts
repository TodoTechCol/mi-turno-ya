import { createClient } from "@/lib/supabase/server";

/**
 * Verifica que el usuario autenticado actual sea platform_admin.
 * Devuelve su user_id si lo es, o null si no está logueado o no tiene
 * ese rol — pensado para los API routes de /api/admin/*, que no pasan
 * por el layout de /super-admin (que hace esta misma verificación para
 * las páginas).
 */
export async function requirePlatformAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return admin ? user.id : null;
}
