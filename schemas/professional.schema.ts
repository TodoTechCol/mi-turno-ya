import { z } from "zod";

export const professionalSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  bio: z.string().max(500).optional().or(z.literal("")),
});

export type ProfessionalFormValues = z.infer<typeof professionalSchema>;

export const professionalPatchSchema = professionalSchema.partial().extend({
  is_active: z.boolean().optional(),
});
