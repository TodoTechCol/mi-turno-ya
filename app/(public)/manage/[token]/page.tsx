import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { getAppointmentByToken } from "@/services/appointment-management.service";
import AppointmentManagePanel from "@/components/manage/appointment-manage-panel";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ManageAppointmentPage({ params }: Props) {
  const { token } = await params;
  const details = await getAppointmentByToken(token);

  if (!details) notFound();

  const { appointment, organization, professional, service, branch } = details;
  const start = new Date(appointment.start_datetime);
  const dateLabel = formatInTimeZone(start, organization.timezone, "EEEE d 'de' MMMM", { locale: es });
  const timeLabel = formatInTimeZone(start, organization.timezone, "HH:mm");

  return (
    <div className="min-h-screen bg-pizarra-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <AppointmentManagePanel
          token={token}
          appointmentId={appointment.id}
          organizationName={organization.name}
          organizationTimezone={organization.timezone}
          professionalName={professional.name}
          serviceName={service.name}
          serviceDuration={service.duration_minutes}
          servicePrice={service.price}
          professionalId={professional.id}
          serviceId={service.id}
          branchName={branch?.name ?? null}
          address={branch?.address || organization.address}
          initialStatus={appointment.status}
          initialStartISO={appointment.start_datetime}
          initialDateLabel={dateLabel}
          initialTimeLabel={timeLabel}
        />
      </div>
    </div>
  );
}
