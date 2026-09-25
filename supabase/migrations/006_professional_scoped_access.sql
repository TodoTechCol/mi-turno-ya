-- ============================================================
-- Mi Turno Ya — Fase 4: Identidad de profesional
-- ============================================================
-- Hasta ahora CUALQUIER miembro de la organización (admin o
-- professional) veía y actualizaba TODOS los turnos del negocio.
-- Esta migración separa el acceso: organization_admin sigue viendo
-- todo; professional pasa a ver/actualizar solo los turnos donde
-- es el profesional asignado (vía professionals.user_id).
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Helper: ids de professionals vinculados al usuario actual
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth_user_professional_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM professionals WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 2. Reemplazar las políticas generales de lectura/actualización
--    por dos pares: una para admins (todo el negocio) y otra
--    para profesionales (solo sus propios turnos).
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "appointments_organization_read" ON appointments;
DROP POLICY IF EXISTS "appointments_organization_update" ON appointments;

CREATE POLICY "appointments_admin_read"
  ON appointments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

CREATE POLICY "appointments_professional_read"
  ON appointments FOR SELECT
  USING (
    professional_id IN (SELECT auth_user_professional_ids())
  );

CREATE POLICY "appointments_admin_update"
  ON appointments FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

CREATE POLICY "appointments_professional_update"
  ON appointments FOR UPDATE
  USING (
    professional_id IN (SELECT auth_user_professional_ids())
  );
