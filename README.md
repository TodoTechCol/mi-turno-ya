# Mi Turno Ya 🪒

Plataforma de reservas de turnos online — MVP para barbería, preparada para SaaS multi-empresa.

## Stack

- **Next.js 15** (App Router)
- **TypeScript** + **Zod**
- **Tailwind CSS** + diseño propio (sin shadcn)
- **Supabase** (PostgreSQL + Auth + Storage + RLS)
- **react-hook-form** + **date-fns** + **sonner**

---

## Setup rápido

### 1. Clonar e instalar

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completá el archivo `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Encontrás las keys en: **Supabase Dashboard → Project → Settings → API**

### 3. Crear la base de datos

En el **SQL Editor** de Supabase, ejecutá todo el contenido de:

```
supabase/migrations/001_initial_schema.sql
```

Esto crea las 8 tablas, índices, RLS policies y datos de demo.

### 4. Crear usuario administrador

En **Supabase → Authentication → Users → Add user**, creá un usuario con tu email y contraseña.

Luego en el SQL Editor, asocialo al negocio demo:

```sql
INSERT INTO business_users (user_id, business_id, role)
VALUES (
  '<tu-user-id>',   -- copia el ID del usuario recién creado
  'a0000000-0000-0000-0000-000000000001',
  'business_admin'
);
```

### 5. Levantar el servidor

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

---

## URLs de prueba

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000/el-maestro` | Página pública del negocio demo |
| `http://localhost:3000/el-maestro/booking` | Flujo de reserva (cliente) |
| `http://localhost:3000/auth/login` | Login del profesional |
| `http://localhost:3000/dashboard` | Panel de hoy |
| `http://localhost:3000/dashboard/appointments` | Todos los turnos |

---

## Estructura del proyecto

```
mi-turno-ya/
├── app/
│   ├── (public)/[slug]/          # Páginas públicas del negocio
│   │   ├── page.tsx              # Landing del negocio
│   │   ├── booking/page.tsx      # Wizard de reserva
│   │   └── confirmation/page.tsx # Confirmación
│   ├── (dashboard)/dashboard/    # Panel del profesional (auth requerida)
│   │   ├── page.tsx              # Turnos de hoy
│   │   └── appointments/page.tsx # Todos los turnos
│   ├── api/
│   │   ├── availability/route.ts # GET slots disponibles
│   │   └── appointments/route.ts # POST crear / PATCH estado
│   └── auth/
│       ├── login/page.tsx
│       └── callback/route.ts
├── components/
│   ├── booking/                  # Wizard step a step
│   └── dashboard/                # Cards, badges, updater
├── lib/
│   ├── supabase/                 # client.ts | server.ts | middleware.ts
│   ├── availability.ts           # Algoritmo de slots
│   └── utils.ts
├── services/                     # Acceso a datos (server)
├── types/                        # database.types.ts | app.types.ts
├── schemas/                      # Zod schemas
├── hooks/                        # use-availability | use-appointment
└── supabase/migrations/          # SQL schema completo
```

---

## Agregar un nuevo negocio

1. Insertá una fila en `businesses` con un `slug` único.
2. Insertá profesionales en `professionals`.
3. Insertá servicios en `services`.
4. Asociá con `professional_services`.
5. Definí horarios en `schedules`.
6. Creá el usuario admin en Supabase Auth y asocialo en `business_users`.

La URL pública será automáticamente: `https://tu-dominio.com/{slug}`

---

## Próximos pasos (roadmap SaaS)

- [ ] Notificaciones por WhatsApp / email (Resend + Twilio)
- [ ] Panel de configuración del negocio (horarios, servicios)
- [ ] Multi-profesional con filtro en el wizard
- [ ] Gestión de ausencias (vacaciones, licencias)
- [ ] Recordatorios automáticos 24h antes
- [ ] Planes de suscripción (Stripe)
- [ ] Métricas y reportes
