import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/app.types";
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from "@/types/app.types";

interface Props {
  status: AppointmentStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        APPOINTMENT_STATUS_COLORS[status],
        className
      )}
    >
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}
