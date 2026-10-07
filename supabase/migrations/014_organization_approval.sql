-- ============================================================
-- Mi Turno Ya — Fase 10: aprobación manual de organizaciones nuevas
-- ============================================================
-- El signup público ahora crea la organización con is_active=false
-- (pendiente). Un platform_admin tiene que aprobarla desde
-- /super-admin (el mismo botón Activar que ya existía) antes de que
-- alguien pueda usar el dashboard.
--
-- approved_at distingue "nunca aprobada todavía" (NULL) de "aprobada
-- en algún momento, después desactivada" (tiene fecha) — así el panel
-- de Super Admin puede mostrar "Pendiente de aprobación" en vez de
-- "Inactiva" para una organización recién creada.
--
-- Las organizaciones que ya estaban activas (la demo, cualquier otra
-- ya aprobada de hecho) quedan marcadas como aprobadas retroactivamente
-- con su propia fecha de creación, para no romper nada existente.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE organizations ADD COLUMN approved_at TIMESTAMPTZ;

UPDATE organizations SET approved_at = created_at WHERE is_active = true;

-- ------------------------------------------------------------
-- Gap encontrado de paso: organizations_public_read exige is_active
-- = true, así que un professional (no admin) de una organización
-- pendiente no podía leer ni su propio registro de organización
-- (el organization_admin sí podía, vía organizations_admin_write).
-- Se agrega lectura para cualquier miembro, sin importar is_active —
-- mismo criterio que la Fase 9 para services/professionals.
-- ------------------------------------------------------------
CREATE POLICY "organizations_member_read"
  ON organizations FOR SELECT
  USING (id IN (SELECT auth_user_organization_ids()));
