function toGCalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildGoogleCalendarUrl(params: {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}): string {
  const { title, description, location, start, end } = params;
  const qs = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${qs.toString()}`;
}

/**
 * Link directo a WhatsApp con el negocio — null si no tiene teléfono
 * cargado (reusa organizations.phone, no hay un campo de WhatsApp
 * aparte). Normaliza a solo dígitos, que es lo único que wa.me acepta.
 */
export function buildWhatsAppUrl(phone: string | null, message: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
