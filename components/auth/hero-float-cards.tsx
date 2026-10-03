"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Clock, BellRing } from "lucide-react";

/**
 * Elementos flotantes decorativos para el panel de marca de login/signup/
 * accept-invite: tarjetas tipo UI real del producto, con un flote
 * continuo sutil + un leve parallax al mover el mouse (cada tarjeta
 * reacciona a distinta profundidad, para que se sienta con capas en vez
 * de "todo pegado"). Intensidad pensada para acompañar, no distraer del
 * formulario (que sigue siendo el foco real de la pantalla).
 */
export default function HeroFloatCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // -1 a 1 relativo al centro del panel
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x, y });
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      className="absolute inset-0 pointer-events-none"
    >
      {/* Tarjeta: turno confirmado */}
      <motion.div
        className="absolute top-[14%] right-[10%] pointer-events-auto"
        animate={{ y: [0, -12, 0], x: mouse.x * 14, rotate: mouse.x * 2 }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          x: { type: "spring", stiffness: 60, damping: 15 },
          rotate: { type: "spring", stiffness: 60, damping: 15 },
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 w-48">
          <div className="w-9 h-9 rounded-full bg-status-success/10 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-[18px] h-[18px] text-status-success" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-pizarra-900 truncate">Corte + Barba</p>
            <p className="text-[11px] text-status-success font-medium">Confirmado</p>
          </div>
        </div>
      </motion.div>

      {/* Chip: hora del turno */}
      <motion.div
        className="absolute top-[46%] right-[22%] pointer-events-auto"
        animate={{ y: [0, 10, 0], x: mouse.x * -10, rotate: mouse.y * -2 }}
        transition={{
          y: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
          x: { type: "spring", stiffness: 60, damping: 15 },
          rotate: { type: "spring", stiffness: 60, damping: 15 },
        }}
      >
        <div className="bg-lila-500/90 backdrop-blur-sm rounded-full shadow-lg px-3.5 py-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-semibold text-white">15:30</span>
        </div>
      </motion.div>

      {/* Tarjeta: recordatorio */}
      <motion.div
        className="absolute bottom-[20%] left-[8%] pointer-events-auto"
        animate={{ y: [0, -9, 0], x: mouse.x * 12, rotate: mouse.x * -1.5 }}
        transition={{
          y: { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
          x: { type: "spring", stiffness: 60, damping: 15 },
          rotate: { type: "spring", stiffness: 60, damping: 15 },
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 w-52">
          <div className="w-9 h-9 rounded-full bg-status-info/10 flex items-center justify-center shrink-0">
            <BellRing className="w-[18px] h-[18px] text-status-info" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-pizarra-900">Te avisamos</p>
            <p className="text-[11px] text-pizarra-400 truncate">Un día antes, sin falta</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
