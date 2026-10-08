-- ============================================================
-- Mi Turno Ya — Fase 12: reserva ordenada por profesional primero
-- ============================================================
-- La portada pública ahora es solo un CTA ("Reservar turno"); el
-- flujo pasa a ser Sede → Profesional → Servicio. Para que el paso
-- de servicio muestre solo lo que ESE profesional realmente ofrece
-- (no el catálogo completo del negocio) hace falta la RPC inversa a
-- public_list_professionals_for_service (Fase 6).
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

CREATE OR REPLACE FUNCTION public_list_services_for_professional(
  p_organization_id UUID,
  p_professional_id UUID
)
RETURNS SETOF services AS $$
  SELECT s.* FROM services s
  JOIN professional_services ps ON ps.service_id = s.id
  WHERE s.organization_id = p_organization_id
    AND s.is_active = true
    AND ps.professional_id = p_professional_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public_list_services_for_professional(UUID, UUID) TO anon, authenticated;
