import Link from "next/link";
import { getInvitationByToken } from "@/services/invitations.service";
import AcceptInviteForm from "@/components/auth/accept-invite-form";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams;
  const invitation = token ? await getInvitationByToken(token) : null;

  const isExpired = invitation ? new Date(invitation.expires_at) < new Date() : false;
  const isInvalid = !token || !invitation || invitation.status !== "pending" || isExpired;

  return (
    <div className="min-h-screen flex">
      {/* Panel de marca — oculto en mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-950 items-center justify-center overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col items-center text-center px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-todotech.png"
            alt="Todo Tech"
            className="w-32 h-32 rounded-3xl object-cover mb-6 shadow-[0_0_40px_rgba(34,211,238,0.25)]"
          />
          <p className="text-gray-400 text-sm max-w-xs">
            Tecnología que resuelve. Innova. Conecta.
          </p>
        </div>
      </div>

      {/* Panel de formulario */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden flex-col items-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-todotech.png"
              alt="Todo Tech"
              className="w-20 h-20 rounded-2xl object-cover mb-3"
            />
          </div>

          {isInvalid ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <h1 className="text-lg font-semibold text-gray-900 mb-2">
                {invitation?.status === "accepted"
                  ? "Esta invitación ya fue usada"
                  : "Invitación no válida"}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {invitation?.status === "accepted"
                  ? "Esta cuenta ya está activa. Iniciá sesión con tu contraseña."
                  : "El link venció o ya no existe. Pedile al administrador que te envíe una invitación nueva."}
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-gray-900">
                  Te invitaron a {invitation.organization_name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Creá tu contraseña para activar tu acceso como profesional.
                </p>
              </div>
              <AcceptInviteForm token={token!} email={invitation.email} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
