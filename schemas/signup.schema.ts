import { z } from "zod";

export const signupSchema = z
  .object({
    business_name: z.string().min(2, "El nombre del negocio es muy corto").max(100),
    email: z.string().email("Ingresá un email válido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

// Lo que efectivamente viaja a la API (sin confirm_password)
export const signupApiSchema = z.object({
  business_name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});
