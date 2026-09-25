import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  duration_minutes: z.coerce.number().int().positive("La duración debe ser mayor a 0"),
  price: z.coerce.number().nonnegative("El precio no puede ser negativo"),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

export const servicePatchSchema = serviceSchema.partial().extend({
  is_active: z.boolean().optional(),
});
