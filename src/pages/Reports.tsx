import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  FileSpreadsheet, FileText, Download, TrendingUp, TrendingDown,
  Clock, Activity, BarChart3,
} from "lucide-react";
import { allLines, downtimeReasons, hourlyProduction, factories } from "@/data/mock-data";
import { useToast } from "@/hooks/use-toast";

// --- Mock report data generators ---
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildDailyProduction(factoryFilter: string) {
  const lines = allLines.filter(l => factoryFilter === "all" || l.factoryId === factoryFilter);
  return DAYS.map((day, i) => {
    const factor = 0.85 + Math.sin(i * 0.8) * 0.12;
    const totalTarget = lines.reduce((s, l) => s + l.target, 0);
    const totalActual = Math.round(totalTarget * factor);
    return { day, target: totalTarget, actual: totalActual, efficiency: Math.round((totalActual / totalTarget) * 100) };
  });
}

function buildLineEfficiency(factoryFilter: string) {
  return allLines
    .filter(l => factoryFilter === "all" || l.factoryId === factoryFilter)
    .map(l => ({ name: l.name, efficiency: l.efficiency, target: 75, style: l.style, status: l.status }))
    .sort((a, b) => a.efficiency - b.efficiency);
}

function buildDowntimeBreakdown(factoryFilter: string) {
  const colors = [
    "hsl(var(--status-critical))", "hsl(var(--status-warning))", "hsl(var(--primary))",
    "hsl(210 40% 60%)", "hsl(210 30% 70%)", "hsl(210 20% 75%)",
    "hsl(210 15% 80%)", "hsl(210 10% 85%)", "hsl(210 5% 88%)", "hsl(210 5% 90%)",
  ];
  return downtimeReasons.map((d, i) => ({
    ...d,
    fill: colors[i] || "hsl(var(--muted))",
    pct: 0,
  })).map((d, _, arr) => {
    const total = arr.reduce((s, x) => s + x.minutes, 0);
    return { ...d, pct: Math.round((d.minutes / total) * 100) };
  });
}

function buildShiftReport(factoryFilter: string) {
  const lines = allLines.filter(l => factoryFilter === "all" || l.factoryId === factoryFilter);
  const shifts = ["Morning (6–14)", "Afternoon (14–22)", "Night (22–6)"];
  return shifts.map((shift, i) => {
    const factor = i === 0 ? 1.0 : i === 1 ? 0.92 : 0.78;
    const output = Math.round(lines.reduce((s, l) => s + l.actual, 0) * factor);
    const target = lines.reduce((s, l) => s + l.target, 0);
    return { shift, output, target, efficiency: Math.round((output / target) * 100), operators: lines.reduce((s, l) => s + l.operatorCount, 0) };
  });
}

