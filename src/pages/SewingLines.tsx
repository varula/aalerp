import { useState, useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Search, Factory, Users, TrendingUp, Zap, ArrowRight, AlertTriangle, Clock, ArrowLeft,
} from "lucide-react";
import {
  allLines, operators, wipData, factories,
  type SewingLine, type Operator, type WipEntry,
} from "@/data/mock-data";

const statusColor = (s: string) =>
  s === "normal" ? "bg-status-success" : s === "warning" ? "bg-status-warning" : "bg-status-critical";

const statusText = (s: string) =>
  s === "normal" ? "text-status-success" : s === "warning" ? "text-status-warning" : "text-status-critical";

const effColor = (eff: number) =>
  eff >= 85 ? "text-status-success" : eff >= 65 ? "text-status-warning" : "text-status-critical";

// Generate line-specific WIP data
function getLineWip(lineId: string): WipEntry[] {
  const seed = lineId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const ops = [
    "Cutting Receive", "Fusing", "Collar Attach", "Sleeve Attach",
    "Side Seam", "Hem Bottom", "Button Hole", "Button Attach",
    "Pressing", "Final QC",
  ];
  return ops.map((op, i) => {
    const wip = ((seed * (i + 1) * 7) % 20) + 1;
    const avg = 8;
    return {
      operation: op,
      wipBundles: wip,
      avgCycleTime: +((((seed * (i + 3)) % 150) + 30) / 100).toFixed(2),
      taktTime: +((((seed * (i + 5)) % 120) + 50) / 100).toFixed(2),
      isBottleneck: wip > avg * 2,
    };
  });
}

