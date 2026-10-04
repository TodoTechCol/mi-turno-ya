import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDayBoundsUTC } from "@/lib/timezone";
import type { Schedule, ScheduleBlock } from "@/types/app.types";

export async function getScheduleForDay(
  professionalId: string,
  dayOfWeek: number // 0=Domingo, 1=Lunes ... 6=Sábado
): Promise<Schedule | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_get_schedule", {
    p_professional_id: professionalId,
    p_day_of_week: dayOfWeek,
  });

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function getScheduleBlocksForDay(
  professionalId: string,
  dateStr: string, // "YYYY-MM-DD"
  timezone: string
): Promise<ScheduleBlock[]> {
  const supabase = await createClient();
  const { start, end } = getDayBoundsUTC(dateStr, timezone);

  const { data, error } = await supabase.rpc("public_list_schedule_blocks", {
    p_professional_id: professionalId,
    p_range_start: start,
    p_range_end: end,
  });

  if (error || !data) return [];
  return data;
}

/**
 * Gestión del organization_admin sobre el horario semanal de un
 * profesional — cliente autenticado normal, schedules_admin_write
 * es la que autoriza.
 */
export async function getSchedulesForProfessional(professionalId: string): Promise<Schedule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("professional_id", professionalId);

  if (error || !data) return [];
  return data;
}

/**
 * Horario semanal + próximos bloqueos de UN profesional puntual, para
 * que él mismo los vea desde "Mi horario" en su propio panel. Via
 * service role porque, a propósito, no existe ninguna policy que deje
 * a un professional leer `schedules`/`schedule_blocks` directamente
 * (las únicas lecturas públicas de esas tablas son las RPC acotadas de
 * Fase 6, pensadas para la reserva anónima, no para esto) — quien
 * llama ya validó antes que professionalId es el suyo propio.
 */
export async function getOwnWeekSchedule(professionalId: string): Promise<Schedule[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("schedules")
    .select("*")
    .eq("professional_id", professionalId);

  if (error || !data) return [];
  return data;
}

export async function getOwnUpcomingBlocks(professionalId: string): Promise<ScheduleBlock[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("schedule_blocks")
    .select("*")
    .eq("professional_id", professionalId)
    .gte("end_datetime", new Date().toISOString())
    .order("start_datetime", { ascending: true })
    .limit(10);

  if (error || !data) return [];
  return data;
}

export async function saveWeekSchedule(
  organizationId: string,
  professionalId: string,
  days: { day_of_week: number; is_active: boolean; start_time: string; end_time: string }[]
): Promise<boolean> {
  const supabase = await createClient();

  const rows = days.map((d) => ({
    organization_id: organizationId,
    professional_id: professionalId,
    day_of_week: d.day_of_week,
    start_time: d.start_time,
    end_time: d.end_time,
    is_active: d.is_active,
  }));

  const { error } = await supabase
    .from("schedules")
    .upsert(rows, { onConflict: "professional_id,day_of_week" });

  return !error;
}
