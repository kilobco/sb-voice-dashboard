import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
