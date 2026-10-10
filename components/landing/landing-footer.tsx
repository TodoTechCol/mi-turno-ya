import Link from "next/link";
import Logo from "@/components/shared/logo";

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-pizarra-100 py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo iconClassName="h-7 w-7" textClassName="text-sm" />

        <nav className="flex items-center gap-6 text-sm text-pizarra-500">
          <a href="#funcionalidades" className="hover:text-pizarra-900 transition-colors">
            Funcionalidades
          </a>
          <a href="#precios" className="hover:text-pizarra-900 transition-colors">
            Precios
          </a>
          <Link href="/auth/login" className="hover:text-pizarra-900 transition-colors">
            Iniciar sesión
          </Link>
        </nav>

        <p className="text-xs text-pizarra-400">© {new Date().getFullYear()} Mi Turno Ya</p>
      </div>
    </footer>
  );
}
