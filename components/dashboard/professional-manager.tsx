"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Power, User, CalendarClock, Mail, X, Send } from "lucide-react";
import type { Professional, OrganizationInvitation } from "@/types/app.types";
import ProfessionalForm from "./professional-form";

interface Props {
  professionals: Professional[];
  invitations: OrganizationInvitation[];
}

export default function ProfessionalManager({ professionals, invitations }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const router = useRouter();

  function invitationFor(professionalId: string) {
    return invitations.find((inv) => inv.professional_id === professionalId);
  }

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(professional: Professional) {
    setEditing(professional);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function handleSaved() {
    closeForm();
    router.refresh();
  }

  async function toggleActive(professional: Professional) {
    try {
      const res = await fetch(`/api/professionals/${professional.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !professional.is_active }),
      });
      if (!res.ok) throw new Error();
      toast.success(professional.is_active ? "Profesional desactivado" : "Profesional activado");
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar el profesional");
    }
  }

  async function sendInvite(professionalId: string, email: string) {
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professional_id: professionalId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar la invitación");
      toast.success(
        data.emailSent
          ? "Invitación enviada por correo"
          : "Invitación creada, pero el correo no se pudo enviar (revisá la configuración de email)"
      );
      setInvitingId(null);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar la invitación");
    }
  }

  async function revokeInvite(invitationId: string) {
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Invitación revocada");
      router.refresh();
    } catch {
      toast.error("No se pudo revocar la invitación");
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo profesional
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <ProfessionalForm professional={editing} onSaved={handleSaved} onCancel={closeForm} />
        </div>
      )}

      {professionals.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">
          No hay profesionales cargados todavía.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {professionals.map((professional) => {
            const invitation = invitationFor(professional.id);
            return (
              <div
                key={professional.id}
                className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${
                  professional.is_active ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{professional.name}</p>
                      {professional.bio && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{professional.bio}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                      professional.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {professional.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button
                    onClick={() => openEdit(professional)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </button>
                  <button
                    onClick={() => toggleActive(professional)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Power className="w-3 h-3" />
                    {professional.is_active ? "Desactivar" : "Activar"}
                  </button>
                  <Link
                    href={`/dashboard/professionals/${professional.id}`}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-50 text-cyan-700 hover:bg-cyan-100 transition-colors"
                  >
                    <CalendarClock className="w-3 h-3" />
                    Servicios y horario
                  </Link>
                </div>

                {/* Acceso al panel */}
                <div className="mt-3 pt-3 border-t border-gray-50">
                  {professional.user_id ? (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                      <Mail className="w-3 h-3" />
                      Tiene acceso al panel
                    </p>
                  ) : invitingId === professional.id ? (
                    <InviteInlineForm
                      onCancel={() => setInvitingId(null)}
                      onSend={(email) => sendInvite(professional.id, email)}
                    />
                  ) : invitation ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-amber-700 flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        Invitación pendiente ({invitation.email})
                      </p>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setInvitingId(professional.id)}
                          className="text-xs font-medium text-cyan-600 hover:underline"
                        >
                          Reenviar
                        </button>
                        <button
                          onClick={() => revokeInvite(invitation.id)}
                          className="text-xs font-medium text-gray-400 hover:text-red-500"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setInvitingId(professional.id)}
                      className="flex items-center gap-1 text-xs font-medium text-cyan-600 hover:underline"
                    >
                      <Mail className="w-3 h-3" />
                      Invitar acceso al panel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InviteInlineForm({
  onSend,
  onCancel,
}: {
  onSend: (email: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!email.includes("@")) {
      toast.error("Ingresá un email válido");
      return;
    }
    setSending(true);
    await onSend(email);
    setSending(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@profesional.com"
        className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
      <button
        onClick={handleSend}
        disabled={sending}
        className="p-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 shrink-0"
        title="Enviar invitación"
      >
        <Send className="w-3 h-3" />
      </button>
      <button
        onClick={onCancel}
        className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors shrink-0"
        title="Cancelar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