export default function SewingLinesPage() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLine, setSelectedLine] = useState<SewingLine | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  const lines = useMemo(() =>
    allLines
      .filter(l => selectedFactory === "all" || l.factoryId === selectedFactory)
      .filter(l => statusFilter === "all" || l.status === statusFilter)
      .filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.style.toLowerCase().includes(search.toLowerCase()) ||
        l.id.toLowerCase().includes(search.toLowerCase())
      ),
    [selectedFactory, statusFilter, search]
  );

  const lineOperators = useMemo(() =>
    selectedLine ? operators.filter(o => o.lineId === selectedLine.id) : [],
    [selectedLine]
  );

  const lineWip = useMemo(() =>
    selectedLine ? getLineWip(selectedLine.id) : [],
    [selectedLine]
  );

  const stats = useMemo(() => ({
    total: lines.length,
    normal: lines.filter(l => l.status === "normal").length,
    warning: lines.filter(l => l.status === "warning").length,
    critical: lines.filter(l => l.status === "critical").length,
    avgEff: lines.length ? Math.round(lines.reduce((s, l) => s + l.efficiency, 0) / lines.length) : 0,
  }), [lines]);

  const factoryName = (fId: string) => factories.find(f => f.id === fId)?.name || fId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sewing Lines</h1>
        <p className="text-sm text-muted-foreground">Monitor all production lines across factories</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Lines", value: stats.total, icon: Factory, color: "text-primary" },
          { label: "Normal", value: stats.normal, icon: TrendingUp, color: "text-status-success" },
          { label: "Warning", value: stats.warning, icon: AlertTriangle, color: "text-status-warning" },
          { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "text-status-critical" },
          { label: "Avg Efficiency", value: `${stats.avgEff}%`, icon: Zap, color: effColor(stats.avgEff).replace("text-", "text-") },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-7 w-7 ${s.color} opacity-60`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold font-mono">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search line or style..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {lines.slice(0, 40).map(line => (
          <Card
            key={line.id}
            className="cursor-pointer hover:border-primary/40 transition-colors group"
            onClick={() => { setSelectedLine(line); setDetailTab("overview"); }}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${statusColor(line.status)}`} />
                  <span className="font-bold font-mono text-lg">{line.name}</span>
                </div>
                <Badge variant="outline" className="text-[10px]">{factoryName(line.factoryId).split(" ")[0]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{line.style}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Efficiency</span>
                  <span className={`font-mono font-semibold ${effColor(line.efficiency)}`}>{line.efficiency}%</span>
                </div>
                <Progress value={line.efficiency} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground">Target</p>
                  <p className="text-sm font-mono font-semibold">{line.target}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Actual</p>
                  <p className="text-sm font-mono font-semibold">{line.actual}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Operators</p>
                  <p className="text-sm font-mono font-semibold">{line.operatorCount}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  View Details <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {lines.length > 40 && (
        <p className="text-sm text-muted-foreground text-center">Showing 40 of {lines.length} lines. Use filters to narrow results.</p>
      )}

      {/* Line Detail Dialog */}
      <Dialog open={!!selectedLine} onOpenChange={() => setSelectedLine(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedLine && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedLine(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${statusColor(selectedLine.status)}`} />
                    <DialogTitle className="text-xl">Line {selectedLine.name}</DialogTitle>
                  </div>
                  <Badge variant="outline">{selectedLine.style}</Badge>
                </div>
              </DialogHeader>

              {/* Line KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {[
                  { label: "Efficiency", value: `${selectedLine.efficiency}%`, color: effColor(selectedLine.efficiency) },
                  { label: "Output / Target", value: `${selectedLine.actual} / ${selectedLine.target}` },
                  { label: "Operators", value: selectedLine.operatorCount },
                  { label: "SMV", value: selectedLine.smv },
                ].map(kpi => (
                  <div key={kpi.label} className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">{kpi.label}</p>
                    <p className={`text-lg font-bold font-mono ${'color' in kpi ? kpi.color : ''}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="operators">Operators ({lineOperators.length})</TabsTrigger>
                  <TabsTrigger value="wip">WIP Tracking</TabsTrigger>
                  <TabsTrigger value="bundles">Bundle Flow</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">Operator Skill Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { level: "Expert", count: lineOperators.filter(o => o.skillLevel === "Expert").length },
                            { level: "Intermediate", count: lineOperators.filter(o => o.skillLevel === "Intermediate").length },
                            { level: "Beginner", count: lineOperators.filter(o => o.skillLevel === "Beginner").length },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="level" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Operators" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Recommendations */}
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4 text-status-warning" />
                        AI Line Balancing Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {lineWip.filter(w => w.isBottleneck).length > 0 ? (
                        lineWip.filter(w => w.isBottleneck).map(w => (
                          <div key={w.operation} className="flex items-start gap-2 p-2 rounded bg-status-critical/5 border border-status-critical/20">
                            <AlertTriangle className="h-4 w-4 text-status-critical mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium">Bottleneck at {w.operation}</p>
                              <p className="text-xs text-muted-foreground">
                                WIP: {w.wipBundles} bundles (cycle: {w.avgCycleTime}min vs takt: {w.taktTime}min). Consider adding an operator or splitting this operation.
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-status-success flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> Line is well balanced. No bottlenecks detected.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Operators Tab */}
                <TabsContent value="operators" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-auto max-h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">ID</TableHead>
                              <TableHead className="text-xs">Name</TableHead>
                              <TableHead className="text-xs text-center">Skill</TableHead>
                              <TableHead className="text-xs text-right">Efficiency</TableHead>
                              <TableHead className="text-xs text-right">Pieces</TableHead>
                              <TableHead className="text-xs text-right">Idle Time</TableHead>
                              <TableHead className="text-xs">Operations</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lineOperators.map(op => (
                              <TableRow key={op.id}>
                                <TableCell className="font-mono text-sm">{op.id}</TableCell>
                                <TableCell className="text-sm font-medium">{op.name}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={op.skillLevel === "Expert" ? "default" : op.skillLevel === "Intermediate" ? "secondary" : "outline"} className="text-[10px]">
                                    {op.skillLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell className={`text-right font-mono text-sm font-semibold ${effColor(op.avgEfficiency)}`}>
                                  {op.avgEfficiency}%
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">{op.piecesProduced}</TableCell>
                                <TableCell className="text-right font-mono text-sm">{op.idleTime} min</TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                  {op.operations.map(s => s.operation).join(", ")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* WIP Tracking Tab */}
                <TabsContent value="wip" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">WIP by Operation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={lineWip}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="operation" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                            <Bar
                              dataKey="wipBundles"
                              name="WIP Bundles"
                              radius={[4, 4, 0, 0]}
                              fill="hsl(var(--chart-3))"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {lineWip.map(w => (
                      <div
                        key={w.operation}
                        className={`p-3 rounded-lg border ${w.isBottleneck ? "border-status-critical/50 bg-status-critical/5" : "border-border"}`}
                      >
                        <p className="text-xs font-medium truncate">{w.operation}</p>
                        <p className="text-lg font-bold font-mono">{w.wipBundles}</p>
                        <p className="text-[10px] text-muted-foreground">bundles</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">Cycle: {w.avgCycleTime}m</span>
                          <span className="text-[10px] text-muted-foreground">Takt: {w.taktTime}m</span>
                        </div>
                        {w.isBottleneck && (
                          <Badge variant="destructive" className="mt-1 text-[10px] px-1.5 py-0">Bottleneck</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Bundle Flow Tab */}
                <TabsContent value="bundles" className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold">Real-Time Bundle Flow Visualization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {lineWip.map((w, i) => {
                          const maxWip = Math.max(...lineWip.map(x => x.wipBundles));
                          const pct = Math.round((w.wipBundles / maxWip) * 100);
                          return (
                            <div key={w.operation} className="flex items-center gap-2">
                              {/* Step indicator */}
                              <div className="flex flex-col items-center w-8 shrink-0">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2
                                  ${w.isBottleneck
                                    ? "border-status-critical bg-status-critical/10 text-status-critical"
                                    : "border-primary/30 bg-primary/5 text-primary"
                                  }`}>
                                  {i + 1}
                                </div>
                                {i < lineWip.length - 1 && (
                                  <div className="w-0.5 h-3 bg-border" />
                                )}
                              </div>

                              {/* Operation bar */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs font-medium truncate">{w.operation}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-muted-foreground">{w.wipBundles} bundles</span>
                                    {w.isBottleneck && <Badge variant="destructive" className="text-[9px] px-1 py-0">⚠</Badge>}
                                  </div>
                                </div>
                                <div className="h-5 rounded-full bg-muted overflow-hidden relative">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      w.isBottleneck
                                        ? "bg-status-critical/70"
                                        : pct > 70
                                          ? "bg-status-warning/70"
                                          : "bg-primary/50"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                  {/* Animated dots for flow effect */}
                                  <div className="absolute inset-0 flex items-center px-2">
                                    {Array.from({ length: Math.min(w.wipBundles, 12) }).map((_, di) => (
                                      <div
                                        key={di}
                                        className={`h-2 w-2 rounded-full mx-0.5 ${
                                          w.isBottleneck ? "bg-status-critical" : "bg-primary"
                                        } opacity-60`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-between mt-0.5">
                                  <span className="text-[10px] text-muted-foreground">
                                    Cycle: {w.avgCycleTime} min
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    Takt: {w.taktTime} min
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Flow Summary */}
                      <div className="mt-4 p-3 rounded-lg bg-muted flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Total WIP</span>
                        </div>
                        <span className="font-mono font-bold">
                          {lineWip.reduce((s, w) => s + w.wipBundles, 0)} bundles across {lineWip.length} operations
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
