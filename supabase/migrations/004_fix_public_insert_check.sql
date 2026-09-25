-- ============================================================
-- Mi Turno Ya — Fix: ambigüedad de columnas en appointments_public_insert
-- ============================================================
-- La política creada en 003 comparaba "organization_id" sin calificar
-- dentro de una subconsulta a "professionals"/"services", que también
-- tienen una columna "organization_id". Postgres resolvía la referencia
-- contra la tabla de la subconsulta (auto-comparación, siempre true en
-- la mitad del check) en vez de contra el turno nuevo, lo que terminaba
-- bloqueando reservas públicas legítimas.
-- Fix: calificar explícitamente todas las columnas con su tabla.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

DROP POLICY IF EXISTS "appointments_public_insert" ON appointments;

CREATE POLICY "appointments_public_insert"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = appointments.professional_id
        AND p.organization_id = appointments.organization_id
    )
    AND EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = appointments.service_id
        AND s.organization_id = appointments.organization_id
    )
  );
