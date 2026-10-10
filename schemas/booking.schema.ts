import { z } from "zod";

export const clientFormSchema = z.object({
  client_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  client_phone: z
    .string()
    .min(8, "Ingresá un teléfono válido")
    .max(20, "El teléfono es demasiado largo")
    .regex(/^[\d\s\+\-\(\)]+$/, "Solo se permiten números y símbolos de teléfono"),
  client_email: z
    .string()
    .email("Ingresá un email válido")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500, "Las notas no pueden superar 500 caracteres").optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const availabilityQuerySchema = z.object({
  professional_id: z.string().uuid(),
  service_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  // Al reprogramar, excluye el propio turno de la cuenta de horarios
  // ocupados — si no, el cliente vería su propio horario actual como
  // "ocupado" y no podría reprogramar dentro de su mismo día.
  exclude_appointment_id: z.string().uuid().optional(),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
