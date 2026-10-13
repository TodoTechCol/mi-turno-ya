"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  organizationId: string;
  plan: "basico" | "premium";
}

const PLANS: { value: "basico" | "premium"; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "premium", label: "Premium" },
];

export default function PlanSelector({ organizationId, plan }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(newPlan: "basico" | "premium") {
    if (newPlan === plan) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Plan cambiado a ${newPlan === "premium" ? "Premium" : "Básico"}`);
      router.refresh();
    } catch {
      toast.error("No se pudo cambiar el plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Sparkles className="w-3.5 h-3.5 text-pizarra-400" />
      <div className="flex rounded-lg border border-pizarra-200 overflow-hidden">
        {PLANS.map((p) => (
          <button
            key={p.value}
            onClick={() => handleChange(p.value)}
            disabled={loading}
            className={cn(
              "px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50",
              plan === p.value ? "bg-lila-600 text-white" : "text-pizarra-500 hover:bg-pizarra-50",
              p.value === "premium" && "border-l border-pizarra-200"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
