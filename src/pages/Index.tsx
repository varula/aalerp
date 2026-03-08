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
  TrendingUp, Activity, Zap, Clock, AlertTriangle, Factory,
} from "lucide-react";
import {
  getFactoryKPIs, allLines, hourlyProduction, downtimeReasons, wipData,
} from "@/data/mock-data";

export default function Dashboard() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const navigate = useNavigate();
  const factoryId = selectedFactory === "all" ? undefined : selectedFactory;
  const kpis = getFactoryKPIs(factoryId);
  const lines = factoryId ? allLines.filter(l => l.factoryId === factoryId) : allLines;

  const kpiCards = [
    { label: "Total Output", value: kpis.totalOutput.toLocaleString(), icon: TrendingUp, sub: `of ${kpis.totalTarget.toLocaleString()} target` },
    { label: "Avg Efficiency", value: `${kpis.avgEfficiency}%`, icon: Activity, sub: kpis.avgEfficiency >= 70 ? "On track" : "Below target" },
    { label: "Active Lines", value: kpis.activeLines, icon: Factory, sub: "Currently running" },
    { label: "Downtime", value: `${kpis.totalDowntime} min`, icon: Clock, sub: "Total today" },
    { label: "Pending Alerts", value: kpis.pendingAlerts, icon: AlertTriangle, sub: "Unacknowledged" },
  ];

  const statusColor = (s: string) =>
    s === "normal" ? "bg-status-success" : s === "warning" ? "bg-status-warning" : "bg-status-critical";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Factory Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time production overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Production */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Hourly Production — Predicted vs Actual</CardTitle>
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
                <BarChart data={downtimeReasons.sort((a, b) => b.minutes - a.minutes)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis dataKey="reason" type="category" width={120} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
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
                  <TableRow key={line.id}>
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
