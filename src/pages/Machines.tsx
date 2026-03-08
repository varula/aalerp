import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, Wrench, Activity, AlertTriangle, Thermometer } from "lucide-react";
import { machines, getFactoryInfo } from "@/data/mock-data";

export default function Machines() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const factoryInfo = getFactoryInfo(selectedFactory);

  const filtered = machines
    .filter(m => selectedFactory === "all" || m.factoryId === selectedFactory)
    .filter(m => statusFilter === "all" || m.status === statusFilter)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.type.toLowerCase().includes(search.toLowerCase()) || m.brand.toLowerCase().includes(search.toLowerCase()));

  const running = filtered.filter(m => m.status === "Running").length;
  const idle = filtered.filter(m => m.status === "Idle").length;
  const maintenance = filtered.filter(m => m.status === "Maintenance").length;
  const breakdown = filtered.filter(m => m.status === "Breakdown").length;

  const statusColor = (s: string) => s === "Running" ? "default" : s === "Idle" ? "secondary" : s === "Maintenance" ? "outline" : "destructive";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — Machines & IoT</h1>
        <p className="text-sm text-muted-foreground">Machine status, telemetry, and maintenance tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Running", value: running, icon: Activity, color: "text-status-success" },
          { label: "Idle", value: idle, icon: Wrench, color: "text-muted-foreground" },
          { label: "Maintenance", value: maintenance, icon: Wrench, color: "text-status-warning" },
          { label: "Breakdown", value: breakdown, icon: AlertTriangle, color: "text-status-critical" },
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

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search machines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Running">Running</SelectItem>
            <SelectItem value="Idle">Idle</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Breakdown">Breakdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Machine Registry
            <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{filtered.length} machines</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Machine</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Brand / Model</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs text-right">RPM</TableHead>
                  <TableHead className="text-xs text-right">Temp °C</TableHead>
                  <TableHead className="text-xs text-right">Vibration</TableHead>
                  <TableHead className="text-xs">Oil Level</TableHead>
                  <TableHead className="text-xs text-right">Hours Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-sm font-medium">{m.name}</TableCell>
                    <TableCell className="text-sm">{m.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.brand} {m.model}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusColor(m.status) as any} className="text-[10px]">{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{m.rpm}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span className={m.temperature > 45 ? "text-status-critical" : ""}>{m.temperature}°</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span className={m.vibration > 4 ? "text-status-warning" : ""}>{m.vibration}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 w-[80px]">
                        <Progress value={m.oilLevel} className="h-1.5" />
                        <span className="text-[10px] font-mono">{m.oilLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{m.hoursRun.toLocaleString()}</TableCell>
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
