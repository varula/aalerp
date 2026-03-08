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
          <h1 className="text-2xl font-semibold text-foreground">{factoryInfo.name}</h1>
          <p className="text-[13px] text-muted-foreground">Production Overview</p>
        </div>
        <LiveIndicator lastUpdate={lastUpdate} />
      </div>

      {/* TOP KPI GAUGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GaugeCard label="Efficiency" value={Number(fk.efficiency)} unit="%" target={75} icon={Activity} trend="up" trendValue="+2.1%" sparkData={sparkEff} />
        <GaugeCard label="RFT Quality" value={Number(fk.rft)} unit="%" target={97} icon={Shield} trend="up" trendValue="+0.3%" />
        <GaugeCard label="DHU Rate" value={Number(fk.dhu)} unit="%" icon={AlertTriangle} trend="down" trendValue="-0.2%" />
        <GaugeCard label="OT Hours" value={Number(fk.otPercent)} unit="%" icon={Timer} trend="up" trendValue={`${fk.totalOT}h total`} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Output" value={kpis.totalOutput.toLocaleString()} sub={`of ${kpis.totalTarget.toLocaleString()} target`} icon={TrendingUp} iconColor="text-status-success" />
        <StatCard label="Active Lines" value={kpis.activeLines} sub="Currently running" icon={Factory} iconColor="text-primary" />
        <StatCard label="Total Downtime" value={`${kpis.totalDowntime} min`} sub="Today" icon={Clock} iconColor="text-status-warning" />
        <StatCard label="Pending Alerts" value={kpis.pendingAlerts} sub="Unacknowledged" icon={AlertTriangle} iconColor="text-destructive" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EfficiencyTrendChart factoryId={factoryId} />
        <OvertimeSectionChart factoryId={factoryId} />
      </div>

      {/* LIVE LINE STATUS */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            Live Line Status
            <Badge variant="secondary" className="ml-auto text-[10px] rounded-full px-2.5">{lines.length} lines</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
            {lines.slice(0, 16).map(line => {
              const barColor = line.efficiency >= 70 ? "bg-status-success" : line.efficiency >= 55 ? "bg-status-warning" : "bg-status-critical";
              const isUpdated = updatedLineIds.has(line.id);
              return (
                <div key={line.id}
                  className={`text-center p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all cursor-pointer group ${isUpdated ? "animate-value-flash" : ""}`}
                  onClick={() => navigate(`/lines?line=${line.id}`)}>
                  <p className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{line.name}</p>
                  <div className="h-10 w-full flex items-end justify-center mt-1">
                    <div className={`w-3.5 rounded-t ${barColor} transition-all duration-700`} style={{ height: `${Math.max(line.efficiency, 10)}%` }} />
                  </div>
                  <AnimatedValue value={`${line.efficiency}%`} className="text-[10px] font-semibold mt-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* LINE PERFORMANCE TABLE */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
              <Factory className="h-4 w-4 text-primary" />
            </div>
            Line Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[360px] overflow-auto rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40">
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-[70px]">Line</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Style</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right w-[70px]">Target</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right w-[70px]">Actual</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right w-[70px]">Eff %</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right w-[60px]">OT Hrs</TableHead>
                  <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center w-[50px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.slice(0, 16).map((line, idx) => {
                  const isUpdated = updatedLineIds.has(line.id);
                  return (
                    <TableRow
                      key={line.id}
                      className={`cursor-pointer hover:bg-muted/60 transition-colors border-b border-border/20 ${isUpdated ? "animate-value-flash" : ""} ${idx % 2 === 0 ? "bg-muted/30" : ""}`}
                      onClick={() => navigate(`/lines?line=${line.id}`)}
                    >
                      <TableCell className="font-medium text-xs py-2.5">{line.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-2.5 truncate max-w-[140px]">{line.style}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums py-2.5">{line.target}</TableCell>
                      <TableCell className="text-right text-xs tabular-nums py-2.5">
                        <AnimatedValue value={line.actual} />
                      </TableCell>
                      <TableCell className="text-right py-2.5">
                        <span className={`text-xs font-medium tabular-nums ${line.efficiency >= 70 ? "text-status-success" : line.efficiency >= 55 ? "text-status-warning" : "text-status-critical"}`}>
                          <AnimatedValue value={`${line.efficiency}%`} />
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums py-2.5">
                        <span className={line.overtimeHours > 2 ? "text-status-warning font-medium" : ""}>
                          {line.overtimeHours}h
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2.5">
                        <div className={`h-2 w-2 rounded-full mx-auto transition-colors duration-500 ${statusColor(line.status)}`} />
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
