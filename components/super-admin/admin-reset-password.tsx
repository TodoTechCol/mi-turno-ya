"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

interface Props {
  organizationId: string;
  email: string;
}

export default function AdminResetPassword({ organizationId, email }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${organizationId}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success(`Link de recuperación enviado a ${email}`);
    } catch {
      toast.error("No se pudo enviar el link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || sent}
      className="flex items-center gap-1 text-xs font-medium text-lila-600 hover:underline disabled:text-pizarra-400 disabled:no-underline shrink-0"
    >
      <KeyRound className="w-3 h-3" />
      {sent ? "Enviado ✓" : "Enviar reset"}
    </button>
  );
}
