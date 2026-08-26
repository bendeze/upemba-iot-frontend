"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Activity, TerminalSquare, Cpu, Settings, LogOut, RadioTower, TrendingUp } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import Cookies from "js-cookie";

export function AppSidebar() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();

  // Dynamically resolve the native Edge User Identity payload through Next.js geometric query trees
  const { data: user } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await apiClient.get("/users/me/");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache profile strictly for 5 minutes
  });

  const terminateSession = () => {
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("access_token", { path: "/" });
    Cookies.remove("refresh_token", { path: "/" });
    router.push("/login");
  };

  const navItems = [
    { title: t("telemetry"), url: "/dashboard", icon: Activity },
    { title: t("predictions"), url: "/dashboard/predictions", icon: TrendingUp },
    { title: t("logs"), url: "/dashboard/logs", icon: TerminalSquare },
    { title: t("equipment"), url: "/dashboard/equipment", icon: Cpu },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r border-border/40 bg-background/50 backdrop-blur-md transition-all duration-300">
      <SidebarHeader className="h-16 flex justify-center border-b border-border/40 px-4 md:px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent cursor-default hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <RadioTower className="size-4 animate-pulse" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none px-2 overflow-hidden truncate">
                <span className="font-bold tracking-widest">{t("title")}</span>
                <span className="text-xs text-muted-foreground font-medium">{t("subtitle")}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="px-2 mt-6">
        <SidebarGroup>
          <SidebarMenu className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} />} isActive={isActive} tooltip={item.title} className="h-10 transition-colors">
                    <item.icon className={isActive ? "text-primary shadow-sm" : "text-muted-foreground"} />
                    <span className={isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground"}>
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4 space-y-4">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/dashboard/settings" />} tooltip={t("settings")} className="h-10 data-[active=true]:bg-sidebar-accent">
              <Settings className={pathname === "/dashboard/settings" ? "text-primary" : "text-muted-foreground"} />
              <span className={pathname === "/dashboard/settings" ? "font-bold" : "font-medium text-muted-foreground"}>
                {t("settings")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={terminateSession} tooltip={t("logout")} className="h-10 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
              <LogOut className="text-destructive mt-0.5" />
              <span className="font-bold tracking-wide">{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="pt-2 border-t border-border/30">
        {user ? (
          <div className="flex items-center gap-3 overflow-hidden rounded-md group hover:bg-sidebar-accent p-1.5 transition-colors">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="truncate text-sm font-bold text-foreground tracking-wide">
                {user.name || user.username}
              </span>
              <span className="truncate text-xs font-semibold text-muted-foreground">
                {user.email || "Edge CLI Operator"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-1.5 opacity-50">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-muted" />
            <div className="flex flex-col gap-1.5 w-full">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-2 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
