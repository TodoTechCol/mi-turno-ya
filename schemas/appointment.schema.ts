import { z } from "zod";

export const createAppointmentSchema = z.object({
  organization_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  service_id: z.string().uuid(),
  branch_id: z.string().uuid().optional(),
  client_name: z.string().min(2).max(100),
  client_phone: z.string().min(8).max(20),
  client_email: z.string().email().optional().or(z.literal("")),
  start_datetime: z.string().datetime({ offset: true }),
  notes: z.string().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  appointment_id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

// Turno cargado a mano por el organization_admin (walk-in) — a
// diferencia de createAppointmentSchema, no lleva organization_id: lo
// resuelve el server desde la sesión, nunca el cliente.
export const manualAppointmentSchema = z.object({
  professional_id: z.string().uuid(),
  service_id: z.string().uuid(),
  branch_id: z.string().uuid().optional(),
  client_name: z.string().min(2).max(100),
  client_phone: z.string().min(8).max(20),
  client_email: z.string().email().optional().or(z.literal("")),
  start_datetime: z.string().datetime({ offset: true }),
  notes: z.string().max(500).optional(),
});

export type ManualAppointmentInput = z.infer<typeof manualAppointmentSchema>;

export const adminRescheduleSchema = z.object({
  start_datetime: z.string().datetime({ offset: true }),
});
