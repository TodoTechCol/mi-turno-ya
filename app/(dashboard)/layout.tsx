import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardContext } from "@/lib/dashboard-context";
import Sidebar from "@/components/shared/sidebar";
import PageTransition from "@/components/shared/page-transition";
import PendingApproval from "./pending-approval";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const ctx = await getDashboardContext();

  if (ctx && !ctx.organizationActive) {
    return <PendingApproval organizationName={ctx.organizationName} />;
  }

  return (
    <div className="min-h-screen bg-pizarra-50 md:flex">
      <Sidebar organizationName={ctx?.organizationName ?? ""} role={ctx?.role ?? "professional"} />
      <main className="flex-1 min-w-0 max-w-5xl mx-auto px-4 py-6">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
