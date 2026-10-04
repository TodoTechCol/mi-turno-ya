import { fromZonedTime } from "date-fns-tz";
import { addDays } from "date-fns";

/**
 * Convierte "medianoche a medianoche" de una fecha (YYYY-MM-DD) EN LA ZONA
 * HORARIA de la organización a los límites UTC reales que corresponden.
 * Antes esto se calculaba como UTC fijo (`${dateStr}T00:00:00Z`), lo cual
 * corre "el día" varias horas para cualquier organización fuera de UTC.
 */
export function getDayBoundsUTC(dateStr: string, timezone: string) {
  return {
    start: fromZonedTime(`${dateStr}T00:00:00.000`, timezone).toISOString(),
    end: fromZonedTime(`${dateStr}T23:59:59.999`, timezone).toISOString(),
  };
}

/**
 * Límites UTC de una semana completa (lunes a domingo) en la zona
 * horaria de la organización, a partir de la fecha del lunes.
 */
export function getWeekBoundsUTC(mondayDateStr: string, timezone: string) {
  const sunday = addDays(new Date(`${mondayDateStr}T00:00:00`), 6);
  const sundayStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(
    sunday.getDate()
  ).padStart(2, "0")}`;

  return {
    start: fromZonedTime(`${mondayDateStr}T00:00:00.000`, timezone).toISOString(),
    end: fromZonedTime(`${sundayStr}T23:59:59.999`, timezone).toISOString(),
  };
}
