import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import {
  Package, AlertTriangle, ArrowRight, Layers, Activity, TrendingDown,
} from "lucide-react";
import { allLines, type SewingLine } from "@/data/mock-data";

// --- WIP operations per line (deterministic from line id) ---
const OPS_FLOW = [
  "Cutting Receive", "Fusing", "Collar Attach", "Sleeve Attach", "Side Seam",
  "Hem Bottom", "Button Hole", "Button Attach", "Pressing", "Final QC",
];

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildLineWip(line: SewingLine) {
  const seed = hashCode(line.id);
  return OPS_FLOW.map((op, i) => {
    const wip = ((seed * (i + 7) * 13) % 28) + 1;
    const cycle = +((((seed * (i + 3)) % 150) + 30) / 100).toFixed(2);
    const takt = +((((seed * (i + 11)) % 120) + 40) / 100).toFixed(2);
    return { operation: op, wipBundles: wip, avgCycleTime: cycle, taktTime: takt };
  });
}

function detectBottlenecks(wip: ReturnType<typeof buildLineWip>) {
  const avg = wip.reduce((s, w) => s + w.wipBundles, 0) / wip.length;
  return wip.map(w => ({ ...w, isBottleneck: w.wipBundles > avg * 1.6, avg: Math.round(avg) }));
}

