import Link from "next/link";
import Logo from "@/components/shared/logo";

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-pizarra-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="shrink-0">
          <Logo iconClassName="h-8 w-8 sm:h-9 sm:w-9" textClassName="text-base sm:text-lg whitespace-nowrap" />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-pizarra-600">
          <a href="#funcionalidades" className="hover:text-pizarra-900 transition-colors">
            Funcionalidades
          </a>
          <a href="#precios" className="hover:text-pizarra-900 transition-colors">
            Precios
          </a>
          <a href="#faq" className="hover:text-pizarra-900 transition-colors">
            Preguntas frecuentes
          </a>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-pizarra-700 hover:text-pizarra-900 transition-colors whitespace-nowrap"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/signup"
            className="px-3 sm:px-4 py-2 bg-lila-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-lila-700 hover:shadow-md transition-all whitespace-nowrap"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}
