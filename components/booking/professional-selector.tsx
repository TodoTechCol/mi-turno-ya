import type { Professional } from "@/types/app.types";
import { cn } from "@/lib/utils";
import { User, Check } from "lucide-react";

interface Props {
  professionals: Professional[];
  serviceId: string;
  organizationId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ProfessionalSelector({
  professionals,
  selectedId,
  onSelect,
}: Props) {
  // Filtrado por servicio se puede hacer aquí o en el server.
  // Por simplicidad de MVP mostramos todos los activos y dejamos
  // que la API de disponibilidad valide el slot.

  if (professionals.length === 0) {
    return (
      <p className="text-center text-pizarra-400 text-sm py-8">
        No hay profesionales disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {professionals.map((pro) => {
        const isSelected = selectedId === pro.id;
        return (
          <button
            key={pro.id}
            onClick={() => onSelect(pro.id)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3",
              isSelected
                ? "border-lila-500 bg-lila-50"
                : "border-pizarra-100 bg-white hover:border-lila-200 hover:shadow-sm"
            )}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-pizarra-100 flex items-center justify-center shrink-0">
              {pro.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pro.avatar_url}
                  alt={pro.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-pizarra-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-pizarra-900 text-sm">{pro.name}</p>
              {pro.bio && (
                <p className="text-xs text-pizarra-400 mt-0.5 truncate">{pro.bio}</p>
              )}
            </div>

            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-lila-500 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
