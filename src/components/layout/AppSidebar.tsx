import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Users, AlertTriangle, Factory, BarChart3,
  Monitor, Package, Gauge, Shield, Wrench, Eye, Brain, Boxes, Clock, Timer,
  Scissors, Truck, Settings, Database, ChevronDown, ChevronRight,
  Sparkles, Camera, FlaskConical, MapPin, UserCog, CalendarCheck,
  ClipboardCheck, ShieldCheck, Building, Warehouse, FileText, CalendarRange,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAlertRules } from "@/hooks/use-alert-rules";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

type AppRole = "admin" | "manager" | "supervisor" | "operator";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
  minRole?: AppRole; // minimum role required to see this item
}

interface NavSection {
  label: string;
  minRole?: AppRole; // minimum role required to see entire section
  items: NavItem[];
}

const ROLE_LEVEL: Record<AppRole, number> = {
  admin: 4,
  manager: 3,
  supervisor: 2,
  operator: 1,
};

const sections: NavSection[] = [
  {
    label: "MAIN",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Factory KPIs", url: "/kpis", icon: Gauge, minRole: "supervisor" },
      { title: "Cutting Dept", url: "/dept/cutting", icon: Scissors },
      { title: "Sewing Dept", url: "/dept/sewing", icon: Factory },
      { title: "Finishing Dept", url: "/dept/finishing", icon: Package },
    ],
  },
  {
    label: "PRODUCTION",
    items: [
      { title: "Production Orders", url: "/orders", icon: ClipboardList },
      { title: "Sewing Lines", url: "/lines", icon: Factory },
      { title: "WIP Tracking", url: "/wip", icon: Package },
      { title: "Cut to Pack", url: "/cut-to-pack", icon: Scissors, minRole: "supervisor" },
      { title: "Hourly Production", url: "/hourly-production", icon: Clock },
      { title: "Planning", url: "/planning", icon: CalendarRange, minRole: "manager" },
      { title: "Planning Overview", url: "/planning-overview", icon: BarChart3, minRole: "manager" },
    ],
  },
  {
    label: "QUALITY",
    items: [
      { title: "Quality Dashboard", url: "/quality", icon: Shield },
      { title: "Inspections", url: "/inspections", icon: Eye },
      { title: "Defect Analysis", url: "/defects", icon: AlertTriangle, minRole: "supervisor" },
    ],
  },
  {
    label: "RESOURCES",
    minRole: "supervisor",
    items: [
      { title: "Operators", url: "/operators", icon: Users },
      { title: "Machines & IoT", url: "/machines", icon: Wrench },
      { title: "Skill Matrix", url: "/skills", icon: UserCog, minRole: "manager" },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck, minRole: "manager" },
    ],
  },
  {
    label: "MIS MODULES",
    minRole: "supervisor",
    items: [
      { title: "Pre Production", url: "/modules/pre-production", icon: ClipboardCheck },
      { title: "Cutting Production", url: "/modules/cutting-production", icon: Scissors },
      { title: "Cutting Quality", url: "/modules/cutting-quality", icon: ShieldCheck },
      { title: "Sewing Production", url: "/modules/sewing-production", icon: Factory },
      { title: "Sewing Quality", url: "/modules/sewing-quality", icon: ShieldCheck },
      { title: "Finishing Production", url: "/modules/finishing-production", icon: Package },
      { title: "Finishing Quality", url: "/modules/finishing-quality", icon: ShieldCheck },
      { title: "General Activities", url: "/modules/general", icon: Building },
      { title: "Stores Activities", url: "/modules/stores", icon: Warehouse },
    ],
  },
  {
    label: "AI & AUTOMATION",
    minRole: "manager",
    items: [
      { title: "AI Predictions", url: "/ai-predictions", icon: Brain },
      { title: "CV Counting", url: "/cv-counting", icon: Camera },
      { title: "Defect Detection", url: "/ai-defects", icon: Sparkles },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { title: "Overtime", url: "/overtime", icon: Timer, minRole: "supervisor" },
      { title: "Downtime Tracking", url: "/downtime", icon: Clock },
      { title: "Alerts & Andon", url: "/alerts", icon: AlertTriangle },
      { title: "Material Tracking", url: "/materials", icon: Boxes, minRole: "supervisor" },
    ],
  },
  {
    label: "ANALYTICS",
    minRole: "manager",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Buyer Analytics", url: "/buyer-analytics", icon: Truck },
    ],
  },
  {
    label: "ADVANCED",
    minRole: "admin",
    items: [
      { title: "Digital Twin", url: "/digital-twin", icon: FlaskConical },
      { title: "Benchmarking", url: "/benchmarking", icon: MapPin },
    ],
  },
  {
    label: "OTHERS",
    items: [
      { title: "Master Data", url: "/master-data", icon: Database, minRole: "admin" },
      { title: "Settings", url: "/settings", icon: Settings, minRole: "admin" },
      { title: "TV Display", url: "/tv", icon: Monitor },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { triggeredAlerts } = useAlertRules();
  const { role } = useAuth();
  const criticalCount = triggeredAlerts.filter(a => a.severity === "critical").length;
  const totalTriggered = triggeredAlerts.length;

  const userLevel = role ? ROLE_LEVEL[role] : 1;
  const canSee = (minRole?: AppRole) => !minRole || userLevel >= ROLE_LEVEL[minRole];

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["MAIN", "PRODUCTION", "QUALITY", "RESOURCES", "OPERATIONS", "MIS MODULES"])
  );

  const toggleSection = (label: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-5 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
              AG
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <h2 className="text-[14px] font-semibold text-foreground truncate">Armana OS</h2>
              <p className="text-[10px] text-muted-foreground truncate">Operating System for Manufacturing Excellence</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-2">
        {sections.filter(s => canSee(s.minRole)).map(section => {
          const visibleItems = section.items.filter(i => canSee(i.minRole));
          if (visibleItems.length === 0) return null;
          const isOpen = openSections.has(section.label);
          return (
            <SidebarGroup key={section.label} className="py-0">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center w-full px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {isOpen ? <ChevronDown className="h-3 w-3 mr-1.5 opacity-50" /> : <ChevronRight className="h-3 w-3 mr-1.5 opacity-50" />}
                  {section.label}
                </button>
              )}
              {(collapsed || isOpen) && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map(item => {
                      const isAlerts = item.url === "/alerts";
                      const badgeCount = isAlerts ? totalTriggered : (item.badge || 0);
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              end={item.url === "/"}
                              className="rounded-lg hover:bg-accent/60 transition-colors border-l-2 border-transparent"
                              activeClassName="bg-accent text-accent-foreground font-medium !border-l-primary"
                            >
                              <item.icon className="mr-2.5 h-[15px] w-[15px] opacity-60 shrink-0" />
                              {!collapsed && <span className="flex-1 text-[12.5px] truncate">{item.title}</span>}
                              {isAlerts && badgeCount > 0 && (
                                <Badge
                                  variant={criticalCount > 0 ? "destructive" : "secondary"}
                                  className="ml-auto text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center"
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
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[11px] font-semibold">
              AG
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate">Armana OS</p>
              <p className="text-[10px] text-muted-foreground">v1.0 · Manufacturing Excellence</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
