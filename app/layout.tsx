import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Outfit para titulares (geométrica y redondeada, dialoga con el logo);
// Plus Jakarta Sans para interfaz y lectura (clara en tamaños chicos,
// números tabulares para horas) — ver brandbook.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.miturnoya.org";
const DESCRIPTION =
  "Agenda online para barberías, peluquerías, spas y consultorios. Tus clientes reservan 24/7, reprograman o cancelan solos, y vos gestionás todo desde un panel simple.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Mi Turno Ya — Agenda y reservas online para tu negocio",
    template: "%s — Mi Turno Ya",
  },
  description: DESCRIPTION,
  keywords: [
    "reservas online",
    "agenda de turnos",
    "software para barberías",
    "software para peluquerías",
    "sistema de citas online",
    "reservar turno online",
  ],
  icons: {
    icon: "/logo-mi-turno-ya-icon.png",
    apple: "/logo-mi-turno-ya-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Mi Turno Ya",
    title: "Mi Turno Ya — Agenda y reservas online para tu negocio",
    description: DESCRIPTION,
    url: APP_URL,
    images: [{ url: "/logo-mi-turno-ya-full.png", width: 1200, height: 630, alt: "Mi Turno Ya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Turno Ya — Agenda y reservas online para tu negocio",
    description: DESCRIPTION,
    images: ["/logo-mi-turno-ya-full.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} ${plusJakarta.variable} font-sans`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
