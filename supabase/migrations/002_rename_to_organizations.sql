-- ============================================================
-- Mi Turno Ya — Fase 1: Rename business* → organization*
-- Sin cambios de comportamiento, solo nomenclatura.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Eliminar políticas existentes (se recrean más abajo)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "businesses_public_read" ON businesses;
DROP POLICY IF EXISTS "businesses_admin_write" ON businesses;
DROP POLICY IF EXISTS "professionals_public_read" ON professionals;
DROP POLICY IF EXISTS "professionals_admin_write" ON professionals;
DROP POLICY IF EXISTS "services_public_read" ON services;
DROP POLICY IF EXISTS "services_admin_write" ON services;
DROP POLICY IF EXISTS "professional_services_public_read" ON professional_services;
DROP POLICY IF EXISTS "schedules_public_read" ON schedules;
DROP POLICY IF EXISTS "schedules_admin_write" ON schedules;
DROP POLICY IF EXISTS "schedule_blocks_public_read" ON schedule_blocks;
DROP POLICY IF EXISTS "schedule_blocks_admin_write" ON schedule_blocks;
DROP POLICY IF EXISTS "appointments_public_insert" ON appointments;
DROP POLICY IF EXISTS "appointments_business_read" ON appointments;
DROP POLICY IF EXISTS "appointments_business_update" ON appointments;
DROP POLICY IF EXISTS "business_users_self_read" ON business_users;

-- ------------------------------------------------------------
-- 2. Eliminar función helper (se recrea con nuevo nombre)
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS auth_user_business_id();

-- ------------------------------------------------------------
-- 3. Renombrar tablas
-- ------------------------------------------------------------
ALTER TABLE businesses RENAME TO organizations;
ALTER TABLE business_users RENAME TO organization_members;

-- ------------------------------------------------------------
-- 4. Renombrar columnas business_id → organization_id
-- ------------------------------------------------------------
ALTER TABLE professionals        RENAME COLUMN business_id TO organization_id;
ALTER TABLE services             RENAME COLUMN business_id TO organization_id;
ALTER TABLE schedules            RENAME COLUMN business_id TO organization_id;
ALTER TABLE schedule_blocks      RENAME COLUMN business_id TO organization_id;
ALTER TABLE appointments         RENAME COLUMN business_id TO organization_id;
ALTER TABLE organization_members RENAME COLUMN business_id TO organization_id;

-- ------------------------------------------------------------
-- 5. Actualizar valores y constraint del rol
--    (business_admin → organization_admin)
-- ------------------------------------------------------------
ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS business_users_role_check;
UPDATE organization_members SET role = 'organization_admin' WHERE role = 'business_admin';
ALTER TABLE organization_members
  ADD CONSTRAINT organization_members_role_check
  CHECK (role IN ('organization_admin', 'professional'));

-- ------------------------------------------------------------
-- 6. Recrear función helper con nuevo nombre
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 7. Recrear políticas con los nuevos nombres
-- ------------------------------------------------------------

-- ---------- organizations ----------
CREATE POLICY "organizations_public_read"
  ON organizations FOR SELECT
  USING (is_active = true);

CREATE POLICY "organizations_admin_write"
  ON organizations FOR ALL
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

-- ---------- professionals ----------
CREATE POLICY "professionals_public_read"
  ON professionals FOR SELECT
  USING (is_active = true);

CREATE POLICY "professionals_admin_write"
  ON professionals FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

-- ---------- services ----------
CREATE POLICY "services_public_read"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "services_admin_write"
  ON services FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

-- ---------- professional_services ----------
CREATE POLICY "professional_services_public_read"
  ON professional_services FOR SELECT
  USING (true);

-- ---------- schedules ----------
CREATE POLICY "schedules_public_read"
  ON schedules FOR SELECT
  USING (is_active = true);

CREATE POLICY "schedules_admin_write"
  ON schedules FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

-- ---------- schedule_blocks ----------
CREATE POLICY "schedule_blocks_public_read"
  ON schedule_blocks FOR SELECT
  USING (true);

CREATE POLICY "schedule_blocks_admin_write"
  ON schedule_blocks FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

-- ---------- appointments ----------
-- Inserción pública (clientes anónimos pueden crear turnos)
CREATE POLICY "appointments_public_insert"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Lectura: solo usuarios de la misma organización
CREATE POLICY "appointments_organization_read"
  ON appointments FOR SELECT
  USING (
    organization_id = auth_user_organization_id()
  );

-- Actualización: solo usuarios de la organización
CREATE POLICY "appointments_organization_update"
  ON appointments FOR UPDATE
  USING (
    organization_id = auth_user_organization_id()
  );

-- ---------- organization_members ----------
CREATE POLICY "organization_members_self_read"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());
