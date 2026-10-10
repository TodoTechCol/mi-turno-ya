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
        Creaste una cuenta para <strong>${businessName}</strong> en Mi Turno Ya. Confirmá tu email para activarla — después, nuestro equipo revisa el negocio y te avisa por correo apenas quede aprobado.
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

export function pendingOrganizationEmail(params: { organizationName: string; reviewUrl: string }) {
  const { organizationName, reviewUrl } = params;
  return {
    subject: `Nueva organización pendiente de aprobación: ${organizationName}`,
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Hay un negocio nuevo esperando revisión</h1>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        <strong>${organizationName}</strong> se acaba de registrar en Mi Turno Ya y está pendiente de aprobación.
      </p>
      <a href="${reviewUrl}" style="display: inline-block; background-color: #6A53CF; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 20px; border-radius: 8px;">
        Revisar en el panel
      </a>
    `),
  };
}

export function organizationApprovedEmail(params: { organizationName: string; appUrl: string }) {
  const { organizationName, appUrl } = params;
  return {
    subject: "¡Tu cuenta fue aprobada!",
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Ya podés empezar</h1>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Revisamos <strong>${organizationName}</strong> y quedó aprobada. Ya podés entrar a tu panel y gestionar tus turnos.
      </p>
      <a href="${appUrl}/auth/login" style="display: inline-block; background-color: #6A53CF; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 20px; border-radius: 8px;">
        Ir a mi panel
      </a>
    `),
  };
}

export function passwordResetEmail(params: { resetUrl: string }) {
  const { resetUrl } = params;
  return {
    subject: "Restablecé tu contraseña — Mi Turno Ya",
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Restablecer contraseña</h1>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Un administrador de Mi Turno Ya inició un restablecimiento de contraseña para tu cuenta. Si lo pediste vos, hacé click abajo para elegir una nueva.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #6A53CF; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 20px; border-radius: 8px;">
        Elegir nueva contraseña
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
        Si no esperabas este correo, podés ignorarlo — tu contraseña actual sigue funcionando.
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
  servicePrice: number;
  serviceDuration: number;
  dateLabel: string;
  timeLabel: string;
  address: string | null;
  manageUrl: string;
  icsUrl: string;
  googleCalendarUrl: string;
  whatsappUrl: string | null;
}) {
  const {
    clientName,
    organizationName,
    professionalName,
    serviceName,
    servicePrice,
    serviceDuration,
    dateLabel,
    timeLabel,
    address,
    manageUrl,
    icsUrl,
    googleCalendarUrl,
    whatsappUrl,
  } = params;

  const priceLabel = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(servicePrice);
  const durationLabel = serviceDuration < 60 ? `${serviceDuration} min` : `${Math.floor(serviceDuration / 60)}h ${serviceDuration % 60}min`;
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;

  return {
    subject: `Tu turno en ${organizationName} — ${dateLabel} ${timeLabel}`,
    html: wrapper(`
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; background-color: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px;">
          ● Reserva registrada
        </span>
      </div>

      <h1 style="color: #111827; font-size: 19px; margin: 0 0 8px; text-align: center;">¡Tu cita está asegurada, ${clientName}!</h1>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px; text-align: center;">
        Registramos tu reserva en <strong>${organizationName}</strong>. Acá tenés todos los detalles.
      </p>

      <div style="border: 1px solid #f3f4f6; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
        <div style="background-color: #0F172A; padding: 10px 16px;">
          <span style="color: #e2e8f0; font-size: 12px; font-weight: 700; letter-spacing: 0.02em;">FICHA DEL TURNO</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; padding: 4px;">
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af;">Servicio</td>
            <td style="padding: 10px 16px; color: #111827; font-weight: 600; text-align: right;">${serviceName} · ${durationLabel}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af; border-top: 1px solid #f3f4f6;">Profesional</td>
            <td style="padding: 10px 16px; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${professionalName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af; border-top: 1px solid #f3f4f6;">Fecha</td>
            <td style="padding: 10px 16px; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6; text-transform: capitalize;">${dateLabel}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af; border-top: 1px solid #f3f4f6;">Horario</td>
            <td style="padding: 10px 16px; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${timeLabel} hs</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; color: #9ca3af; border-top: 1px solid #f3f4f6;">Importe</td>
            <td style="padding: 10px 16px; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${priceLabel}</td>
          </tr>
        </table>
        ${
          address
            ? `<div style="padding: 10px 16px; border-top: 1px solid #f3f4f6; font-size: 13px; color: #6b7280;">
                 📍 ${address}
                 ${mapsUrl ? ` · <a href="${mapsUrl}" style="color: #6A53CF; text-decoration: none;">Ver en Google Maps</a>` : ""}
               </div>`
            : ""
        }
      </div>

      ${
        whatsappUrl
          ? `<div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
               <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 4px;">¿Tenés alguna consulta?</p>
               <p style="color: #6b7280; font-size: 13px; margin: 0 0 14px;">Comunicate directo por WhatsApp con el negocio.</p>
               <a href="${whatsappUrl}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px;">
                 Contactar por WhatsApp
               </a>
             </div>`
          : ""
      }

      <p style="color: #9ca3af; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; margin: 0 0 8px;">ACCIONES RÁPIDAS</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="padding-right: 6px; width: 50%;">
            <a href="${googleCalendarUrl}" style="display: block; text-align: center; border: 1px solid #e5e7eb; color: #374151; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px; border-radius: 8px;">
              Google Calendar
            </a>
          </td>
          <td style="padding-left: 6px; width: 50%;">
            <a href="${icsUrl}" style="display: block; text-align: center; border: 1px solid #e5e7eb; color: #374151; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px; border-radius: 8px;">
              Descargar .ICS
            </a>
          </td>
        </tr>
      </table>

      <div style="background-color: #f9fafb; border-radius: 10px; padding: 14px 16px; text-align: center; margin-bottom: 20px;">
        <span style="color: #6b7280; font-size: 13px;">¿Necesitás cambiar algo? </span>
        <a href="${manageUrl}" style="color: #6A53CF; text-decoration: none; font-size: 13px; font-weight: 600;">Reprogramar</a>
        <span style="color: #d1d5db;"> · </span>
        <a href="${manageUrl}" style="color: #dc2626; text-decoration: none; font-size: 13px; font-weight: 600;">Cancelar turno</a>
      </div>

      <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
        <p style="margin: 0 0 4px;">ℹ️ Recordatorios:</p>
        <ul style="margin: 0; padding-left: 18px;">
          <li>Llegá unos minutos antes para aprovechar toda la duración de tu turno.</li>
          <li>Podés reprogramar o cancelar cuando quieras desde los links de arriba.</li>
        </ul>
      </div>
    `),
  };
}

