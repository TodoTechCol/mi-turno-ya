-- ============================================================
-- Mi Turno Ya — Autogestión del turno (cancelar/reprogramar por el cliente)
-- ============================================================
-- manage_token: mismo patrón que organization_invitations.token — un
-- secreto aparte del id, generado en código de aplicación (no vía
-- DEFAULT de la base), que habilita al cliente a cancelar o
-- reprogramar SU turno sin sesión, solo con el link que le llega por
-- email. Las filas que ya existen no tienen token: se backfillea acá
-- mismo para no dejar turnos viejos sin poder gestionarse.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE appointments ADD COLUMN manage_token TEXT;
UPDATE appointments SET manage_token = encode(gen_random_bytes(32), 'hex') WHERE manage_token IS NULL;
ALTER TABLE appointments ALTER COLUMN manage_token SET NOT NULL;
CREATE UNIQUE INDEX idx_appointments_manage_token ON appointments (manage_token);

-- ------------------------------------------------------------
-- RPC pública: leer UN turno por su manage_token exacto — mismo
-- criterio que public_get_invitation_by_token (Fase 9): no es un
-- listado, no expone nada de no conocerse el token.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public_get_appointment_by_token(p_token TEXT)
RETURNS SETOF appointments AS $$
  SELECT * FROM appointments WHERE manage_token = p_token;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public_get_appointment_by_token(TEXT) TO anon, authenticated;

-- ------------------------------------------------------------
-- public_list_busy_slots ahora también devuelve el id del turno,
-- para poder excluirlo al recalcular disponibilidad durante un
-- reprogramado (si no, el cliente vería su propio horario actual
-- como "ocupado" y no podría reprogramar dentro de su mismo día).
-- Requiere DROP porque cambia el set de columnas devueltas.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public_list_busy_slots(UUID, TIMESTAMPTZ, TIMESTAMPTZ);

CREATE FUNCTION public_list_busy_slots(
  p_professional_id UUID,
  p_range_start TIMESTAMPTZ,
  p_range_end TIMESTAMPTZ
)
RETURNS TABLE (id UUID, start_datetime TIMESTAMPTZ, end_datetime TIMESTAMPTZ) AS $$
  SELECT a.id, a.start_datetime, a.end_datetime FROM appointments a
  WHERE a.professional_id = p_professional_id
    AND a.status != 'cancelled'
    AND a.start_datetime <= p_range_end
    AND a.end_datetime >= p_range_start;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public_list_busy_slots(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
