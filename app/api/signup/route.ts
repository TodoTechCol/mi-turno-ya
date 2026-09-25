import { NextRequest, NextResponse } from "next/server";
import { signupApiSchema } from "@/schemas/signup.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify, randomSuffix } from "@/lib/slug";

const MAX_SLUG_ATTEMPTS = 5;

// POST /api/signup — registra un negocio nuevo: crea el usuario, su
// organización y lo deja como organization_admin de esa organización.
//
// Corre enteramente con la service role key porque es, por
// definición, la única operación que necesita "bootstrapear" una
// membresía desde cero — no hay forma de que esto pase por RLS
// normal (organizations_admin_write exige YA ser admin de la
// organización que se está por crear, y organization_members no
// tiene ninguna policy de escritura). El usuario que se crea acá
// nunca recibe más que su propia organización nueva.
export async function POST(request: NextRequest) {
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

  // 1. Crear el usuario de auth
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError || !userData.user) {
    const alreadyExists = userError?.message?.toLowerCase().includes("already");
    return NextResponse.json(
      { error: alreadyExists ? "Ese email ya está registrado" : "No se pudo crear la cuenta" },
      { status: alreadyExists ? 409 : 500 }
    );
  }

  const userId = userData.user.id;

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

  return NextResponse.json({ success: true }, { status: 201 });
}
