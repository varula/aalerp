import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TrendingUp, Activity, Zap, Clock, AlertTriangle, Factory, Shield,
  Users, Timer,
} from "lucide-react";
import {
  wipData, getFactoryInfo, factoryLevelKPIs, getFactoryChartData,
} from "@/data/mock-data";
import { useSimulation } from "@/hooks/use-simulation-context";
import { AnimatedValue, LiveIndicator } from "@/components/AnimatedValue";
import { computeKPIs } from "@/lib/compute-kpis";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EfficiencyTrendChart } from "@/components/dashboard/EfficiencyTrendChart";
import { OvertimeSectionChart } from "@/components/dashboard/OvertimeSectionChart";

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
    rft: fKPIs ? fKPIs.rftQuality : kpis.rft,
    dhu: fKPIs ? fKPIs.dhuPercent : kpis.dhu,
    otPercent: fKPIs ? fKPIs.overtimePercent : avg("overtimePercent"),
    totalOT: fKPIs ? fKPIs.totalOvertimeHours : Math.round(factoryLevelKPIs.reduce((s, k) => s + k.totalOvertimeHours, 0)),
  };

  const chartData = getFactoryChartData(factoryId);
  const sparkEff = chartData.efficiencyTrend.map(d => d.efficiency);

  const statusColor = (s: string) =>
    s === "normal" ? "bg-status-success" : s === "warning" ? "bg-status-warning" : "bg-status-critical";

  return (
    <div className="space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{factoryInfo.name}</h1>
          <p className="text-sm text-muted-foreground">Executive Command Center</p>
        </div>
        <LiveIndicator lastUpdate={lastUpdate} />
      </div>

      {/* TOP KPI GAUGES — 4 essential */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GaugeCard label="Efficiency" value={Number(fk.efficiency)} unit="%" target={75} icon={Activity} trend="up" trendValue="+2.1%" sparkData={sparkEff} />
        <GaugeCard label="RFT Quality" value={Number(fk.rft)} unit="%" target={97} icon={Shield} trend="up" trendValue="+0.3%" />
        <GaugeCard label="DHU Rate" value={Number(fk.dhu)} unit="%" icon={AlertTriangle} trend="down" trendValue="-0.2%" />
        <GaugeCard label="OT Hours" value={Number(fk.otPercent)} unit="%" icon={Timer} trend="up" trendValue={`${fk.totalOT}h total`} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Output" value={kpis.totalOutput.toLocaleString()} sub={`of ${kpis.totalTarget.toLocaleString()} target`} icon={TrendingUp} iconColor="text-chart-2" />
        <StatCard label="Active Lines" value={kpis.activeLines} sub="Currently running" icon={Factory} iconColor="text-chart-1" />
        <StatCard label="Total Downtime" value={`${kpis.totalDowntime} min`} sub="Today" icon={Clock} iconColor="text-chart-3" />
        <StatCard label="Pending Alerts" value={kpis.pendingAlerts} sub="Unacknowledged" icon={AlertTriangle} iconColor="text-chart-5" />
      </div>

      {/* EFFICIENCY TREND + OT SECTION — two key charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EfficiencyTrendChart factoryId={factoryId} />
        <OvertimeSectionChart factoryId={factoryId} />
      </div>

      {/* LIVE LINE STATUS — compact visual */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-primary" />
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
                  className={`text-center p-1.5 rounded-xl border border-border/40 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group ${isUpdated ? "animate-value-flash" : ""}`}
                  onClick={() => navigate(`/lines?line=${line.id}`)}>
                  <p className="text-[10px] font-bold font-mono text-muted-foreground group-hover:text-foreground transition-colors">{line.name}</p>
                  <div className="h-10 w-full flex items-end justify-center mt-0.5">
                    <div className={`w-4 rounded-t-sm ${barColor} transition-all duration-700 group-hover:w-5`} style={{ height: `${Math.max(line.efficiency, 10)}%` }} />
                  </div>
                  <AnimatedValue value={`${line.efficiency}%`} className="text-[10px] font-bold font-mono mt-0.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* LINE PERFORMANCE TABLE */}
      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Factory className="h-3.5 w-3.5 text-primary" />
            </div>
            Line Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[360px] overflow-auto rounded-lg border border-border/30">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 border-border/40">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[70px]">Line</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Style</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right w-[70px]">Target</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right w-[70px]">Actual</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right w-[70px]">Eff %</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right w-[60px]">OT Hrs</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center w-[50px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.slice(0, 16).map((line, idx) => {
                  const isUpdated = updatedLineIds.has(line.id);
                  return (
                    <TableRow
                      key={line.id}
                      className={`cursor-pointer hover:bg-accent/50 transition-colors border-border/20 ${isUpdated ? "animate-value-flash" : ""} ${className={`cursor-pointer hover:bg-accent/50 transition-colors border-border/20 ${isUpdated ? "animate-value-flash" : ""} ${idx % 2 === 0 ? "bg-muted/40" : ""}`}}`}
                      onClick={() => navigate(`/lines?line=${line.id}`)}
                    >
                      <TableCell className="font-semibold font-mono text-xs py-2">{line.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2 truncate max-w-[140px]">{line.style}</TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums py-2">{line.target}</TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums py-2">
                        <AnimatedValue value={line.actual} className="font-mono" />
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <span className={`font-mono text-xs font-semibold tabular-nums ${line.efficiency >= 70 ? "text-status-success" : line.efficiency >= 55 ? "text-status-warning" : "text-status-critical"}`}>
                          <AnimatedValue value={`${line.efficiency}%`} className="font-mono" />
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums py-2">
                        <span className={line.overtimeHours > 2 ? "text-status-warning font-semibold" : ""}>
                          {line.overtimeHours}h
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2">
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
