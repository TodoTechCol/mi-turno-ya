"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Clock, BellRing, Zap } from "lucide-react";

/**
 * Elementos flotantes decorativos para el panel de marca de login/signup/
 * accept-invite: tarjetas tipo UI real del producto (genéricas — ningún
 * negocio puntual, sirve para cualquier rubro), con un flote continuo
 * sutil + un leve parallax al mover el mouse (cada tarjeta reacciona a
 * distinta profundidad). Dispuestas en las 4 esquinas alrededor del
 * logo central, para que la composición se sienta armada/centrada y no
 * como elementos sueltos.
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
      {/* Textura sutil de puntos — le da profundidad al fondo sin competir con las tarjetas */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Tarjeta: reservá rápido */}
      <motion.div
        className="absolute top-[16%] left-[12%] pointer-events-auto"
        animate={{ y: [0, 10, 0], x: mouse.x * -12, rotate: mouse.y * 2 }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          x: { type: "spring", stiffness: 60, damping: 15 },
          rotate: { type: "spring", stiffness: 60, damping: 15 },
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 w-56">
          <div className="w-9 h-9 rounded-full bg-lila-100 flex items-center justify-center shrink-0">
            <Zap className="w-[18px] h-[18px] text-lila-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-pizarra-900 whitespace-nowrap">Reservá al toque</p>
            <p className="text-[11px] text-pizarra-400 whitespace-nowrap">Sin llamadas, sin esperas</p>
          </div>
        </div>
      </motion.div>

      {/* Tarjeta: turno confirmado */}
      <motion.div
        className="absolute top-[16%] right-[10%] pointer-events-auto"
        animate={{ y: [0, -12, 0], x: mouse.x * 14, rotate: mouse.x * 2 }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
          x: { type: "spring", stiffness: 60, damping: 15 },
          rotate: { type: "spring", stiffness: 60, damping: 15 },
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 w-52">
          <div className="w-9 h-9 rounded-full bg-status-success/10 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-[18px] h-[18px] text-status-success" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-pizarra-900 whitespace-nowrap">Turno confirmado</p>
            <p className="text-[11px] text-status-success font-medium">Listo ✓</p>
          </div>
        </div>
      </motion.div>

      {/* Chip: hora del turno */}
      <motion.div
        className="absolute bottom-[26%] right-[16%] pointer-events-auto"
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
        className="absolute bottom-[16%] left-[9%] pointer-events-auto"
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
