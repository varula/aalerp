import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAll, CrudRecord } from "@/lib/crud-storage";
import {
  Scissors, Factory, Package, CalendarDays, Target, TrendingUp, Clock,
  AlertTriangle, BarChart3, Layers
} from "lucide-react";
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, addMonths, subMonths } from "date-fns";

// ── Types ──────────────────────────────────
type Department = "cutting" | "sewing" | "finishing";

interface DeptConfig {
  label: string;
  icon: React.ElementType;
  storageKey: string;
  plannedKey: string;
  actualKey: string;
  color: string;
  bgColor: string;
  barColor: string;
}

const DEPT_CONFIG: Record<Department, DeptConfig> = {
  cutting: {
    label: "Cutting",
    icon: Scissors,
    storageKey: "plan_cutting",
    plannedKey: "plannedCutQty",
    actualKey: "actualCutQty",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    barColor: "bg-blue-500",
  },
  sewing: {
    label: "Sewing",
    icon: Factory,
    storageKey: "plan_sewing",
    plannedKey: "plannedQty",
    actualKey: "actualQty",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    barColor: "bg-emerald-500",
  },
  finishing: {
    label: "Finishing",
    icon: Package,
    storageKey: "plan_finishing",
    plannedKey: "plannedFinishQty",
    actualKey: "actualFinishQty",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    barColor: "bg-amber-500",
  },
};

const DEPTS: Department[] = ["cutting", "sewing", "finishing"];

// ── Helpers ────────────────────────────────
function getStatusVariant(status: string) {
  switch (status) {
    case "Completed": return "default";
    case "In Progress": return "secondary";
    case "Delayed": case "Cancelled": return "destructive";
    default: return "outline" as const;
  }
}

function computeStats(records: CrudRecord[], cfg: DeptConfig) {
  const totalPlanned = records.reduce((s, r) => s + (Number(r[cfg.plannedKey]) || 0), 0);
  const totalActual = records.reduce((s, r) => s + (Number(r[cfg.actualKey]) || 0), 0);
  const achievement = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  const inProgress = records.filter(r => r.status === "In Progress").length;
  const delayed = records.filter(r => r.status === "Delayed").length;
  const completed = records.filter(r => r.status === "Completed").length;
  return { totalPlanned, totalActual, achievement, inProgress, delayed, completed, total: records.length };
}

