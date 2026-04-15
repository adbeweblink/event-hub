import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/modules/core/components/app-sidebar";
import { AppHeader } from "@/modules/core/components/app-header";
import { AuthGuard } from "@/modules/core/components/auth-guard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </AuthGuard>
  );
}
