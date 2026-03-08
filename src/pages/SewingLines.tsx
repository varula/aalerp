import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
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
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Search, Factory, Users, TrendingUp, Zap, ArrowRight, AlertTriangle, Clock, ArrowLeft,
} from "lucide-react";
import {
  allLines, operators, factories,
  type SewingLine,
} from "@/data/mock-data";
import { APPLE_TOOLTIP, APPLE_AXIS } from "@/lib/chart-styles";
import { motion } from "framer-motion";
import { PanelSection } from "@/components/dashboard/PanelSection";

const statusColor = (s: string) =>
  s === "normal" ? "bg-status-success" : s === "warning" ? "bg-status-warning" : "bg-status-critical";

const effColor = (eff: number) =>
  eff >= 85 ? "text-status-success" : eff >= 65 ? "text-status-warning" : "text-status-critical";

function getLineWip(lineId: string) {
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

const cardHover = {
  whileHover: { y: -3, scale: 1.012 },
  whileTap: { scale: 0.985 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

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
    <div className="space-y-8">
      <PanelSection
        title="Sewing Lines"
        subtitle="Monitor all production lines across factories"
        icon={<div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Factory className="h-4 w-4 text-primary" /></div>}
      >
        {/* Summary Cards */}
        <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-4" variants={stagger} initial="hidden" animate="visible">
          {[
            { label: "Total Lines", value: stats.total, icon: Factory, color: "text-primary" },
            { label: "Normal", value: stats.normal, icon: TrendingUp, color: "text-status-success" },
            { label: "Warning", value: stats.warning, icon: AlertTriangle, color: "text-status-warning" },
            { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "text-status-critical" },
            { label: "Avg Efficiency", value: `${stats.avgEff}%`, icon: Zap, color: effColor(stats.avgEff) },
          ].map(s => (
            <motion.div key={s.label} variants={fadeUp} {...cardHover} className="will-change-transform">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <s.icon className={`h-[18px] w-[18px] ${s.color} opacity-70`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                    <p className="text-xl font-semibold tabular-nums">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </PanelSection>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search line or style..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] rounded-xl">
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
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        variants={stagger} initial="hidden" animate="visible"
      >
        {lines.slice(0, 40).map(line => (
          <motion.div key={line.id} variants={fadeUp} {...cardHover} className="will-change-transform">
            <Card
              className="cursor-pointer group"
              onClick={() => { setSelectedLine(line); setDetailTab("overview"); }}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${statusColor(line.status)}`} />
                    <span className="font-semibold text-lg tabular-nums">{line.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{factoryName(line.factoryId).split(" ")[0]}</Badge>
                </div>
                <p className="text-[12px] text-muted-foreground truncate">{line.style}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className={`font-semibold tabular-nums ${effColor(line.efficiency)}`}>{line.efficiency}%</span>
                  </div>
                  <Progress value={line.efficiency} className="h-1.5" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Target</p>
                    <p className="text-[13px] font-semibold tabular-nums">{line.target}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Actual</p>
                    <p className="text-[13px] font-semibold tabular-nums">{line.actual}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Operators</p>
                    <p className="text-[13px] font-semibold tabular-nums">{line.operatorCount}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    View Details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {lines.length > 40 && (
        <p className="text-[12px] text-muted-foreground text-center">Showing 40 of {lines.length} lines. Use filters to narrow results.</p>
      )}

      {/* Line Detail Dialog */}
      <Dialog open={!!selectedLine} onOpenChange={() => setSelectedLine(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {selectedLine && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setSelectedLine(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${statusColor(selectedLine.status)}`} />
                    <DialogTitle className="text-lg font-semibold">Line {selectedLine.name}</DialogTitle>
                  </div>
                  <Badge variant="outline" className="text-[11px]">{selectedLine.style}</Badge>
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
                  <div key={kpi.label} className="p-3 rounded-xl bg-muted text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className={`text-lg font-semibold tabular-nums ${'color' in kpi ? kpi.color : ''}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              <Tabs value={detailTab} onValueChange={setDetailTab} className="mt-4">
                <TabsList className="rounded-xl">
                  <TabsTrigger value="overview" className="rounded-lg text-[12px]">Overview</TabsTrigger>
                  <TabsTrigger value="operators" className="rounded-lg text-[12px]">Operators ({lineOperators.length})</TabsTrigger>
                  <TabsTrigger value="wip" className="rounded-lg text-[12px]">WIP Tracking</TabsTrigger>
                  <TabsTrigger value="bundles" className="rounded-lg text-[12px]">Bundle Flow</TabsTrigger>
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
                            <XAxis dataKey="level" {...APPLE_AXIS} />
                            <YAxis {...APPLE_AXIS} />
                            <Tooltip contentStyle={APPLE_TOOLTIP} />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Operators" barSize={36} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4 text-status-warning" />
                        AI Line Balancing Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {lineWip.filter(w => w.isBottleneck).length > 0 ? (
                        lineWip.filter(w => w.isBottleneck).map(w => (
                          <div key={w.operation} className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[12px] font-medium">Bottleneck at {w.operation}</p>
                              <p className="text-[11px] text-muted-foreground">
                                WIP: {w.wipBundles} bundles (cycle: {w.avgCycleTime}min vs takt: {w.taktTime}min). Consider adding an operator or splitting this operation.
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[12px] text-status-success flex items-center gap-2">
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
                              <TableHead className="text-[10px] uppercase tracking-wider">ID</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-wider">Name</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-wider text-center">Skill</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-wider text-right">Efficiency</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-wider text-right">Pieces</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-wider text-right">Idle Time</TableHead>
                              <TableHead className="text-[10px] uppercase tracking-wider">Operations</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lineOperators.map((op, idx) => (
                              <TableRow key={op.id} className={idx % 2 === 0 ? "bg-muted/40" : ""}>
                                <TableCell className="text-[12px] tabular-nums">{op.id}</TableCell>
                                <TableCell className="text-[12px] font-medium">{op.name}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={op.skillLevel === "Expert" ? "default" : op.skillLevel === "Intermediate" ? "secondary" : "outline"} className="text-[10px]">
                                    {op.skillLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell className={`text-right text-[12px] font-semibold tabular-nums ${effColor(op.avgEfficiency)}`}>
                                  {op.avgEfficiency}%
                                </TableCell>
                                <TableCell className="text-right text-[12px] tabular-nums">{op.piecesProduced}</TableCell>
                                <TableCell className="text-right text-[12px] tabular-nums">{op.idleTime} min</TableCell>
                                <TableCell className="text-[11px] text-muted-foreground max-w-[200px] truncate">
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
                            <XAxis dataKey="operation" {...APPLE_AXIS} tick={{ ...APPLE_AXIS.tick, fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                            <YAxis {...APPLE_AXIS} />
                            <Tooltip contentStyle={APPLE_TOOLTIP} />
                            <Bar
                              dataKey="wipBundles"
                              name="WIP Bundles"
                              radius={[6, 6, 0, 0]}
                              fill="hsl(var(--chart-3))"
                              barSize={24}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {lineWip.map(w => (
                      <motion.div
                        key={w.operation}
                        whileHover={{ y: -2, scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className={`p-3 rounded-xl border ${w.isBottleneck ? "border-destructive/50 bg-destructive/5" : "border-border"}`}
                      >
                        <p className="text-[11px] font-medium truncate">{w.operation}</p>
                        <p className="text-lg font-semibold tabular-nums">{w.wipBundles}</p>
                        <p className="text-[10px] text-muted-foreground">bundles</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">Cycle: {w.avgCycleTime}m</span>
                          <span className="text-[10px] text-muted-foreground">Takt: {w.taktTime}m</span>
                        </div>
                        {w.isBottleneck && (
                          <Badge variant="destructive" className="mt-1 text-[10px] px-1.5 py-0">Bottleneck</Badge>
                        )}
                      </motion.div>
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
                              <div className="flex flex-col items-center w-8 shrink-0">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2
                                  ${w.isBottleneck
                                    ? "border-destructive bg-destructive/10 text-destructive"
                                    : "border-primary/30 bg-primary/5 text-primary"
                                  }`}>
                                  {i + 1}
                                </div>
                                {i < lineWip.length - 1 && (
                                  <div className="w-0.5 h-3 bg-border" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-[11px] font-medium truncate">{w.operation}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] tabular-nums text-muted-foreground">{w.wipBundles} bundles</span>
                                    {w.isBottleneck && <Badge variant="destructive" className="text-[9px] px-1 py-0">⚠</Badge>}
                                  </div>
                                </div>
                                <div className="h-5 rounded-full bg-muted overflow-hidden relative">
                                  <motion.div
                                    className={`h-full rounded-full ${
                                      w.isBottleneck
                                        ? "bg-destructive/70"
                                        : pct > 70
                                          ? "bg-status-warning/70"
                                          : "bg-primary/50"
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.05 }}
                                  />
                                  <div className="absolute inset-0 flex items-center px-2">
                                    {Array.from({ length: Math.min(w.wipBundles, 12) }).map((_, di) => (
                                      <div
                                        key={di}
                                        className={`h-2 w-2 rounded-full mx-0.5 ${
                                          w.isBottleneck ? "bg-destructive" : "bg-primary"
                                        } opacity-60`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-between mt-0.5">
                                  <span className="text-[10px] text-muted-foreground">Cycle: {w.avgCycleTime} min</span>
                                  <span className="text-[10px] text-muted-foreground">Takt: {w.taktTime} min</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-muted flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Total WIP</span>
                        </div>
                        <span className="font-semibold tabular-nums text-[13px]">
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
