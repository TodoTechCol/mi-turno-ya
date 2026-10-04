-- ============================================================
-- Mi Turno Ya — Fase 9: profesionales necesitan leer services/professionals
-- ============================================================
-- Bug real encontrado al probar el panel de un professional con turnos
-- de verdad: /dashboard trae los turnos con un select anidado
-- (service:services(...), professional:professionals(...)). Esas dos
-- tablas solo tenían policy de lectura para organization_admin
-- (services_admin_write / professionals_admin_write, ambas FOR ALL)
-- desde que la Fase 6 cerró la lectura pública — nadie agregó nunca
-- una policy de lectura para professional. RLS filtra en silencio esa
-- relación anidada (no tira error), así que llegaba `null` y el
-- frontend explotaba al leer `apt.service.name` / `apt.professional.name`.
--
-- No es sensible que cualquier miembro de la organización (admin o
-- professional) vea el catálogo de servicios y a sus compañeros — es
-- justo lo que necesita para trabajar. Se agrega una policy de SOLO
-- LECTURA adicional para cualquier miembro de la organización; la
-- política de escritura sigue siendo exclusiva de organization_admin.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

CREATE POLICY "services_org_member_read"
  ON services FOR SELECT
  USING (organization_id IN (SELECT auth_user_organization_ids()));

CREATE POLICY "professionals_org_member_read"
  ON professionals FOR SELECT
  USING (organization_id IN (SELECT auth_user_organization_ids()));
