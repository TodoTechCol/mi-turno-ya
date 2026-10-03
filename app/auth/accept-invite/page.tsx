import Link from "next/link";
import { getInvitationByToken } from "@/services/invitations.service";
import AcceptInviteForm from "@/components/auth/accept-invite-form";
import Logo from "@/components/shared/logo";

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
      <div className="hidden lg:flex lg:w-1/2 relative bg-pizarra-950 items-center justify-center overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-lila-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-lila-400/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col items-center text-center px-10">
          <div className="w-28 h-28 bg-white rounded-3xl p-4 mb-6 shadow-[0_0_40px_rgba(124,102,220,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mi-turno-ya-icon.png" alt="Mi Turno Ya" className="w-full h-full object-contain" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white mb-2">Tu tiempo manda.</h2>
          <p className="text-pizarra-400 text-sm max-w-xs">
            Te agendás, te recuerdan y te atienden sin esperar.
          </p>
        </div>
      </div>

      {/* Panel de formulario */}
      <div className="flex-1 flex items-center justify-center bg-pizarra-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden flex-col items-center mb-8">
            <Logo iconClassName="w-14 h-14" textClassName="text-xl" />
          </div>

          {isInvalid ? (
            <div className="bg-white rounded-2xl shadow-sm border border-pizarra-100 p-6 text-center">
              <h1 className="text-lg font-semibold text-pizarra-900 mb-2">
                {invitation?.status === "accepted"
                  ? "Esta invitación ya fue usada"
                  : "Invitación no válida"}
              </h1>
              <p className="text-sm text-pizarra-500 mb-6">
                {invitation?.status === "accepted"
                  ? "Esta cuenta ya está activa. Iniciá sesión con tu contraseña."
                  : "El link venció o ya no existe. Pedile al administrador que te envíe una invitación nueva."}
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-4 py-2 bg-lila-600 text-white text-sm font-medium rounded-lg hover:bg-lila-700 transition-colors"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-pizarra-900">
                  Te invitaron a {invitation.organization_name}
                </h1>
                <p className="text-sm text-pizarra-500 mt-1">
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
