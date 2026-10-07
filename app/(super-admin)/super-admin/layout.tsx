import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/shared/logout-button";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: admin } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-pizarra-50">
      <header className="bg-pizarra-950">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">Mi Turno Ya</span>
            <span className="text-xs font-medium text-lila-400 bg-lila-950 px-2 py-0.5 rounded-full">
              Super Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-pizarra-400 hidden sm:block">{user.email}</span>
            <LogoutButton className="p-1.5 rounded-lg text-pizarra-400 hover:text-status-danger hover:bg-white/5 transition-colors" />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
