-- ============================================================
-- Mi Turno Ya — Corrección ALTO: enumeración pública cruzada
-- entre organizaciones + fix de doble-reserva
-- ============================================================
-- Hallazgo de la auditoría: professionals, services, schedules,
-- schedule_blocks, professional_services y branches tenían lectura
-- pública SIN filtro de organización (USING (is_active = true) o
-- USING (true)) — cualquiera, sin login, podía volcar el staff,
-- servicios, precios y horarios de TODAS las organizaciones de la
-- plataforma en una sola consulta sin pasar por la app.
--
-- RLS no puede saber "qué organización estás mirando" — solo puede
-- filtrar filas. La solución es mover el acceso público de "leer la
-- tabla directamente" a funciones que EXIGEN los parámetros
-- específicos (organization_id, professional_id, etc.), de forma
-- que nunca sea posible pedir "todo" sin acotar.
--
-- De paso corrige un bug real encontrado en el camino: un visitante
-- anónimo no podía leer los turnos ya ocupados de un profesional
-- (la policy de appointments solo permite ver turnos a admin/
-- professional de esa organización), por lo que la disponibilidad
-- podía estar ofreciendo horarios ya reservados.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Eliminar las políticas públicas sin acotar
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "professionals_public_read" ON professionals;
DROP POLICY IF EXISTS "services_public_read" ON services;
DROP POLICY IF EXISTS "schedules_public_read" ON schedules;
DROP POLICY IF EXISTS "schedule_blocks_public_read" ON schedule_blocks;
DROP POLICY IF EXISTS "professional_services_public_read" ON professional_services;
DROP POLICY IF EXISTS "branches_public_read" ON branches;

-- ------------------------------------------------------------
-- 2. Funciones públicas acotadas (SECURITY DEFINER, siempre
--    exigen parámetros específicos, nunca "traer todo")
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public_list_professionals(p_organization_id UUID)
RETURNS SETOF professionals AS $$
  SELECT * FROM professionals
  WHERE organization_id = p_organization_id AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public_list_services(p_organization_id UUID)
RETURNS SETOF services AS $$
  SELECT * FROM services
  WHERE organization_id = p_organization_id AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public_list_professionals_for_service(
  p_organization_id UUID,
  p_service_id UUID
)
RETURNS SETOF professionals AS $$
  SELECT p.* FROM professionals p
  JOIN professional_services ps ON ps.professional_id = p.id
  WHERE p.organization_id = p_organization_id
    AND p.is_active = true
    AND ps.service_id = p_service_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public_get_schedule(
  p_professional_id UUID,
  p_day_of_week INT
)
RETURNS SETOF schedules AS $$
  SELECT * FROM schedules
  WHERE professional_id = p_professional_id
    AND day_of_week = p_day_of_week
    AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public_list_schedule_blocks(
  p_professional_id UUID,
  p_range_start TIMESTAMPTZ,
  p_range_end TIMESTAMPTZ
)
RETURNS SETOF schedule_blocks AS $$
  SELECT * FROM schedule_blocks
  WHERE professional_id = p_professional_id
    AND start_datetime <= p_range_end
    AND end_datetime >= p_range_start;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Solo horarios ocupados (start/end) — nunca nombre/teléfono del
-- cliente, aunque quien pregunta sea anónimo.
CREATE OR REPLACE FUNCTION public_list_busy_slots(
  p_professional_id UUID,
  p_range_start TIMESTAMPTZ,
  p_range_end TIMESTAMPTZ
)
RETURNS TABLE (start_datetime TIMESTAMPTZ, end_datetime TIMESTAMPTZ) AS $$
  SELECT a.start_datetime, a.end_datetime FROM appointments a
  WHERE a.professional_id = p_professional_id
    AND a.status != 'cancelled'
    AND a.start_datetime <= p_range_end
    AND a.end_datetime >= p_range_start;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public_list_professionals(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public_list_services(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public_list_professionals_for_service(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public_get_schedule(UUID, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public_list_schedule_blocks(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public_list_busy_slots(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
