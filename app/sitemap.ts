import type { MetadataRoute } from "next";
import { getAllOrganizations } from "@/services/organizations.service";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.miturnoya.org";

/**
 * getAllOrganizations() corre con el cliente autenticado normal — acá
 * no hay sesión (sitemap.ts no tiene cookies de usuario), así que la
 * policy "organizations_public_read" (is_active = true) ya filtra
 * sola a las pendientes/inactivas. El .filter() de abajo es nomás
 * defensa en profundidad, no depender solo de RLS implícito.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const organizations = await getAllOrganizations();
  const activeOrgs = organizations.filter((org) => org.is_active);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/auth/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const orgRoutes: MetadataRoute.Sitemap = activeOrgs.map((org) => ({
    url: `${APP_URL}/${org.slug}`,
    lastModified: new Date(org.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...orgRoutes];
}
