import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  address: z.string().max(200).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  sector: z.string().max(100).optional().or(z.literal("")),
  opening_hours: z.string().max(200).optional().or(z.literal("")),
});

export type BranchFormValues = z.infer<typeof branchSchema>;

export const branchPatchSchema = branchSchema.partial().extend({
  is_active: z.boolean().optional(),
});
