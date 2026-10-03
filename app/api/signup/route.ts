import { NextRequest, NextResponse } from "next/server";
import { signupApiSchema } from "@/schemas/signup.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify, randomSuffix } from "@/lib/slug";
import { sendEmail } from "@/lib/email/resend";
import { emailConfirmationEmail } from "@/lib/email/templates";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_SLUG_ATTEMPTS = 5;

// POST /api/signup — registra un negocio nuevo: crea el usuario (SIN
// confirmar todavía), su organización y lo deja como organization_admin de
// esa organización. El usuario queda inactivo hasta que confirme su email
// (ver /auth/callback) — así cualquiera que use un correo ajeno no puede
// terminar de activar la cuenta.
//
// Corre enteramente con la service role key porque es, por
// definición, la única operación que necesita "bootstrapear" una
// membresía desde cero — no hay forma de que esto pase por RLS
// normal (organizations_admin_write exige YA ser admin de la
// organización que se está por crear, y organization_members no
// tiene ninguna policy de escritura). El usuario que se crea acá
// nunca recibe más que su propia organización nueva.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Demasiados intentos de registro. Probá de nuevo en un rato." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = signupApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { business_name, email, password } = parsed.data;
  const admin = createAdminClient();

  // 1. Crear el usuario SIN confirmar + obtener el link de confirmación en
  // un solo paso. generateLink nunca manda el email solo — eso nos permite
  // usar nuestro propio template de Resend en vez del de Supabase.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { redirectTo: `${appUrl}/auth/callback` },
  });

  if (linkError || !linkData.user) {
    const alreadyExists = linkError?.message?.toLowerCase().includes("already");
    return NextResponse.json(
      { error: alreadyExists ? "Ese email ya está registrado" : "No se pudo crear la cuenta" },
      { status: alreadyExists ? 409 : 500 }
    );
  }

  const userId = linkData.user.id;
  const confirmUrl = linkData.properties.action_link;

  // 2. Crear la organización, resolviendo colisiones de slug con un sufijo
  const baseSlug = slugify(business_name) || "negocio";
  let organizationId: string | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${randomSuffix()}`;
    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: business_name,
        slug,
        description: null,
        phone: null,
        address: null,
        logo_url: null,
        timezone: "America/Argentina/Buenos_Aires",
        is_active: true,
      })
      .select("id")
      .single();

    if (!orgError && org) {
      organizationId = org.id;
      break;
    }

    // 23505 = unique_violation (slug repetido) — reintentar con otro sufijo
    if (orgError?.code !== "23505") {
      lastError = orgError?.message ?? "Error desconocido";
      break;
    }
  }

  if (!organizationId) {
    // Rollback: no dejar un usuario de auth huérfano sin organización
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: lastError ?? "No se pudo crear el negocio, intentá con otro nombre" },
      { status: 500 }
    );
  }

  // 3. Vincular al usuario como organization_admin de su nueva organización
  const { error: memberError } = await admin
    .from("organization_members")
    .insert({ user_id: userId, organization_id: organizationId, role: "organization_admin" });

  if (memberError) {
    // Rollback completo: sin membresía, ni el usuario ni la organización sirven
    await admin.from("organizations").delete().eq("id", organizationId);
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "No se pudo completar el registro" }, { status: 500 });
  }

  // 4. Mandar el email de confirmación — best effort: si falla, la cuenta
  // ya quedó creada igual, y el usuario puede intentar loguearse para
  // disparar un nuevo intento más adelante (o contactar soporte).
  const { subject, html } = emailConfirmationEmail({ businessName: business_name, confirmUrl });
  const emailSent = await sendEmail({ to: email, subject, html });

  return NextResponse.json({ success: true, emailSent }, { status: 201 });
}
