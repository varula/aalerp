import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Users, Timer, Filter,
} from "lucide-react";
import { getOTBySection } from "@/data/mock-data";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 24px -8px hsl(var(--foreground) / 0.1)",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentMonth = new Date().getMonth();

// Generate monthly OT trend data
const monthlyTrend = MONTHS.slice(0, currentMonth + 1).map((m, i) => ({
  month: m,
  planned: Math.round(80 + Math.random() * 60),
  actual: Math.round(100 + Math.random() * 80),
  approved: Math.round(70 + Math.random() * 50),
}));

// OT reasons breakdown
const otReasons = [
  { reason: "Order deadline", hours: 145, fill: "hsl(var(--chart-1))" },
  { reason: "Rework", hours: 62, fill: "hsl(var(--chart-2))" },
  { reason: "Machine breakdown recovery", hours: 48, fill: "hsl(var(--chart-3))" },
  { reason: "Absenteeism coverage", hours: 38, fill: "hsl(var(--chart-4))" },
  { reason: "New style setup", hours: 25, fill: "hsl(var(--chart-5))" },
];

// OT approval requests
const otRequests = [
  { id: "OT-001", date: "2026-03-08", section: "Sewing Floor 1", requestedBy: "Supervisor A", hours: 3, operators: 12, reason: "Buyer shipment deadline", status: "pending" as const },
  { id: "OT-002", date: "2026-03-08", section: "Cutting", requestedBy: "Supervisor B", hours: 2, operators: 8, reason: "Fabric utilization batch", status: "pending" as const },
  { id: "OT-003", date: "2026-03-07", section: "Finishing", requestedBy: "Supervisor C", hours: 2.5, operators: 15, reason: "Packing deadline", status: "approved" as const },
  { id: "OT-004", date: "2026-03-07", section: "Sewing Floor 2", requestedBy: "Supervisor D", hours: 4, operators: 20, reason: "Rework batch completion", status: "approved" as const },
  { id: "OT-005", date: "2026-03-06", section: "Sewing Floor 1", requestedBy: "Supervisor A", hours: 2, operators: 10, reason: "Order shortfall recovery", status: "rejected" as const },
  { id: "OT-006", date: "2026-03-06", section: "Cutting", requestedBy: "Supervisor B", hours: 1.5, operators: 6, reason: "Urgent order", status: "approved" as const },
  { id: "OT-007", date: "2026-03-05", section: "Finishing", requestedBy: "Supervisor C", hours: 3, operators: 12, reason: "Quality re-inspection", status: "approved" as const },
  { id: "OT-008", date: "2026-03-05", section: "Sewing Floor 3", requestedBy: "Supervisor E", hours: 2, operators: 18, reason: "Machine downtime recovery", status: "rejected" as const },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "pending": return <Badge variant="secondary" className="text-[10px] bg-status-warning/15 text-status-warning border-status-warning/20">Pending</Badge>;
    case "approved": return <Badge variant="secondary" className="text-[10px] bg-status-success/15 text-status-success border-status-success/20">Approved</Badge>;
    case "rejected": return <Badge variant="secondary" className="text-[10px] bg-status-critical/15 text-status-critical border-status-critical/20">Rejected</Badge>;
  }
};

export default function OvertimeModule() {
  const [filterStatus, setFilterStatus] = useState("all");
  const sectionData = getOTBySection();

  const totalHours = monthlyTrend.reduce((s, d) => s + d.actual, 0);
  const pendingCount = otRequests.filter(r => r.status === "pending").length;
  const approvedCount = otRequests.filter(r => r.status === "approved").length;
  const avgOTPerDay = +(totalHours / (currentMonth + 1) / 26).toFixed(1);

  const filteredRequests = filterStatus === "all"
    ? otRequests
    : otRequests.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Overtime Management</h1>
        <p className="text-sm text-muted-foreground">Track, approve, and analyze overtime across all sections</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-chart-1" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Total OT (YTD)</p>
                <p className="text-xl font-bold font-mono tabular-nums">{totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-status-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-status-warning" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Pending Approvals</p>
                <p className="text-xl font-bold font-mono tabular-nums">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-status-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-status-success" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Approved This Week</p>
                <p className="text-xl font-bold font-mono tabular-nums">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Avg OT/Day</p>
                <p className="text-xl font-bold font-mono tabular-nums">{avgOTPerDay}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="approvals">Approvals ({pendingCount} pending)</TabsTrigger>
          <TabsTrigger value="section">Section Breakdown</TabsTrigger>
        </TabsList>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly OT Trend */}
            <Card className="border-border/40">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Timer className="h-4 w-4 text-chart-1" />
                  Monthly OT Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 3 }} name="Actual OT (hrs)" />
                      <Line type="monotone" dataKey="planned" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Planned OT (hrs)" />
                      <Line type="monotone" dataKey="approved" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 2 }} name="Approved OT (hrs)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* OT Reasons */}
            <Card className="border-border/40">
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-chart-3" />
                  OT Reasons Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={otReasons} layout="vertical" barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} horizontal={false} />
                      <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="reason" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} axisLine={false} tickLine={false} width={130} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} hrs`, "OT Hours"]} />
                      <Bar dataKey="hours" radius={[0, 6, 6, 0]} name="OT Hours">
                        {otReasons.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* APPROVALS TAB */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border/40">
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[80px]">ID</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[90px]">Date</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Section</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Requested By</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right w-[60px]">Hours</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right w-[50px]">Ops</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Reason</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center w-[80px]">Status</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req, idx) => (
                      <TableRow key={req.id} className={`border-border/20 ${idx % 2 === 0 ? "bg-muted/15" : ""}`}>
                        <TableCell className="font-mono text-xs font-semibold py-2">{req.id}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2">{req.date}</TableCell>
                        <TableCell className="text-xs py-2">{req.section}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2">{req.requestedBy}</TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums py-2">{req.hours}h</TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums py-2">{req.operators}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2 truncate max-w-[160px]">{req.reason}</TableCell>
                        <TableCell className="text-center py-2">{statusBadge(req.status)}</TableCell>
                        <TableCell className="text-center py-2">
                          {req.status === "pending" ? (
                            <div className="flex items-center justify-center gap-1">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-status-success hover:bg-status-success/10">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-status-critical hover:bg-status-critical/10">
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION BREAKDOWN TAB */}
        <TabsContent value="section" className="space-y-4">
          <Card className="border-border/40">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-chart-5" />
                OT Hours by Section / Floor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                    <XAxis dataKey="section" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number, name: string) => name === "OT Hours" ? [`${v} hrs`, name] : [`${v}%`, name]} />
                    <Bar dataKey="otHours" radius={[8, 8, 0, 0]} name="OT Hours">
                      {sectionData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Section detail table */}
              <div className="mt-4 rounded-lg border border-border/30 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Section</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">OT Hours</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">OT %</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Cost Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectionData.map((d, idx) => (
                      <TableRow key={d.section} className={idx % 2 === 0 ? "bg-muted/15" : ""}>
                        <TableCell className="text-xs py-2 flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                          {d.section}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums py-2">{d.otHours}h</TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums py-2">
                          <Badge variant="secondary" className="text-[10px]">{d.otPercent}%</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums py-2">
                          ${(d.otHours * 4.5).toFixed(0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
