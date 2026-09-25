import { createClient } from "@/lib/supabase/server";
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
