import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Users, Timer, Target, Gauge, Plus, Trash2, ArrowUpDown, Zap,
  AlertTriangle, CheckCircle2, RotateCcw,
} from "lucide-react";

// ── Types ──────────────────────────────────
interface Operation {
  id: string;
  name: string;
  smv: number;
  machineType?: string;
}

interface OperatorStation {
  id: string;
  name: string;
  operations: Operation[];
  totalSmv: number;
}

// ── Helpers ────────────────────────────────
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

const SAMPLE_OPERATIONS: Omit<Operation, "id">[] = [
  { name: "Collar attach", smv: 1.2, machineType: "SNLS" },
  { name: "Collar topstitch", smv: 0.8, machineType: "SNLS" },
  { name: "Shoulder join", smv: 0.6, machineType: "OL" },
  { name: "Sleeve attach", smv: 1.4, machineType: "OL" },
  { name: "Sleeve hem", smv: 0.9, machineType: "FL" },
  { name: "Side seam", smv: 1.1, machineType: "OL" },
  { name: "Bottom hem", smv: 0.7, machineType: "FL" },
  { name: "Button attach", smv: 0.5, machineType: "BTN" },
  { name: "Buttonhole", smv: 0.4, machineType: "BTH" },
  { name: "Label attach", smv: 0.3, machineType: "SNLS" },
  { name: "Front placket", smv: 1.5, machineType: "SNLS" },
  { name: "Pocket attach", smv: 1.3, machineType: "SNLS" },
];

// ── Auto-Balance Algorithm ─────────────────
function autoBalance(operations: Operation[], stationCount: number): OperatorStation[] {
  if (operations.length === 0 || stationCount === 0) return [];

  const totalSmv = operations.reduce((s, o) => s + o.smv, 0);
  const targetPerStation = totalSmv / stationCount;

  // Sort operations by SMV descending for better distribution
  const sorted = [...operations].sort((a, b) => b.smv - a.smv);

  // Create stations
  const stations: OperatorStation[] = Array.from({ length: stationCount }, (_, i) => ({
    id: generateId(),
    name: `Station ${i + 1}`,
    operations: [],
    totalSmv: 0,
  }));

  // Greedy assignment: assign each operation to the station with lowest current load
  for (const op of sorted) {
    const minStation = stations.reduce((min, s) => (s.totalSmv < min.totalSmv ? s : min), stations[0]);
    minStation.operations.push(op);
    minStation.totalSmv = +(minStation.totalSmv + op.smv).toFixed(2);
  }

  return stations;
}

