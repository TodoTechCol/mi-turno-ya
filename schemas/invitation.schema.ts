import { z } from "zod";

export const inviteProfessionalSchema = z.object({
  professional_id: z.string().uuid(),
  email: z.string().email("Ingresá un email válido"),
});

export type InviteProfessionalInput = z.infer<typeof inviteProfessionalSchema>;

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>;

// Lo que efectivamente viaja a la API (sin confirm_password)
export const acceptInvitationApiSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});
