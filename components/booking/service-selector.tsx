import type { Service } from "@/types/app.types";
import { formatCurrency, formatDuration, cn } from "@/lib/utils";
import { Clock, Check } from "lucide-react";

interface Props {
  services: Service[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ServiceSelector({ services, selectedId, onSelect }: Props) {
  if (services.length === 0) {
    return (
      <p className="text-center text-pizarra-400 text-sm py-8">
        No hay servicios disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {services.map((service) => {
        const isSelected = selectedId === service.id;
        return (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all",
              isSelected
                ? "border-lila-500 bg-lila-50"
                : "border-pizarra-100 bg-white hover:border-lila-200 hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-pizarra-900 text-sm">{service.name}</p>
                {service.description && (
                  <p className="text-xs text-pizarra-400 mt-0.5">{service.description}</p>
                )}
                <div className="flex gap-3 mt-2 text-xs text-pizarra-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(service.duration_minutes)}
                  </span>
                  <span className="text-lila-600 font-medium">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-lila-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