// ── Station Visual ─────────────────────────
function StationCard({
  station,
  targetSmv,
  maxSmv,
}: {
  station: OperatorStation;
  targetSmv: number;
  maxSmv: number;
}) {
  const utilization = targetSmv > 0 ? Math.round((station.totalSmv / targetSmv) * 100) : 0;
  const isOverloaded = utilization > 110;
  const isUnderloaded = utilization < 85;
  const barWidth = maxSmv > 0 ? (station.totalSmv / maxSmv) * 100 : 0;

  return (
    <div className="border border-border rounded-xl p-3 space-y-2 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{station.name}</span>
        <Badge
          variant={isOverloaded ? "destructive" : isUnderloaded ? "outline" : "default"}
          className="text-[10px]"
        >
          {utilization}%
        </Badge>
      </div>

      {/* SMV bar */}
      <div className="relative h-6 rounded bg-muted/50 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded transition-all ${
            isOverloaded
              ? "bg-destructive/70"
              : isUnderloaded
              ? "bg-amber-500/50"
              : "bg-emerald-500/60"
          }`}
          style={{ width: `${Math.min(barWidth, 100)}%` }}
        />
        {/* Target line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/30"
          style={{ left: `${maxSmv > 0 ? (targetSmv / maxSmv) * 100 : 0}%` }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
          {station.totalSmv} min
        </span>
      </div>

      {/* Operations list */}
      <div className="space-y-0.5">
        {station.operations.map(op => (
          <div key={op.id} className="flex items-center justify-between text-[10px] px-1 py-0.5 rounded hover:bg-muted/30">
            <span className="text-foreground truncate">{op.name}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {op.machineType && (
                <Badge variant="outline" className="text-[8px] px-1 py-0">{op.machineType}</Badge>
              )}
              <span className="text-muted-foreground font-mono">{op.smv}m</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Line Balancing Tool ───────────────
export function LineBalancingTool({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [operations, setOperations] = useState<Operation[]>(() =>
    SAMPLE_OPERATIONS.map(o => ({ ...o, id: generateId() }))
  );
  const [stationCount, setStationCount] = useState(5);
  const [newOpName, setNewOpName] = useState("");
  const [newOpSmv, setNewOpSmv] = useState("");
  const [newOpMachine, setNewOpMachine] = useState("");
  const [stations, setStations] = useState<OperatorStation[]>([]);

  const totalSmv = useMemo(() => +(operations.reduce((s, o) => s + o.smv, 0)).toFixed(2), [operations]);
  const targetPerStation = stationCount > 0 ? +(totalSmv / stationCount).toFixed(2) : 0;

  const addOperation = () => {
    if (!newOpName || !newOpSmv) return;
    setOperations(prev => [...prev, { id: generateId(), name: newOpName, smv: Number(newOpSmv), machineType: newOpMachine || undefined }]);
    setNewOpName("");
    setNewOpSmv("");
    setNewOpMachine("");
  };

  const removeOperation = (id: string) => {
    setOperations(prev => prev.filter(o => o.id !== id));
  };

  const handleBalance = () => {
    const result = autoBalance(operations, stationCount);
    setStations(result);
    toast({ title: "Line balanced", description: `${operations.length} operations distributed across ${stationCount} stations` });
  };

  const maxSmv = useMemo(() => {
    if (stations.length === 0) return targetPerStation;
    return Math.max(...stations.map(s => s.totalSmv), targetPerStation) * 1.1;
  }, [stations, targetPerStation]);

  // Balance metrics
  const balanceMetrics = useMemo(() => {
    if (stations.length === 0) return null;
    const smvs = stations.map(s => s.totalSmv);
    const max = Math.max(...smvs);
    const min = Math.min(...smvs);
    const imbalance = max > 0 ? Math.round(((max - min) / max) * 100) : 0;
    const lineEfficiency = max > 0 ? Math.round((totalSmv / (max * stationCount)) * 100) : 0;
    const bottleneck = stations.find(s => s.totalSmv === max)?.name || "";
    return { max, min, imbalance, lineEfficiency, bottleneck };
  }, [stations, totalSmv, stationCount]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Line Balancing Tool
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Operations Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold">Operations ({operations.length})</Label>
              <span className="text-[10px] text-muted-foreground">Total SMV: {totalSmv} min</span>
            </div>

            {/* Add operation row */}
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Operation name"
                value={newOpName}
                onChange={e => setNewOpName(e.target.value)}
                className="flex-1 h-8 text-xs"
                onKeyDown={e => e.key === "Enter" && addOperation()}
              />
              <Input
                type="number"
                placeholder="SMV"
                value={newOpSmv}
                onChange={e => setNewOpSmv(e.target.value)}
                className="w-20 h-8 text-xs"
                step={0.1}
              />
              <Input
                placeholder="Machine"
                value={newOpMachine}
                onChange={e => setNewOpMachine(e.target.value)}
                className="w-20 h-8 text-xs"
              />
              <Button size="sm" variant="outline" onClick={addOperation} className="h-8 px-2">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Operations list */}
            <div className="max-h-[140px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {operations.map(op => (
                <div key={op.id} className="flex items-center justify-between px-3 py-1.5 text-xs hover:bg-muted/30">
                  <span className="text-foreground">{op.name}</span>
                  <div className="flex items-center gap-2">
                    {op.machineType && <Badge variant="outline" className="text-[9px] px-1">{op.machineType}</Badge>}
                    <span className="text-muted-foreground font-mono w-12 text-right">{op.smv} min</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeOperation(op.id)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Station count + balance button */}
          <div className="flex items-end gap-3">
            <div>
              <Label className="text-xs">Stations / Operators</Label>
              <Input
                type="number"
                value={stationCount}
                onChange={e => setStationCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 h-8 text-xs mt-1"
                min={1}
              />
            </div>
            <div className="text-[10px] text-muted-foreground pb-1.5">
              Target: <span className="font-semibold text-foreground">{targetPerStation} min</span> / station
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStations([])} disabled={stations.length === 0}>
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
              <Button size="sm" onClick={handleBalance} disabled={operations.length === 0}>
                <Zap className="h-3.5 w-3.5 mr-1" /> Auto-Balance
              </Button>
            </div>
          </div>

          {/* Balance Metrics */}
          {balanceMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="text-[10px] text-muted-foreground">Line Efficiency</p>
                <p className={`text-lg font-bold ${balanceMetrics.lineEfficiency >= 85 ? "text-emerald-600" : balanceMetrics.lineEfficiency >= 70 ? "text-amber-600" : "text-destructive"}`}>
                  {balanceMetrics.lineEfficiency}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="text-[10px] text-muted-foreground">Imbalance</p>
                <p className={`text-lg font-bold ${balanceMetrics.imbalance <= 15 ? "text-emerald-600" : "text-amber-600"}`}>
                  {balanceMetrics.imbalance}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="text-[10px] text-muted-foreground">Bottleneck</p>
                <p className="text-sm font-bold text-foreground">{balanceMetrics.bottleneck}</p>
                <p className="text-[9px] text-muted-foreground">{balanceMetrics.max} min</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/40">
                <p className="text-[10px] text-muted-foreground">Range</p>
                <p className="text-sm font-bold text-foreground">{balanceMetrics.min} – {balanceMetrics.max} min</p>
              </div>
            </div>
          )}

          {/* Station Cards */}
          {stations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stations.map(s => (
                <StationCard key={s.id} station={s} targetSmv={targetPerStation} maxSmv={maxSmv} />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
