import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { computeCapacity } from "@/components/CapacityCalculator";
import {
  Users, Timer, Target, TrendingUp, Gauge, Zap, ArrowRight, FlaskConical, Copy,
} from "lucide-react";

const DEFAULT_HOURS = 10;

interface Scenario {
  manpower: number;
  smv: number;
  workingHours: number;
  plannedQty: number;
}

function MetricBox({
  icon: Icon,
  label,
  value,
  sub,
  color,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-3 rounded-xl transition-all ${highlight ? "ring-2 ring-primary/30 bg-primary/5" : "bg-muted/40"}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function ScenarioCard({
  scenario,
  label,
  color,
}: {
  scenario: Scenario;
  label: string;
  color: string;
}) {
  const result = useMemo(() => computeCapacity(scenario), [scenario]);

  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 ${color}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <Badge variant="outline" className="text-[10px]">
          {scenario.manpower} ops · {scenario.smv} SMV · {scenario.workingHours}h
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricBox icon={Target} label="Daily Target" value={result.targetOutput.toLocaleString()} sub={`${result.targetPerHour}/hr`} color="bg-emerald-500/10 text-emerald-600" />
        <MetricBox icon={Timer} label="Available Min" value={result.availableMinutes.toLocaleString()} color="bg-blue-500/10 text-blue-600" />
        <MetricBox icon={TrendingUp} label="Days to Complete" value={result.daysToComplete || "—"} sub={scenario.plannedQty > 0 ? `for ${scenario.plannedQty.toLocaleString()} pcs` : undefined} color="bg-violet-500/10 text-violet-600" />
        <MetricBox icon={Gauge} label="Utilization" value={result.utilization > 0 ? `${result.utilization}%` : "—"} color="bg-amber-500/10 text-amber-600" />
      </div>
    </div>
  );
}

export function WhatIfSimulator({
  open,
  onOpenChange,
  onApply,
  initialManpower = 30,
  initialSmv = 8,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (values: { manpower: number; smv: number; workingHours: number; targetPerHour: number }) => void;
  initialManpower?: number;
  initialSmv?: number;
}) {
  const [manpower, setManpower] = useState(initialManpower);
  const [smv, setSmv] = useState(initialSmv);
  const [workingHours, setWorkingHours] = useState(DEFAULT_HOURS);
  const [plannedQty, setPlannedQty] = useState(5000);
  const [compareMode, setCompareMode] = useState(false);
  const [savedScenario, setSavedScenario] = useState<Scenario | null>(null);

  const currentScenario: Scenario = { manpower, smv, workingHours, plannedQty };
  const result = useMemo(() => computeCapacity(currentScenario), [currentScenario]);

  const handleApply = () => {
    onApply?.({
      manpower,
      smv,
      workingHours,
      targetPerHour: result.targetPerHour,
    });
    onOpenChange(false);
  };

  const handleSaveForCompare = () => {
    setSavedScenario({ ...currentScenario });
    setCompareMode(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            What-If Capacity Simulator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Sliders */}
          <div className="space-y-4">
            {/* Manpower */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" /> Manpower
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={manpower}
                    onChange={e => setManpower(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 h-7 text-xs text-center"
                  />
                  <span className="text-[10px] text-muted-foreground">operators</span>
                </div>
              </div>
              <Slider
                value={[manpower]}
                onValueChange={([v]) => setManpower(v)}
                min={5}
                max={80}
                step={1}
                className="py-1"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>5</span><span>20</span><span>40</span><span>60</span><span>80</span>
              </div>
            </div>

            {/* SMV */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5 text-muted-foreground" /> SMV (Standard Minute Value)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={smv}
                    onChange={e => setSmv(Math.max(0.5, Number(e.target.value) || 0.5))}
                    className="w-20 h-7 text-xs text-center"
                    step={0.5}
                  />
                  <span className="text-[10px] text-muted-foreground">min</span>
                </div>
              </div>
              <Slider
                value={[smv]}
                onValueChange={([v]) => setSmv(v)}
                min={1}
                max={30}
                step={0.5}
                className="py-1"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span>1</span><span>8</span><span>15</span><span>22</span><span>30</span>
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-muted-foreground" /> Working Hours
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={workingHours}
                    onChange={e => setWorkingHours(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                    className="w-20 h-7 text-xs text-center"
                  />
                  <span className="text-[10px] text-muted-foreground">hrs</span>
                </div>
              </div>
              <Slider
                value={[workingHours]}
                onValueChange={([v]) => setWorkingHours(v)}
                min={4}
                max={16}
                step={0.5}
                className="py-1"
              />
            </div>

            {/* Planned Qty */}
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-muted-foreground" /> Order Quantity (for days calc)
              </Label>
              <Input
                type="number"
                value={plannedQty}
                onChange={e => setPlannedQty(Number(e.target.value) || 0)}
                className="w-28 h-7 text-xs text-center"
              />
            </div>
          </div>

          {/* Flow visualization */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground py-2 px-3 rounded-lg bg-muted/30">
            <span className="font-semibold text-foreground">{manpower}</span> ops
            <ArrowRight className="h-3 w-3" />
            <span className="font-semibold text-foreground">{smv}</span> SMV
            <ArrowRight className="h-3 w-3" />
            <span className="font-semibold text-primary">{result.targetPerHour}</span> pcs/hr
            <ArrowRight className="h-3 w-3" />
            <span className="font-semibold text-primary">{result.targetOutput.toLocaleString()}</span> pcs/day
            {result.daysToComplete > 0 && (
              <>
                <ArrowRight className="h-3 w-3" />
                <span className="font-semibold text-foreground">{result.daysToComplete}</span> days
              </>
            )}
          </div>

          {/* Results */}
          {compareMode && savedScenario ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ScenarioCard scenario={savedScenario} label="Scenario A (Saved)" color="border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20" />
              <ScenarioCard scenario={currentScenario} label="Scenario B (Current)" color="border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <MetricBox icon={Timer} label="Available Minutes" value={result.availableMinutes.toLocaleString()} sub={`${manpower} × ${result.workingMinutes} min`} color="bg-blue-500/10 text-blue-600" />
              <MetricBox icon={Target} label="Daily Target" value={result.targetOutput.toLocaleString()} sub={`${result.targetPerHour}/hr`} color="bg-emerald-500/10 text-emerald-600" highlight />
              <MetricBox icon={TrendingUp} label="Days to Complete" value={result.daysToComplete || "—"} sub={plannedQty > 0 ? `for ${plannedQty.toLocaleString()} pcs` : undefined} color="bg-violet-500/10 text-violet-600" />
              <MetricBox icon={Gauge} label="Capacity Used" value={result.utilization > 0 ? `${result.utilization}%` : "—"} color="bg-amber-500/10 text-amber-600" />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveForCompare} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            {compareMode ? "Update Scenario A" : "Save & Compare"}
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            {onApply && (
              <Button onClick={handleApply} className="gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Apply to Plan
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
