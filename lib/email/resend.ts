import { Resend } from "resend";

/**
 * Cliente de Resend para el envío de emails transaccionales (invitaciones
 * de equipo, confirmación de turno). Solo se usa server-side.
 *
 * Mientras no haya un dominio propio verificado en Resend, RESEND_FROM_EMAIL
 * puede apuntar a su dominio de pruebas (onboarding@resend.dev), que solo
 * entrega a la cuenta con la que se creó el API key — suficiente para
 * validar el flujo antes de salir a producción real.
 */
let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export function getEmailFrom(): string {
  return process.env.RESEND_FROM_EMAIL || "Mi Turno Ya <onboarding@resend.dev>";
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envío "best effort": si no hay API key configurada o el envío falla, se
 * loguea y se devuelve false, pero NUNCA se lanza — ninguna operación
 * principal (crear turno, invitar) debe fallar porque el email no salió.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<boolean> {
  const resend = getClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada — se omite el envío a", to);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Resend devolvió error al enviar a", to, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Falló el envío a", to, err);
    return false;
  }
}
