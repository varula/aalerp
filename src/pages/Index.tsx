import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, Activity, Zap, Clock, AlertTriangle, Factory, Shield, CheckCircle2,
  DollarSign, Users, Truck, BarChart3, Layers,
} from "lucide-react";
import {
  downtimeReasons, wipData,
  DENIM_DEFECTS, getFactoryInfo, factoryLevelKPIs, getFactoryChartData,
} from "@/data/mock-data";
import { useSimulation } from "@/hooks/use-simulation-context";
import { AnimatedValue, LiveIndicator } from "@/components/AnimatedValue";
import { computeKPIs } from "@/lib/compute-kpis";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { PanelSection } from "@/components/dashboard/PanelSection";
import { EfficiencyTrendChart } from "@/components/dashboard/EfficiencyTrendChart";
import { DHUControlChart } from "@/components/dashboard/DHUControlChart";
import { LaborProductivityChart } from "@/components/dashboard/LaborProductivityChart";
import { ProductionFunnelChart } from "@/components/dashboard/ProductionFunnelChart";
import { LostTimeDonut } from "@/components/dashboard/LostTimeDonut";
import { QualityStackedChart } from "@/components/dashboard/QualityStackedChart";
import { AbsenteeismHeatmap } from "@/components/dashboard/AbsenteeismHeatmap";
import { TurnoverChart } from "@/components/dashboard/TurnoverChart";
import { ManMachineGauge } from "@/components/dashboard/ManMachineGauge";
import { HourlyOutputChart } from "@/components/dashboard/HourlyOutputChart";
import { DowntimeParetoChart } from "@/components/dashboard/DowntimeParetoChart";

