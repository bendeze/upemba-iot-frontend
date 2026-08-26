import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/features/dashboard/AppSidebar";
import { TopNav } from "@/components/features/dashboard/TopNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col transition-all duration-300 ease-in-out bg-background relative overflow-x-hidden">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/95 backdrop-blur px-4 md:px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2 hover:bg-primary/10 transition-colors" />
            <div className="hidden lg:flex items-center text-sm font-bold tracking-wider text-foreground">
              <span>UPEMBA IOT</span>
            </div>
          </div>
          
          <TopNav />
        </header>
        
        <div className="flex-1 p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
