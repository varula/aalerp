import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, Wrench, Activity, AlertTriangle } from "lucide-react";
import { machines, getFactoryInfo } from "@/data/mock-data";
import { motion } from "framer-motion";

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: appleEase } },
};

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
    <motion.div className="space-y-6 pb-8" variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{factoryInfo.name} — Machines & IoT</h1>
          <p className="text-sm text-muted-foreground">Machine status, telemetry, and maintenance tracking</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" variants={stagger}>
        {[
          { label: "Running", value: running, icon: Activity, color: "text-status-success" },
          { label: "Idle", value: idle, icon: Wrench, color: "text-muted-foreground" },
          { label: "Maintenance", value: maintenance, icon: Wrench, color: "text-status-warning" },
          { label: "Breakdown", value: breakdown, icon: AlertTriangle, color: "text-status-critical" },
        ].map(kpi => (
          <motion.div key={kpi.label} variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
            <Card className="border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className={`text-2xl font-bold font-mono mt-1 ${kpi.color}`}>{kpi.value}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-muted/60 flex items-center justify-center">
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
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
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center">
                <Wrench className="h-3.5 w-3.5 text-primary" />
              </div>
              Machine Registry
              <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{filtered.length} machines</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Machine</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Type</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Brand / Model</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">RPM</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Temp °C</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Vibration</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Oil Level</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Hours Run</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 50).map((m, i) => (
                    <TableRow key={m.id} className={`hover:bg-accent/40 transition-colors ${i % 2 === 1 ? "bg-muted/20" : ""}`}>
                      <TableCell className="font-mono text-xs font-medium text-foreground">{m.name}</TableCell>
                      <TableCell className="text-xs">{m.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.brand} {m.model}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusColor(m.status) as any} className="text-[10px]">{m.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{m.rpm}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className={m.temperature > 45 ? "text-status-critical" : ""}>{m.temperature}°</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        <span className={m.vibration > 4 ? "text-status-warning" : ""}>{m.vibration}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-[80px]">
                          <Progress value={m.oilLevel} className="h-1.5" />
                          <span className="text-[10px] font-mono">{m.oilLevel}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{m.hoursRun.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
