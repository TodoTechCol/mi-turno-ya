"use client";

import { motion } from "framer-motion";

/**
 * Muñequito que cruza corriendo el panel de izquierda a... en realidad
 * de derecha a izquierda, una sola vez al entrar a la página. Dibujado
 * con formas simples (sin assets externos) en blanco — mismos colores
 * que el resto del panel, no introduce nada nuevo a la paleta.
 */
export default function RunningFigure() {
  return (
    <motion.div
      className="absolute bottom-[10%] pointer-events-none"
      style={{ left: 0 }}
      initial={{ left: "100%" }}
      animate={{ left: "-12%" }}
      transition={{ duration: 2.2, ease: "linear", delay: 0.3 }}
    >
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" className="scale-x-[-1]">
        {/* cabeza */}
        <circle cx="18" cy="7" r="4.5" fill="white" />
        {/* torso */}
        <line x1="18" y1="11.5" x2="18" y2="25" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* brazo trasero */}
        <motion.line
          x1="18" y1="14"
          stroke="white" strokeWidth="2.5" strokeLinecap="round"
          animate={{ x2: [10, 24, 10], y2: [21, 19, 21] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* brazo delantero */}
        <motion.line
          x1="18" y1="14"
          stroke="white" strokeWidth="2.5" strokeLinecap="round"
          animate={{ x2: [26, 12, 26], y2: [21, 19, 21] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* pierna trasera */}
        <motion.line
          x1="18" y1="25"
          stroke="white" strokeWidth="3" strokeLinecap="round"
          animate={{ x2: [10, 26, 10], y2: [38, 33, 38] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* pierna delantera */}
        <motion.line
          x1="18" y1="25"
          stroke="white" strokeWidth="3" strokeLinecap="round"
          animate={{ x2: [26, 10, 26], y2: [33, 38, 33] }}
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}
