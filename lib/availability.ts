import { addMinutes } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

export interface TimeSlot {
  time: string; // "HH:mm"
  available: boolean;
}

export interface WorkSchedule {
  start_time: string; // "HH:mm:ss"
  end_time: string;   // "HH:mm:ss"
}

export interface ExistingAppointment {
  start_datetime: string; // ISO string
  end_datetime: string;   // ISO string
}

export interface ScheduleBlock {
  start_datetime: string;
  end_datetime: string;
}

const SLOT_INTERVAL = 15; // minutos

/**
 * Genera todos los slots disponibles para un profesional en una fecha dada,
 * interpretando el horario laboral (schedule.start_time/end_time) en la
 * zona horaria de la organización — no en la del servidor.
 * Filtra en tres pasos:
 *  1. Horario laboral del día
 *  2. Citas existentes (status != cancelled)
 *  3. Bloques de ausencia (vacaciones, descanso, etc.)
 */
export function generateAvailableSlots(
  dateStr: string, // "YYYY-MM-DD"
  timezone: string,
  serviceDuration: number,
  schedule: WorkSchedule | null,
  appointments: ExistingAppointment[],
  blocks: ScheduleBlock[]
): TimeSlot[] {
  if (!schedule) return [];

  let workStart = fromZonedTime(`${dateStr}T${schedule.start_time}`, timezone);
  const workEnd = fromZonedTime(`${dateStr}T${schedule.end_time}`, timezone);

  const slots: TimeSlot[] = [];

  // Generar candidatos de inicio cada SLOT_INTERVAL minutos
  while (addMinutes(workStart, serviceDuration) <= workEnd) {
    const slotEnd = addMinutes(workStart, serviceDuration);

    // Verificar contra citas existentes
    const conflictsAppointment = appointments.some((apt) => {
      const aptStart = new Date(apt.start_datetime);
      const aptEnd = new Date(apt.end_datetime);
      return workStart < aptEnd && slotEnd > aptStart;
    });

    // Verificar contra bloques de ausencia
    const conflictsBlock = blocks.some((blk) => {
      const blkStart = new Date(blk.start_datetime);
      const blkEnd = new Date(blk.end_datetime);
      return workStart < blkEnd && slotEnd > blkStart;
    });

    const available = !conflictsAppointment && !conflictsBlock;

    slots.push({
      time: formatInTimeZone(workStart, timezone, "HH:mm"),
      available,
    });

    workStart = addMinutes(workStart, SLOT_INTERVAL);
  }

  return slots;
}
