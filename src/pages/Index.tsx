import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Activity, Zap, Clock, AlertTriangle, Factory, Shield, CheckCircle2,
} from "lucide-react";
import {
  getFactoryKPIs, allLines, hourlyProduction, downtimeReasons, wipData,
  DENIM_DEFECTS, getFactoryInfo,
} from "@/data/mock-data";

const DEFECT_COLORS = [
  "hsl(0, 72%, 51%)", "hsl(38, 92%, 50%)", "hsl(280, 45%, 55%)",
  "hsl(200, 70%, 50%)", "hsl(142, 60%, 45%)", "hsl(330, 60%, 50%)", "hsl(60, 60%, 45%)",
];

export default function Dashboard() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const navigate = useNavigate();
  const factoryId = selectedFactory === "all" ? undefined : selectedFactory;
  const kpis = getFactoryKPIs(factoryId);
  const lines = factoryId ? allLines.filter(l => l.factoryId === factoryId) : allLines;
  const factoryInfo = getFactoryInfo(selectedFactory);

  const kpiCards = [
    { label: "Total Output", value: kpis.totalOutput.toLocaleString(), icon: TrendingUp, sub: `of ${kpis.totalTarget.toLocaleString()} target` },
    { label: "Avg Efficiency", value: `${kpis.avgEfficiency}%`, icon: Activity, sub: kpis.avgEfficiency >= 70 ? "On track" : "Below target" },
    { label: "Active Lines", value: kpis.activeLines, icon: Factory, sub: "Currently running" },
    { label: "Downtime", value: `${kpis.totalDowntime} min`, icon: Clock, sub: "Total today" },
    { label: "DHU", value: `${kpis.dhu}%`, icon: Shield, sub: `RFT ${kpis.rft}%` },
    { label: "Pending Alerts", value: kpis.pendingAlerts, icon: AlertTriangle, sub: "Unacknowledged" },
  ];

  const statusColor = (s: string) =>
    s === "normal" ? "bg-status-success" : s === "warning" ? "bg-status-warning" : "bg-status-critical";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time denim pant production overview · 8:00 AM – 7:00 PM</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold font-mono mt-1">{kpi.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</p>
                </div>
                <kpi.icon className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        ))}
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
              return (
                <div key={line.id} className="text-center p-2 rounded-lg border border-border/60 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => navigate(`/lines?line=${line.id}`)}>
                  <p className="text-[11px] font-bold font-mono">{line.name}</p>
                  <div className="h-12 w-full flex items-end justify-center mt-1">
                    <div className={`w-5 rounded-t-sm ${barColor} transition-all`} style={{ height: `${Math.max(line.efficiency, 10)}%` }} />
                  </div>
                  <p className="text-[11px] font-bold font-mono mt-1">{line.efficiency}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Production */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Hourly Denim Output — Predicted vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyProduction}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground)/0.1)" strokeDasharray="5 5" name="Target" />
                  <Area type="monotone" dataKey="predicted" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1)/0.15)" name="Predicted" />
                  <Area type="monotone" dataKey="actual" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.2)" name="Actual" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Downtime Pareto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Downtime Pareto Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={downtimeReasons.sort((a, b) => b.minutes - a.minutes).slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis dataKey="reason" type="category" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="minutes" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DHU + Denim Defect Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DHU & RFT Cards */}
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Shield className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Defects per Hundred Units</p>
                  <p className="text-3xl font-bold font-mono text-foreground">{kpis.dhu}</p>
                  <p className="text-[11px] text-muted-foreground">DHU Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-status-success/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-status-success" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Right First Time</p>
                  <p className="text-3xl font-bold font-mono text-status-success">{kpis.rft}%</p>
                  <p className="text-[11px] text-muted-foreground">Quality Pass Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Denim Defect Distribution Doughnut */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Denim Defect Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-[220px] w-[220px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DENIM_DEFECTS}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="defect"
                    >
                      {DENIM_DEFECTS.map((_, i) => (
                        <Cell key={i} fill={DEFECT_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {DENIM_DEFECTS.map((d, i) => (
                  <div key={d.defect} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: DEFECT_COLORS[i] }} />
                    <span className="text-xs text-foreground flex-1">{d.defect}</span>
                    <span className="text-xs font-mono text-muted-foreground">{d.count}</span>
                    <span className="text-xs font-mono font-semibold">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
                {lines.slice(0, 30).map(line => (
                  <TableRow key={line.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/lines?line=${line.id}`)}>
                    <TableCell className="font-medium font-mono text-sm">{line.name}</TableCell>
                    <TableCell className="text-sm">{line.style}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{line.target}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{line.actual}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{line.efficiency}%</TableCell>
                    <TableCell className="text-right font-mono text-sm">{line.operatorCount}</TableCell>
                    <TableCell className="text-center">
                      <div className={`h-3 w-3 rounded-full mx-auto ${statusColor(line.status)}`} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