export default function Reports() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [reportPeriod, setReportPeriod] = useState("daily");
  const { toast } = useToast();

  const dailyData = buildDailyProduction(selectedFactory);
  const lineEfficiency = buildLineEfficiency(selectedFactory);
  const downtimeData = buildDowntimeBreakdown(selectedFactory);
  const shiftData = buildShiftReport(selectedFactory);

  const totalOutput = dailyData.reduce((s, d) => s + d.actual, 0);
  const totalTarget = dailyData.reduce((s, d) => s + d.target, 0);
  const avgEfficiency = Math.round((totalOutput / totalTarget) * 100);
  const totalDowntime = downtimeData.reduce((s, d) => s + d.minutes, 0);

  const handleExport = (type: "excel" | "pdf") => {
    toast({
      title: `${type.toUpperCase()} Export Started`,
      description: `Your ${reportPeriod} report is being generated as ${type.toUpperCase()}. Download will begin shortly.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Production analytics, efficiency & downtime reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            <FileText className="h-4 w-4 mr-1.5" /> PDF
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Output</p>
              <p className="text-xl font-bold font-mono">{totalOutput.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-status-success/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-status-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Efficiency</p>
              <p className="text-xl font-bold font-mono">{avgEfficiency}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-status-warning/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Downtime</p>
              <p className="text-xl font-bold font-mono">{totalDowntime} min</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lines Analyzed</p>
              <p className="text-xl font-bold font-mono">{lineEfficiency.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="production" className="space-y-4">
        <TabsList>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
          <TabsTrigger value="shift">Shift Analysis</TabsTrigger>
        </TabsList>

        {/* --- Production Tab --- */}
        <TabsContent value="production" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Output — Target vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend />
                      <Bar dataKey="target" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[4, 4, 0, 0]} name="Target" />
                      <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Hourly Production Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyProduction}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Legend />
                      <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" fillOpacity={0.3} name="Target" />
                      <Area type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeDasharray="5 5" name="Predicted" />
                      <Area type="monotone" dataKey="actual" stroke="hsl(var(--status-success))" fill="hsl(var(--status-success))" fillOpacity={0.2} name="Actual" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily summary table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Summary Table</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Day</TableHead>
                    <TableHead className="text-xs text-right">Target</TableHead>
                    <TableHead className="text-xs text-right">Actual</TableHead>
                    <TableHead className="text-xs text-right">Variance</TableHead>
                    <TableHead className="text-xs text-right">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyData.map(d => {
                    const variance = d.actual - d.target;
                    return (
                      <TableRow key={d.day}>
                        <TableCell className="font-medium">{d.day}</TableCell>
                        <TableCell className="text-right font-mono">{d.target.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">{d.actual.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={variance >= 0 ? "text-status-success" : "text-status-critical"}>
                            {variance >= 0 ? "+" : ""}{variance.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={d.efficiency >= 75 ? "default" : d.efficiency >= 60 ? "secondary" : "destructive"} className="font-mono">
                            {d.efficiency}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Efficiency Tab --- */}
        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Line Efficiency Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lineEfficiency.slice(0, 20)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis type="category" dataKey="name" width={55} className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="efficiency" radius={[0, 4, 4, 0]} name="Efficiency %">
                      {lineEfficiency.slice(0, 20).map((entry, i) => (
                        <Cell key={i} fill={entry.efficiency >= 75 ? "hsl(var(--status-success))" : entry.efficiency >= 60 ? "hsl(var(--status-warning))" : "hsl(var(--status-critical))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Line Efficiency Detail</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => handleExport("excel")}>
                  <Download className="h-3.5 w-3.5 mr-1" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Line</TableHead>
                      <TableHead className="text-xs">Style</TableHead>
                      <TableHead className="text-xs text-right">Efficiency</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                      <TableHead className="text-xs text-right">vs Target (75%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineEfficiency.map(l => {
                      const gap = l.efficiency - 75;
                      return (
                        <TableRow key={l.name}>
                          <TableCell className="font-mono font-medium">{l.name}</TableCell>
                          <TableCell className="text-sm">{l.style}</TableCell>
                          <TableCell className="text-right font-mono font-semibold">{l.efficiency}%</TableCell>
                          <TableCell className="text-center">
                            <div className={`h-2.5 w-2.5 rounded-full mx-auto ${l.status === "normal" ? "bg-status-success" : l.status === "warning" ? "bg-status-warning" : "bg-status-critical"}`} />
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            <span className={gap >= 0 ? "text-status-success" : "text-status-critical"}>
                              {gap >= 0 ? "+" : ""}{gap}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Downtime Tab --- */}
        <TabsContent value="downtime" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Downtime Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={downtimeData} dataKey="minutes" nameKey="reason" cx="50%" cy="50%" outerRadius={110} label={({ reason, pct }) => `${reason} (${pct}%)`} labelLine={false}>
                        {downtimeData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Downtime Pareto (Minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={downtimeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis type="category" dataKey="reason" width={120} className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="minutes" name="Minutes" radius={[0, 4, 4, 0]}>
                        {downtimeData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Downtime Detail</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Reason</TableHead>
                    <TableHead className="text-xs text-right">Minutes</TableHead>
                    <TableHead className="text-xs text-right">Occurrences</TableHead>
                    <TableHead className="text-xs text-right">% of Total</TableHead>
                    <TableHead className="text-xs text-right">Avg Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downtimeData.map(d => (
                    <TableRow key={d.reason}>
                      <TableCell className="font-medium">{d.reason}</TableCell>
                      <TableCell className="text-right font-mono">{d.minutes}</TableCell>
                      <TableCell className="text-right font-mono">{d.occurrences}</TableCell>
                      <TableCell className="text-right font-mono">{d.pct}%</TableCell>
                      <TableCell className="text-right font-mono">{(d.minutes / d.occurrences).toFixed(1)} min</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Shift Analysis Tab --- */}
        <TabsContent value="shift" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Shift Output Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="shift" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend />
                    <Bar dataKey="target" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[4, 4, 0, 0]} name="Target" />
                    <Bar dataKey="output" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Output" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Shift</TableHead>
                    <TableHead className="text-xs text-right">Output</TableHead>
                    <TableHead className="text-xs text-right">Target</TableHead>
                    <TableHead className="text-xs text-right">Efficiency</TableHead>
                    <TableHead className="text-xs text-right">Operators</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftData.map(s => (
                    <TableRow key={s.shift}>
                      <TableCell className="font-medium">{s.shift}</TableCell>
                      <TableCell className="text-right font-mono">{s.output.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{s.target.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={s.efficiency >= 75 ? "default" : s.efficiency >= 60 ? "secondary" : "destructive"} className="font-mono">
                          {s.efficiency}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{s.operators}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
