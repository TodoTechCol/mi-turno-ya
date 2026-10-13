import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.miturnoya.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/*",
        "/super-admin",
        "/super-admin/*",
        "/api/*",
        "/manage/*", // links privados de gestión de turno, uno por cliente
        "/auth/callback",
        "/auth/reset-password",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
