import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Users, Tag, CalendarDays, CheckCircle2, Wallet } from "lucide-react";
import { getDashboardContext } from "@/lib/dashboard-context";
import { getBranchByIdForOrg, getBranchStats } from "@/services/branches.service";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BranchDetailPage({ params }: Props) {
  const { id } = await params;
  const ctx = await getDashboardContext();

  if (!ctx || ctx.role !== "organization_admin") {
    return (
      <div className="text-center py-12 text-pizarra-400">
        <p>No tenés permiso para ver esta página.</p>
      </div>
    );
  }

  const branch = await getBranchByIdForOrg(id, ctx.organizationId);
  if (!branch) notFound();

  const stats = await getBranchStats(id);

  const cards = [
    { label: "Profesionales", value: stats.professionalsCount, icon: Users },
    { label: "Servicios", value: stats.servicesCount, icon: Tag },
    { label: "Turnos totales", value: stats.appointmentsTotal, icon: CalendarDays },
    { label: "Completados", value: stats.appointmentsCompleted, icon: CheckCircle2 },
  ];

  return (
    <div>
      <Link
        href="/dashboard/branches"
        className="inline-flex items-center gap-1.5 text-sm text-pizarra-500 hover:text-pizarra-900 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Sedes
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pizarra-900">{branch.name}</h1>
        {branch.address && <p className="text-sm text-pizarra-400 mt-0.5">{branch.address}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-pizarra-100 p-4">
            <Icon className="w-4 h-4 text-lila-500 mb-2" />
            <p className="text-xl font-semibold text-pizarra-900">{value}</p>
            <p className="text-xs text-pizarra-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-lila-50 rounded-xl border border-lila-100 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-lila-600" />
          <div>
            <p className="text-sm font-medium text-pizarra-900">Valor generado</p>
            <p className="text-xs text-pizarra-500">Suma de turnos completados en esta sede</p>
          </div>
        </div>
        <p className="text-2xl font-bold text-lila-600">{formatCurrency(stats.revenueGenerated)}</p>
      </div>

      <Link
        href={`/dashboard/appointments?branch=${branch.id}`}
        className="inline-block mt-6 text-sm font-medium text-lila-600 hover:underline"
      >
        Ver turnos de esta sede →
      </Link>
    </div>
  );
}
