import { createAdminClient } from "@/lib/supabase/admin";

function pathFor(organizationId: string, type: string) {
  const ext = type === "image/png" ? "png" : "jpg";
  return `${organizationId}/logo.${ext}`;
}

/**
 * Sube el logo de una organización al bucket público "logos". Antes de
 * subir borra las dos extensiones posibles (png/jpg) para no dejar un
 * archivo huérfano si el dueño cambia de formato entre una subida y otra.
 */
export async function uploadOrganizationLogo(
  organizationId: string,
  file: File
): Promise<string | null> {
  const admin = createAdminClient();
  await deleteOrganizationLogo(organizationId);

  const path = pathFor(organizationId, file.type);
  const buffer = await file.arrayBuffer();

  const { error } = await admin.storage.from("logos").upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (error) return null;

  const { data } = admin.storage.from("logos").getPublicUrl(path);
  // cache-busting: si se reemplaza el logo, que no quede cacheada la URL vieja
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function deleteOrganizationLogo(organizationId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.storage
    .from("logos")
    .remove([`${organizationId}/logo.png`, `${organizationId}/logo.jpg`]);
}
