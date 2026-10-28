-- El default de organizations.timezone quedó en Buenos Aires desde el
-- esquema inicial, pero el mercado real de Mi Turno Ya es Colombia. El
-- signup ya pasa timezone explícito en cada insert, así que este default
-- solo aplica como red de seguridad (inserts manuales, futuras herramientas).
ALTER TABLE organizations
  ALTER COLUMN timezone SET DEFAULT 'America/Bogota';
