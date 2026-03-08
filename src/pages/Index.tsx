import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TrendingUp, Activity, Zap, Clock, AlertTriangle, Factory, Shield,
  Users, Timer, ArrowUpRight,
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
import { motion } from "framer-motion";

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: appleEase } },
} as const;

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: appleEase } },
} as const;

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
    <motion.div
      className="space-y-5 pb-8"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Production Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {factoryInfo.name} · Real-time monitoring
          </p>
        </div>
        <LiveIndicator lastUpdate={lastUpdate} />
      </motion.div>

      {/* TOP KPI GAUGES — 4 columns */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger}>
        <motion.div variants={fadeUp}>
          <GaugeCard label="Efficiency" value={Number(fk.efficiency)} unit="%" target={75} icon={Activity} trend="up" trendValue="+2.1%" sparkData={sparkEff} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <GaugeCard label="RFT Quality" value={Number(fk.rft)} unit="%" target={97} icon={Shield} trend="up" trendValue="+0.3%" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <GaugeCard label="DHU Rate" value={Number(fk.dhu)} unit="%" icon={AlertTriangle} trend="down" trendValue="-0.2%" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <GaugeCard label="OT Hours" value={Number(fk.otPercent)} unit="%" icon={Timer} trend="up" trendValue={`${fk.totalOT}h total`} />
        </motion.div>
      </motion.div>

      {/* Quick stats — 4 columns */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={stagger}>
        <motion.div variants={fadeUp}>
          <StatCard label="Total Output" value={kpis.totalOutput.toLocaleString()} sub={`of ${kpis.totalTarget.toLocaleString()} target`} icon={TrendingUp} iconColor="text-status-success" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Active Lines" value={kpis.activeLines} sub="Currently running" icon={Factory} iconColor="text-primary" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Total Downtime" value={`${kpis.totalDowntime} min`} sub="Today" icon={Clock} iconColor="text-status-warning" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Pending Alerts" value={kpis.pendingAlerts} sub="Unacknowledged" icon={AlertTriangle} iconColor="text-destructive" />
        </motion.div>
      </motion.div>

      {/* CHARTS ROW — Efficiency trend (wider) + Overtime */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={stagger}>
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <EfficiencyTrendChart factoryId={factoryId} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <OvertimeSectionChart factoryId={factoryId} />
        </motion.div>
      </motion.div>

      {/* LIVE LINE STATUS + LINE PERFORMANCE TABLE — side by side */}
      <motion.div className="grid grid-cols-1 xl:grid-cols-5 gap-4" variants={stagger}>
        {/* Live Line Status — compact grid */}
        <motion.div variants={fadeUp} className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                Live Line Status
                <Badge variant="secondary" className="ml-auto text-xs rounded-full px-2.5">{lines.length} lines</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid grid-cols-4 gap-2"
                variants={stagger}
              >
                {lines.slice(0, 16).map(line => {
                  const barColor = line.efficiency >= 70 ? "bg-status-success" : line.efficiency >= 55 ? "bg-status-warning" : "bg-status-critical";
                  const isUpdated = updatedLineIds.has(line.id);
                  return (
                    <motion.div
                      key={line.id}
                      variants={fadeUp}
                      className={`text-center p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all cursor-pointer group border border-transparent hover:border-border/60 ${isUpdated ? "animate-value-flash" : ""}`}
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/lines?line=${line.id}`)}
                    >
                      <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{line.name}</p>
                      <div className="h-10 w-full flex items-end justify-center mt-1">
                        <motion.div
                          className={`w-3.5 rounded-t ${barColor}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(line.efficiency, 10)}%` }}
                          transition={{ duration: 0.8, ease: appleEase, delay: 0.1 }}
                        />
                      </div>
                      <AnimatedValue value={`${line.efficiency}%`} className="text-xs font-semibold mt-1" />
                    </motion.div>
                  );
                })}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Line Performance Table */}
        <motion.div variants={fadeUp} className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Factory className="h-4 w-4 text-primary" />
                </div>
                Line Performance
                <button
                  onClick={() => navigate("/lines")}
                  className="ml-auto text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40">
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-[70px]">Line</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Style</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right w-[70px]">Target</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right w-[70px]">Actual</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right w-[70px]">Eff %</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right w-[60px]">OT</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center w-[50px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.slice(0, 16).map((line, idx) => {
                      const isUpdated = updatedLineIds.has(line.id);
                      return (
                        <TableRow
                          key={line.id}
                          className={`cursor-pointer hover:bg-muted/60 transition-colors border-b border-border/20 ${isUpdated ? "animate-value-flash" : ""} ${idx % 2 === 0 ? "bg-muted/20" : ""}`}
                          onClick={() => navigate(`/lines?line=${line.id}`)}
                        >
                        <TableCell className="font-medium text-sm py-2.5">{line.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground py-2.5 truncate max-w-[140px]">{line.style}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums py-2.5">{line.target}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums py-2.5">
                            <AnimatedValue value={line.actual} />
                          </TableCell>
                          <TableCell className="text-right py-2.5">
                            <span className={`text-sm font-medium tabular-nums ${line.efficiency >= 70 ? "text-status-success" : line.efficiency >= 55 ? "text-status-warning" : "text-status-critical"}`}>
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