export default function WipTracking() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [selectedLine, setSelectedLine] = useState<string>("all");

  const lines = useMemo(
    () => allLines.filter(l => selectedFactory === "all" || l.factoryId === selectedFactory),
    [selectedFactory]
  );

  const lineWipMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof detectBottlenecks>>();
    lines.forEach(l => map.set(l.id, detectBottlenecks(buildLineWip(l))));
    return map;
  }, [lines]);

  // Aggregate or single line view
  const currentWip = useMemo(() => {
    if (selectedLine !== "all") {
      return lineWipMap.get(selectedLine) || [];
    }
    // Aggregate across all lines
    const agg: Record<string, { wipBundles: number; cycle: number; takt: number; count: number }> = {};
    lineWipMap.forEach(entries => {
      entries.forEach(e => {
        if (!agg[e.operation]) agg[e.operation] = { wipBundles: 0, cycle: 0, takt: 0, count: 0 };
        agg[e.operation].wipBundles += e.wipBundles;
        agg[e.operation].cycle += e.avgCycleTime;
        agg[e.operation].takt += e.taktTime;
        agg[e.operation].count += 1;
      });
    });
    const result = OPS_FLOW.map(op => {
      const a = agg[op] || { wipBundles: 0, cycle: 1, takt: 1, count: 1 };
      return {
        operation: op,
        wipBundles: a.wipBundles,
        avgCycleTime: +(a.cycle / a.count).toFixed(2),
        taktTime: +(a.takt / a.count).toFixed(2),
        isBottleneck: false,
        avg: 0,
      };
    });
    const avg = result.reduce((s, r) => s + r.wipBundles, 0) / result.length;
    return result.map(r => ({ ...r, avg: Math.round(avg), isBottleneck: r.wipBundles > avg * 1.6 }));
  }, [selectedLine, lineWipMap]);

  const totalWip = currentWip.reduce((s, w) => s + w.wipBundles, 0);
  const bottleneckCount = currentWip.filter(w => w.isBottleneck).length;
  const avgWip = currentWip.length ? Math.round(totalWip / currentWip.length) : 0;
  const maxWipOp = currentWip.reduce((max, w) => (w.wipBundles > max.wipBundles ? w : max), currentWip[0]);

  // Lines with bottleneck summary
  const lineBottleneckSummary = useMemo(() => {
    return lines.map(l => {
      const wip = lineWipMap.get(l.id) || [];
      const bn = wip.filter(w => w.isBottleneck);
      const total = wip.reduce((s, w) => s + w.wipBundles, 0);
      return { line: l, bottlenecks: bn.length, totalWip: total, worstOp: bn.length ? bn.reduce((m, w) => w.wipBundles > m.wipBundles ? w : m, bn[0]) : null };
    }).sort((a, b) => b.bottlenecks - a.bottlenecks);
  }, [lines, lineWipMap]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">WIP Tracking</h1>
          <p className="text-sm text-muted-foreground">Bundle flow visualization with bottleneck detection</p>
        </div>
        <Select value={selectedLine} onValueChange={setSelectedLine}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Line" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lines (Aggregated)</SelectItem>
            {lines.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.name} — {l.style}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total WIP</p>
              <p className="text-xl font-bold font-mono">{totalWip.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-status-critical/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-status-critical" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bottlenecks</p>
              <p className="text-xl font-bold font-mono">{bottleneckCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-status-warning/20 flex items-center justify-center">
              <Layers className="h-5 w-5 text-status-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg WIP / Op</p>
              <p className="text-xl font-bold font-mono">{avgWip}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-status-success/20 flex items-center justify-center">
              <Activity className="h-5 w-5 text-status-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Peak Operation</p>
              <p className="text-sm font-bold truncate">{maxWipOp?.operation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WIP Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">WIP by Operation — Bundle Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentWip}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="operation" angle={-35} textAnchor="end" height={80} className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, name: string) => [value, name === "wipBundles" ? "WIP Bundles" : name]}
                />
                <ReferenceLine y={avgWip} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: `Avg: ${avgWip}`, position: "right", className: "text-xs fill-muted-foreground" }} />
                <Bar dataKey="wipBundles" name="WIP Bundles" radius={[4, 4, 0, 0]}>
                  {currentWip.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isBottleneck ? "hsl(var(--status-critical))" : "hsl(var(--primary))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Flow Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4" /> Bundle Flow Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {currentWip.map((op, i) => (
              <div key={op.operation} className="flex items-center shrink-0">
                <div
                  className={`relative rounded-lg border-2 p-3 min-w-[110px] text-center transition-all ${
                    op.isBottleneck
                      ? "border-status-critical bg-status-critical/10 animate-pulse"
                      : "border-border bg-card"
                  }`}
                >
                  <p className="text-[10px] text-muted-foreground truncate">{op.operation}</p>
                  <p className={`text-lg font-bold font-mono ${op.isBottleneck ? "text-status-critical" : "text-foreground"}`}>
                    {op.wipBundles}
                  </p>
                  <p className="text-[9px] text-muted-foreground">bundles</p>
                  {op.isBottleneck && (
                    <Badge className="absolute -top-2 -right-2 bg-status-critical text-[9px] px-1 py-0 border-0 text-white">
                      ⚠
                    </Badge>
                  )}
                </div>
                {i < currentWip.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-0.5 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operation Detail Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Operation Detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Operation</TableHead>
                <TableHead className="text-xs text-right">WIP Bundles</TableHead>
                <TableHead className="text-xs text-right">Cycle Time</TableHead>
                <TableHead className="text-xs text-right">Takt Time</TableHead>
                <TableHead className="text-xs text-right">Cycle vs Takt</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentWip.map(op => {
                const ratio = op.avgCycleTime / op.taktTime;
                return (
                  <TableRow key={op.operation} className={op.isBottleneck ? "bg-status-critical/5" : ""}>
                    <TableCell className="font-medium">{op.operation}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">{op.wipBundles}</TableCell>
                    <TableCell className="text-right font-mono">{op.avgCycleTime}m</TableCell>
                    <TableCell className="text-right font-mono">{op.taktTime}m</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono text-sm ${ratio > 1.2 ? "text-status-critical" : ratio > 1 ? "text-status-warning" : "text-status-success"}`}>
                        {ratio.toFixed(2)}x
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {op.isBottleneck ? (
                        <Badge variant="destructive" className="text-[10px]">Bottleneck</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Line Bottleneck Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4" /> Line Bottleneck Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Line</TableHead>
                  <TableHead className="text-xs">Style</TableHead>
                  <TableHead className="text-xs text-right">Total WIP</TableHead>
                  <TableHead className="text-xs text-right">Bottlenecks</TableHead>
                  <TableHead className="text-xs">Worst Operation</TableHead>
                  <TableHead className="text-xs text-center">Line Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineBottleneckSummary.slice(0, 25).map(({ line, bottlenecks, totalWip, worstOp }) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-mono font-medium">{line.name}</TableCell>
                    <TableCell className="text-sm">{line.style}</TableCell>
                    <TableCell className="text-right font-mono">{totalWip}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-semibold ${bottlenecks > 0 ? "text-status-critical" : "text-status-success"}`}>
                        {bottlenecks}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{worstOp ? `${worstOp.operation} (${worstOp.wipBundles})` : "—"}</TableCell>
                    <TableCell className="text-center">
                      <div className={`h-2.5 w-2.5 rounded-full mx-auto ${line.status === "normal" ? "bg-status-success" : line.status === "warning" ? "bg-status-warning" : "bg-status-critical"}`} />
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
