-- ============================================================
-- Mi Turno Ya — Fase 6: Clientes como entidad propia
-- ============================================================
-- customers queda separada de los campos libres client_name/
-- client_phone/client_email que ya tiene appointments (esos se
-- conservan como registro histórico de lo que se cargó en cada
-- reserva puntual). customer_id es el vínculo deduplicado por
-- teléfono dentro de cada organización.
--
-- customers NO tiene política pública: un visitante anónimo no
-- debe poder leer nombres/teléfonos de otros clientes. El alta o
-- actualización del cliente al reservar se hace server-side con
-- la service role key (bypassea RLS a propósito, de forma
-- controlada), no desde el navegador.
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

CREATE TABLE customers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  phone            TEXT NOT NULL,
  email            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, phone)
);

CREATE INDEX idx_customers_organization ON customers (organization_id);

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Solo el organization_admin puede leer/gestionar los clientes de su negocio.
-- No hay política pública a propósito.
CREATE POLICY "customers_admin_read"
  ON customers FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

CREATE POLICY "customers_admin_write"
  ON customers FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'organization_admin'
    )
  );

-- ------------------------------------------------------------
-- Vínculo opcional desde appointments
-- ------------------------------------------------------------
ALTER TABLE appointments ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX idx_appointments_customer ON appointments (customer_id) WHERE customer_id IS NOT NULL;
