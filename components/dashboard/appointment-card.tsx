import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { User, Phone, Clock } from "lucide-react";
import type { AppointmentWithDetails } from "@/types/app.types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import StatusBadge from "./status-badge";
import StatusUpdater from "./status-updater";

interface Props {
  appointment: AppointmentWithDetails;
}

export default function AppointmentCard({ appointment: apt }: Props) {
  const start = new Date(apt.start_datetime);
  const end = new Date(apt.end_datetime);

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 20px -6px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Clock className="w-4 h-4 text-cyan-500" />
            {format(start, "HH:mm")} – {format(end, "HH:mm")}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(start, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <StatusBadge status={apt.status} />
      </div>

      {/* Servicio + profesional */}
      <div className="mt-3 pt-3 border-t border-gray-50">
        <p className="font-medium text-gray-900 text-sm">{apt.service.name}</p>
        <div className="flex gap-3 mt-1 text-xs text-gray-400">
          <span>{formatDuration(apt.service.duration_minutes)}</span>
          <span>{formatCurrency(apt.service.price)}</span>
          <span>· {apt.professional.name}</span>
        </div>
      </div>

      {/* Cliente */}
      <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <User className="w-3.5 h-3.5" />
          {apt.client_name}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Phone className="w-3.5 h-3.5" />
          {apt.client_phone}
        </div>
        {apt.notes && (
          <p className="text-xs text-gray-400 italic mt-1">"{apt.notes}"</p>
        )}
      </div>

      {/* Acciones de estado */}
      <StatusUpdater appointmentId={apt.id} currentStatus={apt.status} />
    </motion.div>
  );
}
