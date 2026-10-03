// Wordmark de marca: ícono (imagen) + texto real (no imagen), para que
// escale nítido en cualquier tamaño y respete la tipografía/color del
// brandbook ("Mi" y "ya" en pizarra-900, "turno" en lila-500).
interface LogoProps {
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export default function Logo({
  iconClassName = "w-10 h-10",
  textClassName = "text-xl",
  showText = true,
}: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mi-turno-ya-icon.png"
        alt="Mi Turno Ya"
        className={`${iconClassName} object-contain shrink-0`}
      />
      {showText && (
        <span className={`font-display font-semibold tracking-tight text-pizarra-900 ${textClassName}`}>
          Mi <span className="text-lila-500">turno</span> ya
        </span>
      )}
    </div>
  );
}
