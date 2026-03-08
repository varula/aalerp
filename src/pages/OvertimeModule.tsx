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
  ResponsiveContainer, Cell,
} from "recharts";
import {
  Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Users, Timer, Filter,
} from "lucide-react";
import { getOTBySection } from "@/data/mock-data";
import { APPLE_TOOLTIP, APPLE_AXIS, APPLE_GRID, APPLE_COLORS } from "@/lib/chart-styles";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentMonth = new Date().getMonth();

const monthlyTrend = MONTHS.slice(0, currentMonth + 1).map((m) => ({
  month: m,
  planned: Math.round(80 + Math.random() * 60),
  actual: Math.round(100 + Math.random() * 80),
  approved: Math.round(70 + Math.random() * 50),
}));

const otReasons = [
  { reason: "Order deadline", hours: 145, fill: APPLE_COLORS.blue },
  { reason: "Rework", hours: 62, fill: APPLE_COLORS.green },
  { reason: "Machine breakdown", hours: 48, fill: APPLE_COLORS.orange },
  { reason: "Absenteeism", hours: 38, fill: APPLE_COLORS.purple },
  { reason: "New style setup", hours: 25, fill: APPLE_COLORS.red },
];

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
    case "pending": return <Badge variant="secondary" className="text-[10px] bg-status-warning/10 text-status-warning rounded-full px-2">Pending</Badge>;
    case "approved": return <Badge variant="secondary" className="text-[10px] bg-status-success/10 text-status-success rounded-full px-2">Approved</Badge>;
    case "rejected": return <Badge variant="secondary" className="text-[10px] bg-status-critical/10 text-status-critical rounded-full px-2">Rejected</Badge>;
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
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overtime Management</h1>
        <p className="text-[13px] text-muted-foreground">Track, approve, and analyze overtime across all sections</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total OT (YTD)", value: `${totalHours}h`, icon: Clock, color: "text-primary" },
          { label: "Pending Approvals", value: pendingCount, icon: AlertTriangle, color: "text-status-warning" },
          { label: "Approved This Week", value: approvedCount, icon: CheckCircle2, color: "text-status-success" },
          { label: "Avg OT/Day", value: `${avgOTPerDay}h`, icon: TrendingUp, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className={`h-[18px] w-[18px] ${color} opacity-80`} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-semibold tabular-nums">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="analytics" className="rounded-lg text-[13px]">Analytics</TabsTrigger>
          <TabsTrigger value="approvals" className="rounded-lg text-[13px]">Approvals ({pendingCount})</TabsTrigger>
          <TabsTrigger value="section" className="rounded-lg text-[13px]">Section Breakdown</TabsTrigger>
        </TabsList>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-[13px] font-semibold flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
                    <Timer className="h-4 w-4 text-primary" />
                  </div>
                  Monthly OT Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid {...APPLE_GRID} />
                      <XAxis dataKey="month" {...APPLE_AXIS} />
                      <YAxis {...APPLE_AXIS} />
                      <Tooltip contentStyle={APPLE_TOOLTIP} />
                      <Line type="monotone" dataKey="actual" stroke={APPLE_COLORS.blue} strokeWidth={2} dot={{ r: 3, fill: APPLE_COLORS.blue, stroke: "hsl(var(--card))", strokeWidth: 2 }} name="Actual" />
                      <Line type="monotone" dataKey="planned" stroke={APPLE_COLORS.green} strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Planned" />
                      <Line type="monotone" dataKey="approved" stroke={APPLE_COLORS.purple} strokeWidth={1.5} dot={{ r: 2, fill: APPLE_COLORS.purple }} name="Approved" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-[13px] font-semibold flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
                    <Users className="h-4 w-4 text-status-warning" />
                  </div>
                  OT Reasons
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={otReasons} layout="vertical" barSize={16}>
                      <CartesianGrid {...APPLE_GRID} horizontal={false} vertical />
                      <XAxis type="number" {...APPLE_AXIS} />
                      <YAxis dataKey="reason" type="category" {...APPLE_AXIS} width={110} />
                      <Tooltip contentStyle={APPLE_TOOLTIP} formatter={(v: number) => [`${v} hrs`, "OT Hours"]} />
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
              <SelectTrigger className="w-[140px] h-8 text-xs rounded-lg">
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

          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40">
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-[80px]">ID</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-[90px]">Date</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Section</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Requested By</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right w-[60px]">Hours</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right w-[50px]">Ops</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Reason</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center w-[80px]">Status</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req, idx) => (
                      <TableRow key={req.id} className={`border-b border-border/20 ${idx % 2 === 0 ? "bg-muted/30" : ""}`}>
                        <TableCell className="text-xs font-medium py-2.5">{req.id}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2.5">{req.date}</TableCell>
                        <TableCell className="text-xs py-2.5">{req.section}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2.5">{req.requestedBy}</TableCell>
                        <TableCell className="text-right text-xs tabular-nums py-2.5">{req.hours}h</TableCell>
                        <TableCell className="text-right text-xs tabular-nums py-2.5">{req.operators}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2.5 truncate max-w-[160px]">{req.reason}</TableCell>
                        <TableCell className="text-center py-2.5">{statusBadge(req.status)}</TableCell>
                        <TableCell className="text-center py-2.5">
                          {req.status === "pending" ? (
                            <div className="flex items-center justify-center gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-status-success hover:bg-status-success/10">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-lg text-status-critical hover:bg-status-critical/10">
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
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[13px] font-semibold flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="h-4 w-4 text-destructive" />
                </div>
                OT Hours by Section
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectionData} barSize={32}>
                    <CartesianGrid {...APPLE_GRID} />
                    <XAxis dataKey="section" {...APPLE_AXIS} />
                    <YAxis {...APPLE_AXIS} />
                    <Tooltip contentStyle={APPLE_TOOLTIP} formatter={(v: number, name: string) => name === "OT Hours" ? [`${v} hrs`, name] : [`${v}%`, name]} />
                    <Bar dataKey="otHours" radius={[6, 6, 0, 0]} name="OT Hours">
                      {sectionData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 rounded-xl overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40">
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Section</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">OT Hours</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">OT %</TableHead>
                      <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Cost Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectionData.map((d, idx) => (
                      <TableRow key={d.section} className={`border-b border-border/20 ${idx % 2 === 0 ? "bg-muted/30" : ""}`}>
                        <TableCell className="text-xs py-2.5 flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                          {d.section}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums py-2.5">{d.otHours}h</TableCell>
                        <TableCell className="text-right text-xs tabular-nums py-2.5">{d.otPercent}%</TableCell>
                        <TableCell className="text-right text-xs tabular-nums py-2.5">₹{(d.otHours * 120).toLocaleString()}</TableCell>
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
