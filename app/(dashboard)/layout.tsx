import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardContext } from "@/lib/dashboard-context";
import NavBar from "@/components/shared/nav-bar";
import PageTransition from "@/components/shared/page-transition";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const ctx = await getDashboardContext();

  return (
    <div className="min-h-screen bg-pizarra-50">
      <NavBar userEmail={user.email ?? ""} role={ctx?.role ?? "professional"} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
