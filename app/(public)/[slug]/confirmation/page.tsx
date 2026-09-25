import Link from "next/link";
import { CheckCircle2, Calendar, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; time?: string; service?: string }>;
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Turno reservado!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Tu turno fue registrado correctamente. Recibirás una confirmación pronto.
        </p>

        {(sp.date || sp.time) && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Detalles del turno</span>
            </div>
            {sp.service && <p className="text-gray-500 mt-1">Servicio: {sp.service}</p>}
            {sp.date && <p className="text-gray-500">Fecha: {sp.date}</p>}
            {sp.time && <p className="text-gray-500">Hora: {sp.time}</p>}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Link
            href={`/${slug}/booking`}
            className="w-full py-2.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Reservar otro turno
          </Link>
          <Link
            href={`/${slug}`}
            className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
