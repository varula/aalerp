import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, CheckCircle2, AlertTriangle, TrendingUp, Eye } from "lucide-react";
import { qualityInspections, DENIM_DEFECTS, getFactoryInfo } from "@/data/mock-data";

const COLORS = ["hsl(0,72%,51%)", "hsl(38,92%,50%)", "hsl(280,45%,55%)", "hsl(200,70%,50%)", "hsl(142,60%,45%)", "hsl(330,60%,50%)", "hsl(60,60%,45%)"];

export default function QualityDashboard() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const factoryInfo = getFactoryInfo(selectedFactory);
  const inspections = qualityInspections.filter(i => selectedFactory === "all" || i.factoryId === selectedFactory);

  const totalInspected = inspections.reduce((s, i) => s + i.inspectedQty, 0);
  const totalDefects = inspections.reduce((s, i) => s + i.defectQty, 0);
  const avgDhu = totalInspected ? +(totalDefects / totalInspected * 100).toFixed(1) : 0;
  const passRate = inspections.length ? Math.round(inspections.filter(i => i.aqlResult === "Pass").length / inspections.length * 100) : 0;
  const failCount = inspections.filter(i => i.aqlResult === "Fail").length;

  const defectByType: Record<string, number> = {};
  inspections.forEach(i => i.defects.forEach(d => { defectByType[d.type] = (defectByType[d.type] || 0) + d.count; }));
  const defectChart = Object.entries(defectByType).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([type, count]) => ({ type, count }));

  const dailyDhu: Record<string, { total: number; defects: number }> = {};
  inspections.forEach(i => {
    if (!dailyDhu[i.date]) dailyDhu[i.date] = { total: 0, defects: 0 };
    dailyDhu[i.date].total += i.inspectedQty;
    dailyDhu[i.date].defects += i.defectQty;
  });
  const dhuTrend = Object.entries(dailyDhu).sort().map(([date, d]) => ({ date: date.slice(5), dhu: +(d.defects / d.total * 100).toFixed(1) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — Quality Dashboard</h1>
        <p className="text-sm text-muted-foreground">Quality metrics and inspection results</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg DHU", value: `${avgDhu}%`, icon: Shield, color: avgDhu < 3 ? "text-status-success" : "text-status-warning" },
          { label: "RFT Rate", value: `${(100 - avgDhu).toFixed(1)}%`, icon: CheckCircle2, color: "text-status-success" },
          { label: "AQL Pass Rate", value: `${passRate}%`, icon: TrendingUp, color: passRate >= 90 ? "text-status-success" : "text-status-warning" },
          { label: "AQL Failures", value: failCount, icon: AlertTriangle, color: failCount > 5 ? "text-status-critical" : "text-muted-foreground" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${kpi.color}`}>{kpi.value}</p>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-30`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Defect Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-[200px] w-[200px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={defectChart} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="count" nameKey="type">
                      {defectChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {defectChart.map((d, i) => (
                  <div key={d.type} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs flex-1 truncate">{d.type}</span>
                    <span className="text-xs font-mono font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">DHU Trend (7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dhuTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="dhu" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} name="DHU %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" /> Recent Inspections
            <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{inspections.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Inspector</TableHead>
                  <TableHead className="text-xs text-right">Inspected</TableHead>
                  <TableHead className="text-xs text-right">Defects</TableHead>
                  <TableHead className="text-xs text-right">DHU%</TableHead>
                  <TableHead className="text-xs text-center">AQL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.slice(0, 30).map(ins => (
                  <TableRow key={ins.id}>
                    <TableCell className="font-mono text-sm">{ins.id}</TableCell>
                    <TableCell className="text-sm">{ins.date}</TableCell>
                    <TableCell className="text-sm">{ins.inspector}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{ins.inspectedQty}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{ins.defectQty}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{ins.dhu}%</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={ins.aqlResult === "Pass" ? "default" : ins.aqlResult === "Fail" ? "destructive" : "secondary"} className="text-[10px]">
                        {ins.aqlResult}
                      </Badge>
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
