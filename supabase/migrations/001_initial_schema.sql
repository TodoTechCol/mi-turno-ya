-- ============================================================
-- Mi Turno Ya — Migración inicial
-- ============================================================
-- Ejecutar en: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. BUSINESSES
-- ============================================================
CREATE TABLE businesses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  phone        TEXT,
  address      TEXT,
  logo_url     TEXT,
  timezone     TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. PROFESSIONALS
-- ============================================================
CREATE TABLE professionals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  bio          TEXT,
  avatar_url   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. SERVICES
-- ============================================================
CREATE TABLE services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  duration_minutes  INTEGER NOT NULL CHECK (duration_minutes > 0),
  price             NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. PROFESSIONAL_SERVICES (muchos-a-muchos)
-- ============================================================
CREATE TABLE professional_services (
  professional_id  UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_id       UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (professional_id, service_id)
);

-- ============================================================
-- 5. SCHEDULES (horarios semanales)
-- ============================================================
CREATE TABLE schedules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week      INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT schedules_times_check CHECK (start_time < end_time),
  UNIQUE (professional_id, day_of_week)
);

-- ============================================================
-- 6. SCHEDULE_BLOCKS (ausencias puntuales)
-- ============================================================
CREATE TABLE schedule_blocks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  start_datetime   TIMESTAMPTZ NOT NULL,
  end_datetime     TIMESTAMPTZ NOT NULL,
  reason           TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT schedule_blocks_times_check CHECK (start_datetime < end_datetime)
);

-- ============================================================
-- 7. APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  professional_id  UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
  service_id       UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  client_name      TEXT NOT NULL,
  client_phone     TEXT NOT NULL,
  client_email     TEXT,
  start_datetime   TIMESTAMPTZ NOT NULL,
  end_datetime     TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT appointments_times_check CHECK (start_datetime < end_datetime)
);

-- ============================================================
-- 8. BUSINESS_USERS (roles dentro del negocio)
-- ============================================================
CREATE TABLE business_users (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id  UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('business_admin','professional')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, business_id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_appointments_professional_date
  ON appointments (professional_id, start_datetime)
  WHERE status != 'cancelled';

CREATE INDEX idx_appointments_business_date
  ON appointments (business_id, start_datetime);

CREATE INDEX idx_professionals_business
  ON professionals (business_id)
  WHERE is_active = true;

CREATE INDEX idx_services_business
  ON services (business_id)
  WHERE is_active = true;

CREATE INDEX idx_schedules_professional_day
  ON schedules (professional_id, day_of_week)
  WHERE is_active = true;

CREATE INDEX idx_schedule_blocks_professional
  ON schedule_blocks (professional_id, start_datetime);

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE businesses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users   ENABLE ROW LEVEL SECURITY;

-- Helper function: obtiene el business_id del usuario autenticado
CREATE OR REPLACE FUNCTION auth_user_business_id()
RETURNS UUID AS $$
  SELECT business_id FROM business_users
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ---------- businesses ----------
-- Lectura pública (cualquiera puede ver negocios activos)
CREATE POLICY "businesses_public_read"
  ON businesses FOR SELECT
  USING (is_active = true);

-- Solo el admin del negocio puede modificar
CREATE POLICY "businesses_admin_write"
  ON businesses FOR ALL
  USING (
    id IN (
      SELECT business_id FROM business_users
      WHERE user_id = auth.uid() AND role = 'business_admin'
    )
  );

-- ---------- professionals ----------
CREATE POLICY "professionals_public_read"
  ON professionals FOR SELECT
  USING (is_active = true);

CREATE POLICY "professionals_admin_write"
  ON professionals FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM business_users
      WHERE user_id = auth.uid() AND role = 'business_admin'
    )
  );

-- ---------- services ----------
CREATE POLICY "services_public_read"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "services_admin_write"
  ON services FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM business_users
      WHERE user_id = auth.uid() AND role = 'business_admin'
    )
  );

-- ---------- professional_services ----------
CREATE POLICY "professional_services_public_read"
  ON professional_services FOR SELECT
  USING (true);

-- ---------- schedules ----------
CREATE POLICY "schedules_public_read"
  ON schedules FOR SELECT
  USING (is_active = true);

CREATE POLICY "schedules_admin_write"
  ON schedules FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM business_users
      WHERE user_id = auth.uid() AND role = 'business_admin'
    )
  );

-- ---------- schedule_blocks ----------
CREATE POLICY "schedule_blocks_public_read"
  ON schedule_blocks FOR SELECT
  USING (true);

CREATE POLICY "schedule_blocks_admin_write"
  ON schedule_blocks FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM business_users
      WHERE user_id = auth.uid() AND role = 'business_admin'
    )
  );

-- ---------- appointments ----------
-- Inserción pública (clientes anónimos pueden crear turnos)
CREATE POLICY "appointments_public_insert"
  ON appointments FOR INSERT
  WITH CHECK (true);

-- Lectura: solo usuarios del mismo negocio
CREATE POLICY "appointments_business_read"
  ON appointments FOR SELECT
  USING (
    business_id = auth_user_business_id()
  );

-- Actualización: solo usuarios del negocio
CREATE POLICY "appointments_business_update"
  ON appointments FOR UPDATE
  USING (
    business_id = auth_user_business_id()
  );

-- ---------- business_users ----------
CREATE POLICY "business_users_self_read"
  ON business_users FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================
-- DATOS DE DEMO (opcional — comentar en producción)
-- ============================================================

-- Negocio demo
INSERT INTO businesses (id, name, slug, description, phone, address)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Barbería El Maestro',
  'el-maestro',
  'La mejor barbería del barrio. Cortes clásicos y modernos.',
  '+54 11 1234-5678',
  'Av. Corrientes 1234, CABA'
);

-- Servicio demo
INSERT INTO services (id, business_id, name, description, duration_minutes, price)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Corte de cabello', 'Corte clásico con tijera o máquina', 30, 3500),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Barba', 'Diseño y perfilado de barba', 20, 2000),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Corte + Barba', 'Combo corte y barba', 45, 5000);

-- Profesional demo
INSERT INTO professionals (id, business_id, name, bio)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Carlos Martínez',
  '10 años de experiencia. Especialista en fade y cortes modernos.'
);

-- Asociar servicios al profesional
INSERT INTO professional_services (professional_id, service_id)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003');

-- Horario semanal (Lunes a Sábado, 9:00-19:00)
INSERT INTO schedules (professional_id, business_id, day_of_week, start_time, end_time)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 1, '09:00', '19:00'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 2, '09:00', '19:00'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 3, '09:00', '19:00'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 4, '09:00', '19:00'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 5, '09:00', '19:00'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 6, '09:00', '14:00');
