import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, Activity, Zap, Clock, AlertTriangle, Factory, Shield, CheckCircle2,
  DollarSign, Users, Truck, Target,
} from "lucide-react";
import {
  hourlyProduction, downtimeReasons, wipData,
  DENIM_DEFECTS, getFactoryInfo, factoryLevelKPIs,
} from "@/data/mock-data";
import { useSimulation } from "@/hooks/use-simulation-context";
import { AnimatedValue, LiveIndicator } from "@/components/AnimatedValue";
import { computeKPIs } from "@/lib/compute-kpis";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { EfficiencyTrendChart } from "@/components/dashboard/EfficiencyTrendChart";
import { DHUControlChart } from "@/components/dashboard/DHUControlChart";
import { LaborProductivityChart } from "@/components/dashboard/LaborProductivityChart";
import { ProductionFunnelChart } from "@/components/dashboard/ProductionFunnelChart";
import { LostTimeDonut } from "@/components/dashboard/LostTimeDonut";
import { QualityStackedChart } from "@/components/dashboard/QualityStackedChart";
import { AbsenteeismHeatmap } from "@/components/dashboard/AbsenteeismHeatmap";
import { TurnoverChart } from "@/components/dashboard/TurnoverChart";

const DEFECT_COLORS = [
  "hsl(0, 72%, 51%)", "hsl(38, 92%, 50%)", "hsl(280, 45%, 55%)",
  "hsl(200, 70%, 50%)", "hsl(142, 60%, 45%)", "hsl(330, 60%, 50%)", "hsl(60, 60%, 45%)",
];

