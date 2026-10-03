// Templates de email — HTML plano con estilos inline (los clientes de
// correo no soportan <style> externo ni la mayoría de utilidades de
// Tailwind), pensados para que se vean bien tanto en claro como oscuro.

const wrapper = (bodyHtml: string) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 32px 16px;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #f3f4f6;">
    <div style="background-color: #0F172A; padding: 24px; text-align: center;">
      <span style="color: #9C8BE6; font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">Mi turno ya</span>
    </div>
    <div style="padding: 28px 24px;">
      ${bodyHtml}
    </div>
    <div style="padding: 16px 24px; border-top: 1px solid #f3f4f6;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">Mi Turno Ya — gestión de turnos para tu negocio.</p>
    </div>
  </div>
</div>`;

export function emailConfirmationEmail(params: { businessName: string; confirmUrl: string }) {
  const { businessName, confirmUrl } = params;
  return {
    subject: "Confirmá tu email para activar tu cuenta",
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">¡Ya casi!</h1>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Creaste una cuenta para <strong>${businessName}</strong> en Mi Turno Ya. Confirmá tu email para activarla y empezar a gestionar tus turnos.
      </p>
      <a href="${confirmUrl}" style="display: inline-block; background-color: #6A53CF; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 20px; border-radius: 8px;">
        Confirmar mi email
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
        Si no creaste esta cuenta, podés ignorar este correo.
      </p>
    `),
  };
}

export function invitationEmail(params: {
  organizationName: string;
  acceptUrl: string;
  invitedByEmail: string;
}) {
  const { organizationName, acceptUrl, invitedByEmail } = params;
  return {
    subject: `Te invitaron a sumarte a ${organizationName} en Mi Turno Ya`,
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Te invitaron a unirte</h1>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        <strong>${invitedByEmail}</strong> te invitó a formar parte del equipo de
        <strong>${organizationName}</strong> en Mi Turno Ya. Vas a poder ver y gestionar tus propios turnos desde tu panel.
      </p>
      <a href="${acceptUrl}" style="display: inline-block; background-color: #6A53CF; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 20px; border-radius: 8px;">
        Crear mi contraseña y activar acceso
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
        Este link vence en 7 días. Si no esperabas esta invitación, podés ignorar este correo.
      </p>
    `),
  };
}

export function appointmentConfirmationEmail(params: {
  clientName: string;
  organizationName: string;
  professionalName: string;
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
}) {
  const { clientName, organizationName, professionalName, serviceName, dateLabel, timeLabel } = params;
  return {
    subject: `Turno confirmado en ${organizationName}`,
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">¡Listo, ${clientName}!</h1>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Tu turno en <strong>${organizationName}</strong> quedó registrado.
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #9ca3af;">Servicio</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Profesional</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${professionalName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Fecha</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${dateLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Hora</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${timeLabel}</td>
        </tr>
      </table>
      <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
        Si necesitás cancelar o reprogramar, contactá directamente al negocio.
      </p>
    `),
  };
}

export function newAppointmentAdminNotificationEmail(params: {
  organizationName: string;
  clientName: string;
  clientPhone: string;
  professionalName: string;
  serviceName: string;
  dateLabel: string;
  timeLabel: string;
}) {
  const { organizationName, clientName, clientPhone, professionalName, serviceName, dateLabel, timeLabel } = params;
  return {
    subject: `Nuevo turno en ${organizationName}: ${clientName}`,
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Nuevo turno reservado</h1>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #9ca3af;">Cliente</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${clientName} (${clientPhone})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Servicio</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Profesional</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${professionalName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Cuándo</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${dateLabel} · ${timeLabel}</td>
        </tr>
      </table>
    `),
  };
}
