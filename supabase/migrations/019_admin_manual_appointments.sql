-- ============================================================
-- Mi Turno Ya — Turnos cargados a mano por el admin (walk-in)
-- ============================================================
-- Hasta ahora la única política de INSERT en appointments era
-- "appointments_public_insert" (reserva anónima). Un organization_admin
-- logueado no podía insertar un turno a mano desde su propio panel
-- porque no existía ninguna policy que lo permitiera — Postgres
-- combina policies permisivas del mismo FOR con OR, así que esto SUMA
-- una vía más, no reemplaza la pública.
-- Mismo refuerzo de "defensa en profundidad" que la policy pública:
-- el profesional y el servicio tienen que pertenecer a la MISMA
-- organización que el turno.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

CREATE POLICY "appointments_admin_insert"
  ON appointments FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
    AND EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = professional_id AND p.organization_id = organization_id
    )
    AND EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_id AND s.organization_id = organization_id
    )
  );
