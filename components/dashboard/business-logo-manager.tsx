"use client";

import { useState } from "react";
import { toast } from "sonner";
import LogoPicker from "@/components/shared/logo-picker";
import { getInitials } from "@/lib/utils";

interface Props {
  organizationName: string;
  initialLogoUrl: string | null;
}

export default function BusinessLogoManager({ organizationName, initialLogoUrl }: Props) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [loading, setLoading] = useState(false);

  async function handleSelect(file: File) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch("/api/organization/logo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo subir el logo");
      }

      const { logo_url } = await res.json();
      setLogoUrl(logo_url);
      toast.success("Logo actualizado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir el logo");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setLoading(true);
    try {
      const res = await fetch("/api/organization/logo", { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "No se pudo quitar el logo");
      }
      setLogoUrl(null);
      toast.success("Logo eliminado");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo quitar el logo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LogoPicker
      previewUrl={logoUrl}
      fallbackText={getInitials(organizationName)}
      onSelect={handleSelect}
      onClear={handleClear}
      loading={loading}
    />
  );
}
