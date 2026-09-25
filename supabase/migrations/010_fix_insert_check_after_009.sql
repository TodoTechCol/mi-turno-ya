-- ============================================================
-- Mi Turno Ya — Fix: appointments_public_insert quedó roto por 009
-- ============================================================
-- La migración 009 quitó la lectura pública directa de professionals
-- y services (para cerrar la enumeración cruzada). Pero
-- appointments_public_insert verifica la integridad del turno con
-- una subconsulta directa a esas tablas (EXISTS (SELECT 1 FROM
-- professionals ...)), que ahora el rol anon no puede ejecutar
-- porque ya no existe ninguna policy de lectura que se lo permita.
-- Resultado: toda reserva pública empezó a fallar con "new row
-- violates row-level security policy".
--
-- Fix: mover esa verificación a funciones SECURITY DEFINER (mismo
-- patrón que is_organization_admin / auth_user_professional_ids),
-- que bypasean RLS de forma controlada solo para esta comprobación
-- puntual de pertenencia.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

CREATE OR REPLACE FUNCTION professional_belongs_to_org(
  p_professional_id UUID,
  p_organization_id UUID
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM professionals
    WHERE id = p_professional_id AND organization_id = p_organization_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION service_belongs_to_org(
  p_service_id UUID,
  p_organization_id UUID
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM services
    WHERE id = p_service_id AND organization_id = p_organization_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "appointments_public_insert" ON appointments;

CREATE POLICY "appointments_public_insert"
  ON appointments FOR INSERT
  WITH CHECK (
    professional_belongs_to_org(professional_id, organization_id)
    AND service_belongs_to_org(service_id, organization_id)
  );
