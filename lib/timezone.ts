import { fromZonedTime } from "date-fns-tz";

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
