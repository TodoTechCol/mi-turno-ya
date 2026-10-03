import type { Database } from "./database.types";

// Row helpers
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Branch = Database["public"]["Tables"]["branches"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Professional = Database["public"]["Tables"]["professionals"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Schedule = Database["public"]["Tables"]["schedules"]["Row"];
export type ScheduleBlock = Database["public"]["Tables"]["schedule_blocks"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type OrganizationInvitation = Database["public"]["Tables"]["organization_invitations"]["Row"];

export type AppointmentStatus = Appointment["status"];

// Tipos compuestos para la UI
export type AppointmentWithDetails = Appointment & {
  professional: Pick<Professional, "id" | "name" | "avatar_url">;
  service: Pick<Service, "id" | "name" | "duration_minutes" | "price">;
};

export type ProfessionalWithServices = Professional & {
  services: Service[];
};

// Estado del wizard de reservas
export interface BookingState {
  step: number;
  organizationSlug: string;
  serviceId: string | null;
  professionalId: string | null;
  date: Date | null;
  time: string | null; // "HH:mm"
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
  no_show: "No se presentó",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-status-warning/10 text-status-warning",
  confirmed: "bg-status-info/10 text-status-info",
  completed: "bg-status-success/10 text-status-success",
  cancelled: "bg-pizarra-100 text-pizarra-600",
  no_show: "bg-status-danger/10 text-status-danger",
};

// Transiciones de estado válidas. Fuente única de verdad — se usa
// tanto en el cliente (para mostrar los botones disponibles) como en
// el servidor (para rechazar transiciones ilegales aunque alguien
// llame al API directamente sin pasar por la UI).
export const APPOINTMENT_NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
};
