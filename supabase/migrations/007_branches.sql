-- ============================================================
-- Mi Turno Ya — Fase 5: Sucursales (listo para crecer, sin UI aún)
-- ============================================================
-- Se agrega la tabla branches y un branch_id NULLABLE en
-- professionals, services y appointments. Al ser nullable, los
-- tenants existentes (sin sucursales cargadas) siguen funcionando
-- exactamente igual — es "una sucursal implícita" por ahora.
-- No se construye pantalla de gestión todavía (no es obligatorio
-- según el alcance original; solo se deja la arquitectura lista).
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabla de sucursales
-- ------------------------------------------------------------
CREATE TABLE branches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  address          TEXT,
  phone            TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_branches_organization
  ON branches (organization_id)
  WHERE is_active = true;

CREATE TRIGGER trg_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_public_read"
  ON branches FOR SELECT
  USING (is_active = true);

CREATE POLICY "branches_admin_write"
  ON branches FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

-- ------------------------------------------------------------
-- 2. branch_id nullable en las tablas relevantes
-- ------------------------------------------------------------
ALTER TABLE professionals ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE services      ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE appointments  ADD COLUMN branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;

CREATE INDEX idx_professionals_branch ON professionals (branch_id) WHERE branch_id IS NOT NULL;
CREATE INDEX idx_services_branch      ON services (branch_id)      WHERE branch_id IS NOT NULL;
CREATE INDEX idx_appointments_branch  ON appointments (branch_id)  WHERE branch_id IS NOT NULL;
