-- ============================================================
-- Mi Turno Ya — Link de reseñas de Google por negocio
-- ============================================================
-- Guarda el link que cada negocio ya tiene en su propio Google
-- Business Profile (Perfil de Negocio) para "dejar una reseña" — eso
-- se crea afuera de la plataforma, en google.com/business; acá solo
-- se guarda el link que Google les da para pedirlo.
-- Con esto configurado, cuando se marca un turno como "Completado"
-- se le manda automáticamente al cliente un email pidiéndole que
-- deje su reseña (ver services/notifications.service.ts).
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE organizations ADD COLUMN google_review_url TEXT;
