import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { downtimeLogs, getFactoryInfo } from "@/data/mock-data";

export default function DowntimeTracking() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const factoryInfo = getFactoryInfo(selectedFactory);

  const logs = downtimeLogs
    .filter(l => selectedFactory === "all" || l.factoryId === selectedFactory)
    .filter(l => categoryFilter === "all" || l.category === categoryFilter);

  const totalMinutes = logs.reduce((s, l) => s + l.duration, 0);
  const resolvedCount = logs.filter(l => l.resolved).length;
  const unresolvedCount = logs.length - resolvedCount;

  // Pareto by reason
  const byReason: Record<string, number> = {};
  logs.forEach(l => { byReason[l.reason] = (byReason[l.reason] || 0) + l.duration; });
  const paretoData = Object.entries(byReason).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([reason, minutes]) => ({ reason, minutes }));

  // By category
  const byCat: Record<string, number> = {};
  logs.forEach(l => { byCat[l.category] = (byCat[l.category] || 0) + l.duration; });
  const catData = Object.entries(byCat).map(([cat, mins]) => ({ category: cat, minutes: mins }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — Downtime Tracking</h1>
        <p className="text-sm text-muted-foreground">Downtime analysis and root cause tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Downtime", value: `${totalMinutes} min`, icon: Clock, color: "text-status-warning" },
          { label: "Incidents", value: logs.length, icon: AlertTriangle, color: "text-foreground" },
          { label: "Resolved", value: resolvedCount, icon: CheckCircle2, color: "text-status-success" },
          { label: "Unresolved", value: unresolvedCount, icon: AlertTriangle, color: "text-status-critical" },
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Downtime by Reason (Pareto)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paretoData} layout="vertical">
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

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">By Category (5M)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="minutes" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 items-center">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Machine">Machine</SelectItem>
            <SelectItem value="Material">Material</SelectItem>
            <SelectItem value="Method">Method</SelectItem>
            <SelectItem value="Manpower">Manpower</SelectItem>
            <SelectItem value="Management">Management</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" /> Downtime Log
            <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{logs.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Reason</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-right">Duration</TableHead>
                  <TableHead className="text-xs text-center">Resolved</TableHead>
                  <TableHead className="text-xs">Action Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 40).map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.id}</TableCell>
                    <TableCell className="text-sm">{log.reason}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{log.category}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-sm">{log.duration} min</TableCell>
                    <TableCell className="text-center">
                      {log.resolved ? <CheckCircle2 className="h-4 w-4 text-status-success mx-auto" /> : <AlertTriangle className="h-4 w-4 text-status-critical mx-auto" />}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.actionTaken}</TableCell>
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