// ── Summary Card ───────────────────────────
function DeptSummaryCard({ dept }: { dept: Department }) {
  const cfg = DEPT_CONFIG[dept];
  const Icon = cfg.icon;
  const records = useMemo(() => getAll(cfg.storageKey), [cfg.storageKey]);
  const stats = useMemo(() => computeStats(records, cfg), [records, cfg]);

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${cfg.barColor}`} />
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${cfg.bgColor} ${cfg.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{cfg.label} Plan</h3>
            <p className="text-[10px] text-muted-foreground">{stats.total} plans total</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground">Planned</p>
            <p className="text-base font-bold text-foreground">{stats.totalPlanned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Actual</p>
            <p className="text-base font-bold text-foreground">{stats.totalActual.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Achievement</span>
            <span className="text-xs font-bold text-foreground">{stats.achievement}%</span>
          </div>
          <Progress value={Math.min(stats.achievement, 100)} className="h-2" />
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Clock className="h-3 w-3" /> {stats.inProgress} active
          </Badge>
          {stats.delayed > 0 && (
            <Badge variant="destructive" className="text-[10px] gap-1">
              <AlertTriangle className="h-3 w-3" /> {stats.delayed} delayed
            </Badge>
          )}
          <Badge variant="default" className="text-[10px] gap-1">
            ✓ {stats.completed} done
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Gantt Chart ────────────────────────────
function GanttChart({ monthOffset }: { monthOffset: number }) {
  const baseDate = addMonths(new Date(), monthOffset);
  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Gather all plans with dates
  const allPlans = useMemo(() => {
    const plans: { record: CrudRecord; dept: Department; cfg: DeptConfig }[] = [];
    for (const dept of DEPTS) {
      const cfg = DEPT_CONFIG[dept];
      const records = getAll(cfg.storageKey);
      for (const r of records) {
        if (r.startDate && r.endDate) {
          plans.push({ record: r, dept, cfg });
        }
      }
    }
    return plans;
  }, [monthOffset]);

  // Group by style
  const grouped = useMemo(() => {
    const map = new Map<string, typeof allPlans>();
    for (const p of allPlans) {
      const key = p.record.styleNo || p.record.orderNo || p.record.id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [allPlans]);

  const totalDays = days.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Gantt Timeline — {format(baseDate, "MMMM yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row with days */}
          <div className="flex border-b border-border">
            <div className="w-[180px] shrink-0 px-3 py-2 text-[10px] font-medium text-muted-foreground border-r border-border">
              Style / Order
            </div>
            <div className="flex-1 flex">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center text-[9px] py-1.5 border-r border-border/50 ${
                    d.getDay() === 0 || d.getDay() === 6
                      ? "bg-muted/50 text-muted-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {format(d, "d")}
                </div>
              ))}
            </div>
          </div>

          {/* Plan rows */}
          {grouped.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No plans with start/end dates found. Add dates to your plans to see the Gantt timeline.
            </div>
          ) : (
            grouped.map(([key, plans]) => (
              <div key={key} className="flex border-b border-border/50 hover:bg-muted/30 transition-colors">
                <div className="w-[180px] shrink-0 px-3 py-2 border-r border-border">
                  <p className="text-xs font-medium text-foreground truncate">{key}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {plans.map(p => p.record.orderNo).filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="flex-1 relative" style={{ height: `${Math.max(plans.length * 22 + 8, 36)}px` }}>
                  {/* Weekend backgrounds */}
                  <div className="absolute inset-0 flex">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className={`flex-1 ${
                          d.getDay() === 0 || d.getDay() === 6 ? "bg-muted/30" : ""
                        }`}
                      />
                    ))}
                  </div>

                  {/* Bars */}
                  {plans.map((p, pi) => {
                    const start = parseISO(p.record.startDate);
                    const end = parseISO(p.record.endDate);
                    const barStart = Math.max(0, differenceInDays(start, monthStart));
                    const barEnd = Math.min(totalDays - 1, differenceInDays(end, monthStart));
                    if (barEnd < 0 || barStart >= totalDays) return null;

                    const leftPct = (Math.max(0, barStart) / totalDays) * 100;
                    const widthPct = ((barEnd - Math.max(0, barStart) + 1) / totalDays) * 100;

                    const planned = Number(p.record[p.cfg.plannedKey]) || 0;
                    const actual = Number(p.record[p.cfg.actualKey]) || 0;
                    const prog = planned > 0 ? Math.min(Math.round((actual / planned) * 100), 100) : 0;

                    return (
                      <div
                        key={p.record.id}
                        className={`absolute ${p.cfg.barColor} rounded-sm flex items-center px-1.5 overflow-hidden cursor-default`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top: `${pi * 22 + 4}px`,
                          height: "18px",
                          opacity: p.record.status === "Completed" ? 0.6 : 0.85,
                        }}
                        title={`${p.cfg.label}: ${p.record.styleNo} | ${p.record.status} | ${prog}%`}
                      >
                        {/* Progress fill */}
                        <div
                          className="absolute inset-0 bg-white/20"
                          style={{ width: `${prog}%` }}
                        />
                        <span className="text-[9px] text-white font-medium relative z-10 truncate">
                          {p.cfg.label.charAt(0)}: {p.record.styleNo || p.record.orderNo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Legend */}
          <div className="flex gap-4 px-4 py-3 border-t border-border">
            {DEPTS.map(d => (
              <div key={d} className="flex items-center gap-1.5">
                <div className={`w-3 h-2.5 rounded-sm ${DEPT_CONFIG[d].barColor}`} />
                <span className="text-[10px] text-muted-foreground">{DEPT_CONFIG[d].label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="w-3 h-2.5 rounded-sm bg-muted" />
              <span className="text-[10px] text-muted-foreground">Weekend</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Cross-Department Comparison ────────────
function ComparisonTable() {
  const data = useMemo(() => {
    // Group by styleNo across departments
    const styleMap = new Map<string, Record<string, any>>();
    for (const dept of DEPTS) {
      const cfg = DEPT_CONFIG[dept];
      const records = getAll(cfg.storageKey);
      for (const r of records) {
        const key = r.styleNo || r.orderNo;
        if (!key) continue;
        if (!styleMap.has(key)) {
          styleMap.set(key, { style: key, buyer: r.buyer, orderNo: r.orderNo });
        }
        const entry = styleMap.get(key)!;
        entry[`${dept}_planned`] = (entry[`${dept}_planned`] || 0) + (Number(r[cfg.plannedKey]) || 0);
        entry[`${dept}_actual`] = (entry[`${dept}_actual`] || 0) + (Number(r[cfg.actualKey]) || 0);
        entry[`${dept}_status`] = r.status;
      }
    }
    return Array.from(styleMap.values());
  }, []);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No plans found across departments. Add plans in the Planning Modules to see comparisons.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Cross-Department Style Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Style</th>
              <th className="text-left px-3 py-2 text-muted-foreground font-medium">Buyer</th>
              {DEPTS.map(d => (
                <th key={d} colSpan={2} className={`text-center px-2 py-2 font-medium ${DEPT_CONFIG[d].color}`}>
                  {DEPT_CONFIG[d].label}
                </th>
              ))}
            </tr>
            <tr className="border-b border-border bg-muted/30">
              <th /><th />
              {DEPTS.map(d => (
                <>
                  <th key={`${d}_p`} className="text-center px-2 py-1 text-[10px] text-muted-foreground">Plan</th>
                  <th key={`${d}_a`} className="text-center px-2 py-1 text-[10px] text-muted-foreground">Actual</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20">
                <td className="px-3 py-2 font-medium text-foreground">{row.style}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.buyer || "—"}</td>
                {DEPTS.map(d => {
                  const planned = row[`${d}_planned`] || 0;
                  const actual = row[`${d}_actual`] || 0;
                  const pct = planned > 0 ? Math.round((actual / planned) * 100) : 0;
                  return (
                    <>
                      <td key={`${d}_p`} className="text-center px-2 py-2 text-foreground">
                        {planned > 0 ? planned.toLocaleString() : "—"}
                      </td>
                      <td key={`${d}_a`} className="text-center px-2 py-2">
                        {planned > 0 ? (
                          <span className={pct >= 100 ? "text-emerald-600 font-medium" : pct >= 70 ? "text-foreground" : "text-destructive"}>
                            {actual.toLocaleString()} <span className="text-[10px]">({pct}%)</span>
                          </span>
                        ) : "—"}
                      </td>
                    </>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────
export default function PlanningOverview() {
  const [monthOffset, setMonthOffset] = useState(0);

  // Global KPIs
  const globalStats = useMemo(() => {
    let totalPlanned = 0, totalActual = 0, totalPlans = 0, totalDelayed = 0, totalInProgress = 0;
    for (const dept of DEPTS) {
      const cfg = DEPT_CONFIG[dept];
      const records = getAll(cfg.storageKey);
      totalPlans += records.length;
      totalPlanned += records.reduce((s, r) => s + (Number(r[cfg.plannedKey]) || 0), 0);
      totalActual += records.reduce((s, r) => s + (Number(r[cfg.actualKey]) || 0), 0);
      totalDelayed += records.filter(r => r.status === "Delayed").length;
      totalInProgress += records.filter(r => r.status === "In Progress").length;
    }
    const achievement = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
    return { totalPlanned, totalActual, totalPlans, totalDelayed, totalInProgress, achievement };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Planning Overview</h1>
        <p className="text-xs text-muted-foreground">
          Consolidated view of Cutting, Sewing & Finishing plans with timeline tracking
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary shrink-0">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Plans</p>
              <p className="text-lg font-bold text-foreground">{globalStats.totalPlans}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Planned</p>
              <p className="text-lg font-bold text-foreground">{globalStats.totalPlanned.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Actual</p>
              <p className="text-lg font-bold text-foreground">{globalStats.totalActual.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">{globalStats.achievement}% achieved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">In Progress</p>
              <p className="text-lg font-bold text-foreground">{globalStats.totalInProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Delayed</p>
              <p className="text-lg font-bold text-foreground">{globalStats.totalDelayed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Summaries Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {DEPTS.map(d => <DeptSummaryCard key={d} dept={d} />)}
      </div>

      {/* Gantt Timeline */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset(o => o - 1)}
            className="px-2 py-1 text-xs rounded border border-border hover:bg-muted text-foreground"
          >
            ← Prev
          </button>
          <button
            onClick={() => setMonthOffset(0)}
            className="px-2 py-1 text-xs rounded border border-border hover:bg-muted text-foreground"
          >
            Today
          </button>
          <button
            onClick={() => setMonthOffset(o => o + 1)}
            className="px-2 py-1 text-xs rounded border border-border hover:bg-muted text-foreground"
          >
            Next →
          </button>
        </div>
        <GanttChart monthOffset={monthOffset} />
      </div>

      {/* Cross-Department Comparison */}
      <ComparisonTable />
    </div>
  );
}