export default function Dashboard() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const navigate = useNavigate();
  const factoryId = selectedFactory === "all" ? undefined : selectedFactory;
  const { lines: allSimLines, alerts: simAlerts, lastUpdate, updatedLineIds } = useSimulation();
  const lines = factoryId ? allSimLines.filter(l => l.factoryId === factoryId) : allSimLines;
  const factoryAlerts = factoryId ? simAlerts.filter(a => a.factoryId === factoryId) : simAlerts;
  const kpis = computeKPIs(lines, factoryAlerts);
  const factoryInfo = getFactoryInfo(selectedFactory);

  // Use factory-level KPIs (average across all or single factory)
  const fKPIs = factoryId
    ? factoryLevelKPIs.find(k => k.factoryId === factoryId)
    : undefined;
  const avgFKPI = fKPIs || {
    factoryEfficiency: kpis.avgEfficiency,
    overallLaborProductivity: +(factoryLevelKPIs.reduce((s, k) => s + k.overallLaborProductivity, 0) / factoryLevelKPIs.length).toFixed(1),
    costPerStandardMinute: +(factoryLevelKPIs.reduce((s, k) => s + k.costPerStandardMinute, 0) / factoryLevelKPIs.length).toFixed(3),
    onTimeDeliveryRate: +(factoryLevelKPIs.reduce((s, k) => s + k.onTimeDeliveryRate, 0) / factoryLevelKPIs.length).toFixed(1),
    rftQuality: kpis.rft,
    dhuPercent: kpis.dhu,
    lostTimePercent: +(factoryLevelKPIs.reduce((s, k) => s + k.lostTimePercent, 0) / factoryLevelKPIs.length).toFixed(1),
    workerAbsenteeismRate: +(factoryLevelKPIs.reduce((s, k) => s + k.workerAbsenteeismRate, 0) / factoryLevelKPIs.length).toFixed(1),
    manToMachineRatio: +(factoryLevelKPIs.reduce((s, k) => s + k.manToMachineRatio, 0) / factoryLevelKPIs.length).toFixed(2),
    cutToShipRatio: +(factoryLevelKPIs.reduce((s, k) => s + k.cutToShipRatio, 0) / factoryLevelKPIs.length).toFixed(1),
  };

  const statusColor = (s: string) =>
    s === "normal" ? "bg-status-success" : s === "warning" ? "bg-status-warning" : "bg-status-critical";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time denim pant production overview · 8:00 AM – 7:00 PM</p>
        </div>
        <LiveIndicator lastUpdate={lastUpdate} />
      </div>

      {/* ═══════════════════ TOP: GAUGE KPI CARDS ═══════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <GaugeCard label="Factory Efficiency" value={Number(avgFKPI.factoryEfficiency)} unit="%" target={75} icon={Activity} />
        <GaugeCard label="Labor Productivity" value={Number(avgFKPI.overallLaborProductivity)} unit=" pcs/op" icon={Users} />
        <GaugeCard label="On Time Delivery" value={Number(avgFKPI.onTimeDeliveryRate)} unit="%" target={95} icon={Truck} />
        <GaugeCard label="RFT Quality" value={Number(avgFKPI.rftQuality)} unit="%" target={97} icon={CheckCircle2} />
        <GaugeCard label="DHU" value={Number(avgFKPI.dhuPercent)} unit="%" icon={Shield} />
        <GaugeCard label="Cost / SMV" value={Number((Number(avgFKPI.costPerStandardMinute) * 100).toFixed(1))} unit="¢" icon={DollarSign} />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Output", value: kpis.totalOutput.toLocaleString(), sub: `of ${kpis.totalTarget.toLocaleString()} target`, icon: TrendingUp },
          { label: "Active Lines", value: kpis.activeLines, sub: "Currently running", icon: Factory },
          { label: "Total Downtime", value: `${kpis.totalDowntime} min`, sub: "Today", icon: Clock },
          { label: "Pending Alerts", value: kpis.pendingAlerts, sub: "Unacknowledged", icon: AlertTriangle },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className="h-8 w-8 text-primary/30 shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
                <AnimatedValue value={kpi.value} className="text-xl font-bold font-mono" />
                <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══════ PANEL 1: PRODUCTIVITY ═══════ */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <div className="h-1 w-4 rounded-full bg-primary" />
          Productivity Panel
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EfficiencyTrendChart />
          <LaborProductivityChart />
        </div>
      </div>

      {/* ═══════ PANEL 2: PRODUCTION FLOW ═══════ */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <div className="h-1 w-4 rounded-full bg-chart-2" />
          Production Flow Panel
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionFunnelChart />
          {/* Hourly Production */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Hourly Output — Predicted vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyProduction}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Legend />
                    <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground)/0.1)" strokeDasharray="5 5" name="Target" />
                    <Area type="monotone" dataKey="predicted" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.15)" name="Predicted" />
                    <Area type="monotone" dataKey="actual" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.2)" name="Actual" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Line Status Quick View */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Line Status Quick View
            <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{lines.length} lines</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
            {lines.slice(0, 16).map(line => {
              const barColor = line.efficiency >= 70 ? "bg-status-success" : line.efficiency >= 55 ? "bg-status-warning" : "bg-status-critical";
              const isUpdated = updatedLineIds.has(line.id);
              return (
                <div key={line.id} className={`text-center p-2 rounded-lg border border-border/60 hover:border-primary/40 transition-all cursor-pointer ${isUpdated ? "animate-value-flash" : ""}`} onClick={() => navigate(`/lines?line=${line.id}`)}>
                  <p className="text-[11px] font-bold font-mono">{line.name}</p>
                  <div className="h-12 w-full flex items-end justify-center mt-1">
                    <div className={`w-5 rounded-t-sm ${barColor} transition-all duration-500`} style={{ height: `${Math.max(line.efficiency, 10)}%` }} />
                  </div>
                  <AnimatedValue value={`${line.efficiency}%`} className="text-[11px] font-bold font-mono mt-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══════ PANEL 3: QUALITY ═══════ */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <div className="h-1 w-4 rounded-full bg-chart-5" />
          Quality Panel
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DHUControlChart />
          <QualityStackedChart />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defect Pareto */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Defect Pareto — Top Denim Defects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={downtimeReasons.sort((a, b) => b.minutes - a.minutes).slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis dataKey="reason" type="category" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="minutes" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} name="Minutes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <LostTimeDonut />
        </div>
      </div>

      {/* ═══════ PANEL 4: WORKFORCE ═══════ */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <div className="h-1 w-4 rounded-full bg-chart-3" />
          Workforce Panel
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AbsenteeismHeatmap />
          <TurnoverChart />
        </div>
      </div>

      {/* Bottleneck Detection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-status-warning" />
            AI Bottleneck Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {wipData.map(w => (
              <div
                key={w.operation}
                className={`p-3 rounded-lg border ${w.isBottleneck ? "border-status-critical/50 bg-status-critical/5" : "border-border"}`}
              >
                <p className="text-xs font-medium truncate">{w.operation}</p>
                <p className="text-lg font-bold font-mono">{w.wipBundles}</p>
                <p className="text-[10px] text-muted-foreground">WIP bundles</p>
                {w.isBottleneck && (
                  <Badge variant="destructive" className="mt-1 text-[10px] px-1.5 py-0">Bottleneck</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Line Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Line</TableHead>
                  <TableHead className="text-xs">Style</TableHead>
                  <TableHead className="text-xs text-right">Target</TableHead>
                  <TableHead className="text-xs text-right">Actual</TableHead>
                  <TableHead className="text-xs text-right">Efficiency</TableHead>
                  <TableHead className="text-xs text-right">Operators</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.slice(0, 30).map(line => {
                  const isUpdated = updatedLineIds.has(line.id);
                  return (
                  <TableRow key={line.id} className={`cursor-pointer hover:bg-muted/50 transition-colors ${isUpdated ? "animate-value-flash" : ""}`} onClick={() => navigate(`/lines?line=${line.id}`)}>
                    <TableCell className="font-medium font-mono text-sm">{line.name}</TableCell>
                    <TableCell className="text-sm">{line.style}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{line.target}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <AnimatedValue value={line.actual} className="font-mono" />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <AnimatedValue value={`${line.efficiency}%`} className="font-mono" />
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{line.operatorCount}</TableCell>
                    <TableCell className="text-center">
                      <div className={`h-3 w-3 rounded-full mx-auto transition-colors duration-500 ${statusColor(line.status)}`} />
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
