import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar, MobileSidebar } from "./app-sidebar";
import { SidebarProvider } from "./sidebar-context";
import { Topbar } from "./topbar";
import { CommandSearch } from "./command-search";

/**
 * Authenticated Super Admin shell.
 * Server component that composes client islands (sidebar/topbar) around
 * server-rendered page content.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex min-h-svh bg-background">
          <AppSidebar />
          <MobileSidebar />
          <CommandSearch />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-6 md:px-6 lg:px-8 lg:py-8">
              <div className="mx-auto w-full max-w-[1480px]">{children}</div>
            </main>
            <footer className="border-t border-border/70 px-4 py-4 text-xs text-muted-foreground md:px-8">
              <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-2">
                <span>© 2026 EduSphere School Management System · v2.0</span>
                <span>MongoDB Atlas · All systems operational</span>
              </div>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
