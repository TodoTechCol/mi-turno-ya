-- ============================================================
-- Mi Turno Ya — Fase 11: gestión de sedes (v1)
-- ============================================================
-- branches ya existía desde la Fase 5 (schema listo, sin UI). Se le
-- suman dos columnas informativas y una RPC pública acotada (mismo
-- patrón que professionals/services desde el cierre de enumeración
-- pública de la Fase 6) para que la reserva anónima pueda listar las
-- sedes activas de UNA organización sin poder enumerar las de otras.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE branches ADD COLUMN sector TEXT;
ALTER TABLE branches ADD COLUMN opening_hours TEXT;

CREATE OR REPLACE FUNCTION public_list_branches(p_organization_id UUID)
RETURNS SETOF branches AS $$
  SELECT * FROM branches
  WHERE organization_id = p_organization_id AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
