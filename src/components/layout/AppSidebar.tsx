import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Users, AlertTriangle, Factory, BarChart3,
  Monitor, Package, Gauge, Shield, Wrench, Eye, Brain, Boxes, Clock,
  Scissors, Truck, Settings, Database, ChevronDown, ChevronRight,
  Sparkles, Camera, FlaskConical, MapPin, UserCog, CalendarCheck,
  ClipboardCheck, ShieldCheck, Building, Warehouse, FileText, CalendarRange,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAlertRules } from "@/hooks/use-alert-rules";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

interface NavSection {
  label: string;
  items: { title: string; url: string; icon: React.ElementType; badge?: number }[];
}

const sections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Factory KPIs", url: "/kpis", icon: Gauge },
    ],
  },
  {
    label: "Production",
    items: [
      { title: "Production Orders", url: "/orders", icon: ClipboardList },
      { title: "Sewing Lines", url: "/lines", icon: Factory },
      { title: "WIP Tracking", url: "/wip", icon: Package },
      { title: "Cut to Pack", url: "/cut-to-pack", icon: Scissors },
      { title: "Planning", url: "/planning", icon: CalendarRange },
      { title: "Planning Overview", url: "/planning-overview", icon: BarChart3 },
    ],
  },
  {
    label: "Quality",
    items: [
      { title: "Quality Dashboard", url: "/quality", icon: Shield },
      { title: "Inspections", url: "/inspections", icon: Eye },
      { title: "Defect Analysis", url: "/defects", icon: AlertTriangle },
    ],
  },
  {
    label: "Resources",
    items: [
      { title: "Operators", url: "/operators", icon: Users },
      { title: "Machines & IoT", url: "/machines", icon: Wrench },
      { title: "Skill Matrix", url: "/skills", icon: UserCog },
      { title: "Attendance", url: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "MIS Modules",
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
    label: "AI & Automation",
    items: [
      { title: "AI Predictions", url: "/ai-predictions", icon: Brain },
      { title: "CV Counting", url: "/cv-counting", icon: Camera },
      { title: "Defect Detection", url: "/ai-defects", icon: Sparkles },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Downtime Tracking", url: "/downtime", icon: Clock },
      { title: "Alerts & Andon", url: "/alerts", icon: AlertTriangle },
      { title: "Material Tracking", url: "/materials", icon: Boxes },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Buyer Analytics", url: "/buyer-analytics", icon: Truck },
    ],
  },
  {
    label: "Advanced",
    items: [
      { title: "Digital Twin", url: "/digital-twin", icon: FlaskConical },
      { title: "Benchmarking", url: "/benchmarking", icon: MapPin },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Master Data", url: "/master-data", icon: Database },
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "TV Display", url: "/tv", icon: Monitor },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { triggeredAlerts } = useAlertRules();
  const criticalCount = triggeredAlerts.filter(a => a.severity === "critical").length;
  const totalTriggered = triggeredAlerts.length;

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["Overview", "Production", "Quality", "Resources", "Operations", "MIS Modules"])
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
      <SidebarHeader className="p-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shrink-0">
            AG
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15.5px] font-semibold text-foreground truncate" style={{ letterSpacing: "-0.03em" }}>Armana Group</h2>
              <p className="text-[10px] text-muted-foreground">Denim Production</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {sections.map(section => {
          const isOpen = openSections.has(section.label);
          return (
            <SidebarGroup key={section.label} className="py-0">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center w-full px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {isOpen ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                  {section.label}
                </button>
              )}
              {(collapsed || isOpen) && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map(item => {
                      const isAlerts = item.url === "/alerts";
                      const badgeCount = isAlerts ? totalTriggered : (item.badge || 0);
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              end={item.url === "/"}
                              className="rounded-lg hover:bg-accent transition-colors"
                              activeClassName="bg-accent text-accent-foreground font-medium"
                            >
                              <item.icon className="mr-2.5 h-[16px] w-[16px] opacity-70 shrink-0" />
                              {!collapsed && <span className="flex-1 text-[12.5px] truncate">{item.title}</span>}
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
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground/40 text-center">v1.0 · Armana Group</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
