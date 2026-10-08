-- ============================================================
-- Mi Turno Ya — Logo del negocio (registro + "Mi negocio")
-- ============================================================
-- Bucket público de Storage para los logos. Todas las subidas/
-- borrados pasan por nuestras propias API routes con la service
-- role key (bypassea RLS), así que no hacen falta policies en
-- storage.objects: el browser nunca escribe ahí directamente.
-- Marcarlo "public" alcanza para que se pueda LEER sin auth vía
-- /storage/v1/object/public/... (ya habilitado en next.config.ts).
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 2097152, ARRAY['image/png', 'image/jpeg'])
ON CONFLICT (id) DO NOTHING;
