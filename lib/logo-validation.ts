// Reglas de validación del logo, compartidas entre cliente (feedback
// inmediato) y servidor (nunca confiar solo en la validación del
// cliente). Separado de services/storage.service.ts porque ese
// archivo importa el admin client y no puede entrar a un bundle de
// cliente.
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_ALLOWED_TYPES = ["image/png", "image/jpeg"];

export function validateLogoFile(file: File): string | null {
  if (!LOGO_ALLOWED_TYPES.includes(file.type)) {
    return "El logo debe ser una imagen PNG o JPG";
  }
  if (file.size > LOGO_MAX_BYTES) {
    return "El logo no puede superar los 2 MB";
  }
  return null;
}
