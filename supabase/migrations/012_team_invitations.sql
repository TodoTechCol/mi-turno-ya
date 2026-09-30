-- ============================================================
-- Mi Turno Ya — Fase 8: Invitaciones de equipo
-- ============================================================
-- Hasta ahora un professional se creaba SIN acceso propio al panel
-- (professionals.user_id siempre quedaba en null). Esta migración
-- agrega el circuito para que el organization_admin invite a un
-- profesional a loguearse: se genera un token, se manda por email
-- (server-side, con la service role key) y quien lo recibe define
-- su propia contraseña en /auth/accept-invite.
--
-- No hay política pública de lectura sobre organization_invitations
-- (contiene emails). La pantalla de aceptar invitación lee los datos
-- mínimos (nombre de organización, email, estado) a través de la
-- función pública de abajo, que exige conocer el token exacto —
-- mismo patrón que las RPC públicas de reservas (Fase 6).
--
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. Tabla de invitaciones
-- ------------------------------------------------------------
CREATE TABLE organization_invitations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  professional_id  UUID REFERENCES professionals(id) ON DELETE CASCADE,
  email            TEXT NOT NULL,
  role             TEXT NOT NULL DEFAULT 'professional' CHECK (role IN ('organization_admin', 'professional')),
  token            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by       UUID NOT NULL REFERENCES auth.users(id),
  expires_at       TIMESTAMPTZ NOT NULL,
  accepted_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_org_invitations_token ON organization_invitations (token);
CREATE INDEX idx_org_invitations_organization ON organization_invitations (organization_id);
CREATE INDEX idx_org_invitations_professional ON organization_invitations (professional_id) WHERE professional_id IS NOT NULL;

ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Solo el organization_admin ve/gestiona las invitaciones de su propia organización.
CREATE POLICY "organization_invitations_admin_read"
  ON organization_invitations FOR SELECT
  USING (is_organization_admin(organization_id));

CREATE POLICY "organization_invitations_admin_write"
  ON organization_invitations FOR ALL
  USING (is_organization_admin(organization_id))
  WITH CHECK (is_organization_admin(organization_id));

-- ------------------------------------------------------------
-- 2. RPC pública: leer UNA invitación por su token exacto.
--    No expone nada si no se conoce el token (no es un listado).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public_get_invitation_by_token(p_token TEXT)
RETURNS TABLE (
  email TEXT,
  role TEXT,
  status TEXT,
  organization_name TEXT,
  expires_at TIMESTAMPTZ
) AS $$
  SELECT oi.email, oi.role, oi.status, o.name, oi.expires_at
  FROM organization_invitations oi
  JOIN organizations o ON o.id = oi.organization_id
  WHERE oi.token = p_token;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 3. organization_members: falta la política de escritura para
--    admins (gap señalado en la auditoría de seguridad y dejado
--    pendiente a propósito hasta tener un caso de uso real). El
--    alta real durante /api/invitations/accept corre con la
--    service role key igual que el signup, pero esta política deja
--    el modelo consistente con el resto de las tablas del sistema
--    y habilita, a futuro, gestión directa desde el panel.
-- ------------------------------------------------------------
CREATE POLICY "organization_members_admin_write"
  ON organization_members FOR ALL
  USING (is_organization_admin(organization_id))
  WITH CHECK (is_organization_admin(organization_id));