export function appointmentCancelledAdminNotificationEmail(params: {
  organizationName: string;
  clientName: string;
  serviceName: string;
  professionalName: string;
  dateLabel: string;
  timeLabel: string;
}) {
  const { organizationName, clientName, serviceName, professionalName, dateLabel, timeLabel } = params;
  return {
    subject: `Turno cancelado en ${organizationName}: ${clientName}`,
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">El cliente canceló su turno</h1>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #9ca3af;">Cliente</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${clientName}</td>
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
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Era para</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${dateLabel} · ${timeLabel}</td>
        </tr>
      </table>
      <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">Ese horario ya quedó libre en tu agenda.</p>
    `),
  };
}

export function appointmentRescheduledAdminNotificationEmail(params: {
  organizationName: string;
  clientName: string;
  serviceName: string;
  professionalName: string;
  oldDateLabel: string;
  oldTimeLabel: string;
  newDateLabel: string;
  newTimeLabel: string;
}) {
  const {
    organizationName,
    clientName,
    serviceName,
    professionalName,
    oldDateLabel,
    oldTimeLabel,
    newDateLabel,
    newTimeLabel,
  } = params;
  return {
    subject: `Turno reprogramado en ${organizationName}: ${clientName}`,
    html: wrapper(`
      <h1 style="color: #111827; font-size: 18px; margin: 0 0 12px;">El cliente reprogramó su turno</h1>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #9ca3af;">Cliente</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${clientName}</td>
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
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Antes</td>
          <td style="padding: 8px 0; color: #111827; text-decoration: line-through; text-align: right; border-top: 1px solid #f3f4f6;">${oldDateLabel} · ${oldTimeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #9ca3af; border-top: 1px solid #f3f4f6;">Ahora</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6;">${newDateLabel} · ${newTimeLabel}</td>
        </tr>
      </table>
      <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0;">
        El turno volvió a quedar "pendiente" — revisalo y confirmalo de nuevo desde tu panel.
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