export default function Dashboard() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const navigate = useNavigate();
  const factoryId = selectedFactory === "all" ? undefined : selectedFactory;
  const { lines: allSimLines, alerts: simAlerts, lastUpdate, updatedLineIds } = useSimulation();
  const lines = factoryId ? allSimLines.filter(l => l.factoryId === factoryId) : allSimLines;
  const factoryAlerts = factoryId ? simAlerts.filter(a => a.factoryId === factoryId) : simAlerts;
  const kpis = computeKPIs(lines, factoryAlerts);
  const factoryInfo = getFactoryInfo(selectedFactory);

  const fKPIs = factoryId ? factoryLevelKPIs.find(k => k.factoryId === factoryId) : undefined;
  const avg = (key: keyof typeof factoryLevelKPIs[0]) =>
    +(factoryLevelKPIs.reduce((s, k) => s + Number(k[key]), 0) / factoryLevelKPIs.length).toFixed(1);
  const fk = {
    efficiency: fKPIs ? fKPIs.factoryEfficiency : kpis.avgEfficiency,
    laborProd: fKPIs ? fKPIs.overallLaborProductivity : avg("overallLaborProductivity"),
    otd: fKPIs ? fKPIs.onTimeDeliveryRate : avg("onTimeDeliveryRate"),
    rft: fKPIs ? fKPIs.rftQuality : kpis.rft,
    dhu: fKPIs ? fKPIs.dhuPercent : kpis.dhu,
    costSmv: fKPIs ? fKPIs.costPerStandardMinute : avg("costPerStandardMinute"),
  };

  const chartData = getFactoryChartData(factoryId);
  const sparkEff = chartData.efficiencyTrend.map(d => d.efficiency);

  const statusColor = (s: string) =>
    s === "normal" ? "bg-status-success" : s === "warning" ? "bg-status-warning" : "bg-status-critical";

  return (
    <div className="space-y-8 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{factoryInfo.name}</h1>
          <p className="text-sm text-muted-foreground">Executive Command Center · Real-time Production Overview</p>
        </div>
        <LiveIndicator lastUpdate={lastUpdate} />
      </div>

      {/* TOP: KEY KPI GAUGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GaugeCard label="Factory Efficiency" value={Number(fk.efficiency)} unit="%" target={75} icon={Activity} trend="up" trendValue="+2.1%" sparkData={sparkEff} />
        <GaugeCard label="On Time Delivery" value={Number(fk.otd)} unit="%" target={95} icon={Truck} trend="flat" trendValue="0%" />
        <GaugeCard label="RFT Quality" value={Number(fk.rft)} unit="%" target={97} icon={CheckCircle2} trend="up" trendValue="+0.3%" />
        <GaugeCard label="DHU Rate" value={Number(fk.dhu)} unit="%" icon={Shield} trend="down" trendValue="-0.2%" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Output" value={kpis.totalOutput.toLocaleString()} sub={`of ${kpis.totalTarget.toLocaleString()} target`} icon={TrendingUp} iconColor="text-chart-2" />
        <StatCard label="Active Lines" value={kpis.activeLines} sub="Currently running" icon={Factory} iconColor="text-chart-1" />
        <StatCard label="Total Downtime" value={`${kpis.totalDowntime} min`} sub="Today" icon={Clock} iconColor="text-chart-3" />
        <StatCard label="Pending Alerts" value={kpis.pendingAlerts} sub="Unacknowledged" icon={AlertTriangle} iconColor="text-chart-5" />
      </div>

      {/* PANEL 1: PRODUCTIVITY */}
      <PanelSection title="Productivity" subtitle="Factory efficiency trends and labor performance" accentColor="bg-chart-2" icon={<BarChart3 className="h-4 w-4 text-chart-2" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <EfficiencyTrendChart factoryId={factoryId} />
          </div>
          <ManMachineGauge factoryId={factoryId} />
        </div>
        <div className="grid grid-cols-1">
          <LaborProductivityChart factoryId={factoryId} />
        </div>
      </PanelSection>

      {/* PANEL 2: PRODUCTION FLOW */}
      <PanelSection title="Production Flow" subtitle="Cut to ship pipeline and hourly output tracking" accentColor="bg-chart-4" icon={<Layers className="h-4 w-4 text-chart-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProductionFunnelChart factoryId={factoryId} />
          <HourlyOutputChart factoryId={factoryId} />
        </div>
      </PanelSection>

      {/* LINE STATUS */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            Live Line Status
            <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{lines.length} lines</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
            {lines.slice(0, 16).map(line => {
              const barColor = line.efficiency >= 70 ? "bg-status-success" : line.efficiency >= 55 ? "bg-status-warning" : "bg-status-critical";
              const isUpdated = updatedLineIds.has(line.id);
              return (
                <div key={line.id}
                  className={`text-center p-2 rounded-xl border border-border/40 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group ${isUpdated ? "animate-value-flash" : ""}`}
                  onClick={() => navigate(`/lines?line=${line.id}`)}>
                  <p className="text-[11px] font-bold font-mono text-muted-foreground group-hover:text-foreground transition-colors">{line.name}</p>
                  <div className="h-12 w-full flex items-end justify-center mt-1">
                    <div className={`w-5 rounded-t-sm ${barColor} transition-all duration-700 group-hover:w-6`} style={{ height: `${Math.max(line.efficiency, 10)}%` }} />
                  </div>
                  <AnimatedValue value={`${line.efficiency}%`} className="text-[11px] font-bold font-mono mt-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* PANEL 3: QUALITY */}
      <PanelSection title="Quality" subtitle="DHU control, defect analysis, and quality performance" accentColor="bg-chart-5" icon={<Shield className="h-4 w-4 text-chart-5" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DHUControlChart factoryId={factoryId} />
          <QualityStackedChart factoryId={factoryId} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DowntimeParetoChart />
          <LostTimeDonut factoryId={factoryId} />
        </div>
      </PanelSection>

      {/* PANEL 4: WORKFORCE */}
      <PanelSection title="Workforce" subtitle="Attendance patterns and employee retention" accentColor="bg-chart-3" icon={<Users className="h-4 w-4 text-chart-3" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AbsenteeismHeatmap factoryId={factoryId} />
          <TurnoverChart factoryId={factoryId} />
        </div>
      </PanelSection>

      {/* AI BOTTLENECK */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-status-warning/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-status-warning" />
            </div>
            AI Bottleneck Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {wipData.map(w => (
              <div key={w.operation}
                className={`p-3 rounded-xl border transition-all ${w.isBottleneck ? "border-status-critical/40 bg-status-critical/5 shadow-sm" : "border-border/40 hover:border-primary/20"}`}>
                <p className="text-xs font-semibold truncate text-foreground">{w.operation}</p>
                <p className="text-xl font-bold font-mono mt-1">{w.wipBundles}</p>
                <p className="text-[10px] text-muted-foreground">WIP bundles</p>
                {w.isBottleneck && (
                  <Badge variant="destructive" className="mt-1.5 text-[9px] px-1.5 py-0.5">⚠ Bottleneck</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LINE PERFORMANCE TABLE */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Factory className="h-4 w-4 text-primary" />
            </div>
            Line Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-auto rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Line</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Style</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Target</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Actual</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Efficiency</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Operators</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.slice(0, 20).map(line => {
                  const isUpdated = updatedLineIds.has(line.id);
                  return (
                    <TableRow key={line.id} className={`cursor-pointer hover:bg-muted/30 transition-colors border-border/30 ${isUpdated ? "animate-value-flash" : ""}`} onClick={() => navigate(`/lines?line=${line.id}`)}>
                      <TableCell className="font-semibold font-mono text-sm">{line.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{line.style}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{line.target}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <AnimatedValue value={line.actual} className="font-mono" />
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono text-sm font-semibold ${line.efficiency >= 70 ? "text-emerald-600 dark:text-emerald-400" : line.efficiency >= 55 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                          <AnimatedValue value={`${line.efficiency}%`} className="font-mono" />
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{line.operatorCount}</TableCell>
                      <TableCell className="text-center">
                        <div className={`h-2.5 w-2.5 rounded-full mx-auto ring-2 ring-background transition-colors duration-500 ${statusColor(line.status)}`} />
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
