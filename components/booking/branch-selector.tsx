import type { Branch } from "@/types/app.types";
import { cn } from "@/lib/utils";
import { MapPin, Clock, Check } from "lucide-react";

interface Props {
  branches: Branch[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function BranchSelector({ branches, selectedId, onSelect }: Props) {
  if (branches.length === 0) {
    return (
      <p className="text-center text-pizarra-400 text-sm py-8">
        No hay sedes disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {branches.map((branch) => {
        const isSelected = selectedId === branch.id;
        return (
          <button
            key={branch.id}
            onClick={() => onSelect(branch.id)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all",
              isSelected
                ? "border-lila-500 bg-lila-50"
                : "border-pizarra-100 bg-white hover:border-lila-200 hover:shadow-sm"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-pizarra-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-lila-500" />
                  {branch.name}
                </p>
                {branch.address && <p className="text-xs text-pizarra-400 mt-0.5">{branch.address}</p>}
                {branch.opening_hours && (
                  <span className="flex items-center gap-1 text-xs text-pizarra-500 mt-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {branch.opening_hours}
                  </span>
                )}
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
