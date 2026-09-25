-- ============================================================
-- Mi Turno Ya — professional_services: falta policy de escritura
-- ============================================================
-- Desde la migración 001, professional_services solo tuvo lectura
-- pública — nunca existió una policy que permitiera a un
-- organization_admin vincular/desvincular servicios de un
-- profesional. Sin esto, ni siquiera el dueño del negocio podía
-- gestionar esos vínculos vía RLS (solo con la service role key).
--
-- El WITH CHECK exige que el profesional Y el servicio pertenezcan
-- a la misma organización que administra quien hace el cambio —
-- mismo criterio que appointments_public_insert.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

CREATE POLICY "professional_services_admin_write"
  ON professional_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.id = professional_services.professional_id
        AND is_organization_admin(p.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professionals p
      JOIN services s ON s.organization_id = p.organization_id
      WHERE p.id = professional_services.professional_id
        AND s.id = professional_services.service_id
        AND is_organization_admin(p.organization_id)
    )
  );
