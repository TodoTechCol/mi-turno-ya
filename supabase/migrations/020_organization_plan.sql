-- ============================================================
-- Mi Turno Ya — Plan contratado por cada organización
-- ============================================================
-- La landing ya muestra Básico ($0/mes) y Premium ($14.99 USD/mes),
-- pero hasta ahora no había ningún registro de qué plan tiene cada
-- negocio — el signup no lo pregunta (no hay cobro real todavía) y
-- el pase a Premium es manual, vía Super Admin (ver FAQ de la
-- landing: "Todavía no hay upgrade automático desde el panel").
-- Esta columna es la fuente de verdad de ESO: qué plan tiene cada
-- organización, para mostrarlo en el panel de Super Admin. Por ahora
-- es solo informativo — no hay ningún límite (reservas, sedes, etc.)
-- que se haga cumplir en código según el plan.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN plan TEXT NOT NULL DEFAULT 'basico' CHECK (plan IN ('basico', 'premium'));
