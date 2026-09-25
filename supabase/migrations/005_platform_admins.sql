-- ============================================================
-- Mi Turno Ya — Fase 3: Super Admin (mínimo)
-- ============================================================
-- platform_admins es una tabla aparte de organization_members
-- porque un super admin no es "miembro" de ninguna organización
-- puntual — administra la plataforma completa.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabla de administradores de plataforma
-- ------------------------------------------------------------
CREATE TABLE platform_admins (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_admins_self_read"
  ON platform_admins FOR SELECT
  USING (user_id = auth.uid());

-- ------------------------------------------------------------
-- 2. Helper para chequear si el usuario actual es platform admin
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_admins WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 3. Un platform admin puede ver TODAS las organizaciones
--    (la política pública existente solo muestra is_active = true)
-- ------------------------------------------------------------
CREATE POLICY "organizations_platform_admin_read"
  ON organizations FOR SELECT
  USING (is_platform_admin());

-- ------------------------------------------------------------
-- 4. Dar de alta al usuario actual como platform admin
--    (ajustá el email si corresponde)
-- ------------------------------------------------------------
INSERT INTO platform_admins (user_id)
SELECT id FROM auth.users WHERE email = 'todotech.admin@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
