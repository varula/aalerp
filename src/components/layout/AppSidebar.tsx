import {
  LayoutDashboard,
  ClipboardList,
  Users,
  AlertTriangle,
  Factory,
  BarChart3,
  Monitor,
  Package,
  Gauge,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAlertRules } from "@/hooks/use-alert-rules";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Factory KPIs", url: "/kpis", icon: Gauge },
  { title: "Production Orders", url: "/orders", icon: ClipboardList },
  { title: "Sewing Lines", url: "/lines", icon: Factory },
  { title: "Operators", url: "/operators", icon: Users },
  { title: "Alerts & Andon", url: "/alerts", icon: AlertTriangle },
  { title: "WIP Tracking", url: "/wip", icon: Package },
];

const secondaryItems = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "TV Display", url: "/tv", icon: Monitor },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { triggeredAlerts } = useAlertRules();
  const criticalCount = triggeredAlerts.filter(a => a.severity === "critical").length;
  const totalTriggered = triggeredAlerts.length;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-5 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            AG
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h2 className="text-[15.5px] font-semibold text-foreground" style={{ letterSpacing: "-0.03em" }}>Armana Group</h2>
              <p className="text-[10px] text-muted-foreground">Denim Production</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const isAlerts = item.url === "/alerts";
                const badgeCount = isAlerts ? totalTriggered : 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="rounded-lg hover:bg-accent transition-colors"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <item.icon className="mr-2.5 h-[18px] w-[18px] opacity-70" />
                        {!collapsed && <span className="flex-1 text-[13px]">{item.title}</span>}
                        {isAlerts && badgeCount > 0 && (
                          <Badge
                            variant={criticalCount > 0 ? "destructive" : "secondary"}
                            className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center font-mono"
                          >
                            {badgeCount}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60 px-3">Views</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="rounded-lg hover:bg-accent transition-colors"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2.5 h-[18px] w-[18px] opacity-70" />
                      {!collapsed && <span className="text-[13px]">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground/40 text-center">v1.0 · Armana Group</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
