// Genera el contenido de un archivo .ics mínimo (RFC 5545) para que el
// cliente pueda agregar el turno a Apple Calendar / Outlook / etc.
// Google Calendar se cubre aparte con un link directo (ver lib/calendar-links.ts).
function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICSText(text: string): string {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

export function buildAppointmentICS(params: {
  uid: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}): string {
  const { uid, title, description, location, start, end } = params;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mi Turno Ya//Reservas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}@miturnoya.org`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
    `LOCATION:${escapeICSText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
