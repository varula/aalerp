import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Users, Timer, Target, TrendingUp, Gauge, ArrowRight } from "lucide-react";

// ── Constants ──────────────────────────────
const DEFAULT_WORKING_HOURS = 10; // 10-hour single shift

// ── Core Calculations ──────────────────────
export interface CapacityInputs {
  manpower: number;
  smv: number;
  workingHours?: number;
  actualOutput?: number;
  plannedQty?: number;
}

export interface CapacityResults {
  workingMinutes: number;
  availableMinutes: number;
  targetOutput: number;
  targetPerHour: number;
  earnedMinutes: number;
  efficiency: number;
  utilization: number;
  daysToComplete: number;
  isValid: boolean;
}

export function computeCapacity(inputs: CapacityInputs): CapacityResults {
  const hours = inputs.workingHours || DEFAULT_WORKING_HOURS;
  const workingMinutes = hours * 60;
  const availableMinutes = inputs.manpower * workingMinutes;
  const targetOutput = inputs.smv > 0 ? Math.floor(availableMinutes / inputs.smv) : 0;
  const targetPerHour = inputs.smv > 0 ? Math.floor((inputs.manpower * 60) / inputs.smv) : 0;
  const earnedMinutes = (inputs.actualOutput || 0) * inputs.smv;
  const efficiency = availableMinutes > 0 ? Math.round((earnedMinutes / availableMinutes) * 100) : 0;
  const utilization = targetOutput > 0 && inputs.plannedQty
    ? Math.round((inputs.plannedQty / targetOutput) * 100)
    : 0;
  const daysToComplete = targetPerHour > 0 && inputs.plannedQty
    ? Math.ceil(inputs.plannedQty / (targetPerHour * hours))
    : 0;

  return {
    workingMinutes,
    availableMinutes,
    targetOutput,
    targetPerHour,
    earnedMinutes,
    efficiency,
    utilization,
    daysToComplete,
    isValid: inputs.manpower > 0 && inputs.smv > 0,
  };
}

// ── Metric Card ────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

// ── Inline Capacity Panel (for form dialog) ──
export function CapacityPanel({ inputs }: { inputs: CapacityInputs }) {
  const result = useMemo(() => computeCapacity(inputs), [inputs]);

  if (!result.isValid) {
    return (
      <div className="md:col-span-2 rounded-xl border border-dashed border-border p-4 text-center">
        <Zap className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Enter <span className="font-medium text-foreground">Manpower</span> and{" "}
          <span className="font-medium text-foreground">SMV</span> to see capacity calculations
        </p>
      </div>
    );
  }

  return (
    <div className="md:col-span-2 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Auto-Calculated Capacity</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {inputs.workingHours || DEFAULT_WORKING_HOURS}h shift
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard
          icon={Timer}
          label="Available Minutes"
          value={result.availableMinutes.toLocaleString()}
          sub={`${inputs.manpower} × ${result.workingMinutes} min`}
          color="bg-blue-500/10 text-blue-600"
        />
        <MetricCard
          icon={Target}
          label="Daily Target"
          value={result.targetOutput.toLocaleString()}
          sub={`${result.targetPerHour}/hr`}
          color="bg-emerald-500/10 text-emerald-600"
        />
        <MetricCard
          icon={Gauge}
          label="Efficiency"
          value={`${result.efficiency}%`}
          sub={`${result.earnedMinutes.toLocaleString()} earned min`}
          color={`${result.efficiency >= 60 ? "bg-emerald-500/10 text-emerald-600" : result.efficiency >= 40 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive"}`}
        />
        <MetricCard
          icon={TrendingUp}
          label="Days to Complete"
          value={result.daysToComplete || "—"}
          sub={result.utilization > 0 ? `${result.utilization}% capacity used` : undefined}
          color="bg-violet-500/10 text-violet-600"
        />
      </div>

      {/* Efficiency bar */}
      {result.efficiency > 0 && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Line Efficiency</span>
            <span className="text-[10px] font-bold text-foreground">{result.efficiency}%</span>
          </div>
          <Progress value={Math.min(result.efficiency, 100)} className="h-1.5" />
        </div>
      )}

      {/* Capacity flow visualization */}
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground py-1">
        <span className="font-medium text-foreground">{inputs.manpower}</span> operators
        <ArrowRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{inputs.smv}</span> SMV
        <ArrowRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{result.targetPerHour}</span> pcs/hr
        <ArrowRight className="h-3 w-3" />
        <span className="font-medium text-foreground">{result.targetOutput}</span> pcs/day
      </div>
    </div>
  );
}

// ── Sewing Capacity KPI Row (for tab overview) ──
export function SewingCapacityKPIs({ records }: { records: any[] }) {
  const totals = useMemo(() => {
    let totalTarget = 0;
    let totalActual = 0;
    let totalAvailMin = 0;
    let totalEarnedMin = 0;
    let lineCount = 0;

    for (const r of records) {
      const mp = Number(r.manpower) || 0;
      const smv = Number(r.smv) || 0;
      const hours = Number(r.workingHours) || DEFAULT_WORKING_HOURS;
      const actual = Number(r.actualQty) || 0;

      if (mp > 0 && smv > 0) {
        const avail = mp * hours * 60;
        const target = Math.floor(avail / smv);
        totalTarget += target;
        totalActual += actual;
        totalAvailMin += avail;
        totalEarnedMin += actual * smv;
        lineCount++;
      }
    }

    const avgEfficiency = totalAvailMin > 0 ? Math.round((totalEarnedMin / totalAvailMin) * 100) : 0;
    const totalManpower = records.reduce((s, r) => s + (Number(r.manpower) || 0), 0);

    return { totalTarget, totalActual, avgEfficiency, totalManpower, lineCount, totalAvailMin };
  }, [records]);

  if (totals.lineCount === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Capacity Planning Summary</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{totals.lineCount} lines with capacity data</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard icon={Users} label="Total Manpower" value={totals.totalManpower} color="bg-blue-500/10 text-blue-600" />
          <MetricCard icon={Target} label="Daily Capacity" value={totals.totalTarget.toLocaleString()} sub="pcs/day" color="bg-emerald-500/10 text-emerald-600" />
          <MetricCard icon={TrendingUp} label="Actual Output" value={totals.totalActual.toLocaleString()} color="bg-amber-500/10 text-amber-600" />
          <MetricCard
            icon={Gauge}
            label="Avg Efficiency"
            value={`${totals.avgEfficiency}%`}
            color={`${totals.avgEfficiency >= 60 ? "bg-emerald-500/10 text-emerald-600" : totals.avgEfficiency >= 40 ? "bg-amber-500/10 text-amber-600" : "bg-destructive/10 text-destructive"}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
