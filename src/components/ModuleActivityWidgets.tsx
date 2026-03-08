import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAll } from "@/lib/crud-storage";
import { standaloneCrudModules } from "@/lib/standalone-modules";
import { Database, ClipboardList, Eye, Triangle, Users2, CalendarCheck, Bot, BarChart3, Box, Gauge, ServerCog, Settings } from "lucide-react";

const MODULE_ICONS: Record<string, React.ElementType> = {
  "cut-to-pack": ClipboardList,
  inspections: Eye,
  defects: Triangle,
  skills: Users2,
  attendance: CalendarCheck,
  "ai-defects": Bot,
  "buyer-analytics": BarChart3,
  "digital-twin": Box,
  benchmarking: Gauge,
  "master-data": ServerCog,
  settings: Settings,
};

export function ModuleActivityWidgets() {
  const navigate = useNavigate();

  const modules = Object.entries(standaloneCrudModules).map(([key, mod]) => {
    const records = getAll(mod.slug);
    const latest = records[0];
    const Icon = MODULE_ICONS[key] || Database;
    return { key, title: mod.title, section: mod.section, count: records.length, latest, Icon };
  });

  const withRecords = modules.filter(m => m.count > 0);
  const empty = modules.filter(m => m.count === 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Module Activity
          <Badge variant="secondary" className="ml-auto text-[10px] font-mono">
            {modules.reduce((s, m) => s + m.count, 0)} total records
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {[...withRecords, ...empty].map(m => (
            <div
              key={m.key}
              onClick={() => navigate(`/${m.key}`)}
              className="group p-3 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-accent/50 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <m.Icon className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
                <span className="text-[11px] font-medium text-foreground truncate">{m.title}</span>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{m.count}</p>
              <p className="text-[10px] text-muted-foreground">{m.section}</p>
              {m.latest && (
                <p className="text-[10px] text-muted-foreground mt-1 truncate">
                  Last: {new Date(m.latest.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
