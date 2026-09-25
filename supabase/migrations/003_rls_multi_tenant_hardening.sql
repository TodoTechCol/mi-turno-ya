-- ============================================================
-- Mi Turno Ya — Fase 2: Corrección de RLS para multi-tenant
-- ============================================================
-- 1. El helper de aislamiento asumía "un usuario = una organización"
--    (LIMIT 1). Se reemplaza por una versión que soporta membresías
--    múltiples, usada por las políticas de lectura/actualización
--    de turnos.
-- 2. Se agrega la política faltante para que un organization_admin
--    pueda leer a los demás miembros de su propia organización
--    (hoy solo existía autolectura).
-- 3. Se refuerza la reserva pública para que no se puedan mezclar
--    profesional/servicio de una organización distinta a la del
--    turno (defensa en profundidad además de la validación de
--    la app).
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Reemplazar el helper de organización(es) del usuario
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "appointments_organization_read" ON appointments;
DROP POLICY IF EXISTS "appointments_organization_update" ON appointments;
DROP FUNCTION IF EXISTS auth_user_organization_id();

CREATE OR REPLACE FUNCTION auth_user_organization_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "appointments_organization_read"
  ON appointments FOR SELECT
  USING (organization_id IN (SELECT auth_user_organization_ids()));

CREATE POLICY "appointments_organization_update"
  ON appointments FOR UPDATE
  USING (organization_id IN (SELECT auth_user_organization_ids()));

-- ------------------------------------------------------------
-- 2. organization_admin puede leer a los miembros de su organización
--    (política adicional — no reemplaza la autolectura existente)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_organization_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND role = 'organization_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "organization_members_admin_read"
  ON organization_members FOR SELECT
  USING (is_organization_admin(organization_id));

-- ------------------------------------------------------------
-- 3. Reforzar la reserva pública: el profesional y el servicio
--    del turno deben pertenecer a la organización del turno.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "appointments_public_insert" ON appointments;

CREATE POLICY "appointments_public_insert"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = professional_id AND p.organization_id = organization_id
    )
    AND EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_id AND s.organization_id = organization_id
    )
  );
