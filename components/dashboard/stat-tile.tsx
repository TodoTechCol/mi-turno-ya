import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: boolean;
}

export default function StatTile({ label, value, icon: Icon, accent }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        accent ? "bg-lila-600 border-lila-600" : "bg-white border-pizarra-100"
      )}
    >
      <Icon className={cn("w-4 h-4 mb-2", accent ? "text-lila-200" : "text-lila-500")} />
      <p className={cn("text-xl font-semibold", accent ? "text-white" : "text-pizarra-900")}>{value}</p>
      <p className={cn("text-xs", accent ? "text-lila-100" : "text-pizarra-400")}>{label}</p>
    </div>
  );
}
