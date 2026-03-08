import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { allLines, type SewingLine, type Alert } from "@/data/mock-data";

// ── Types ──────────────────────────────────────────────
export interface AlertRule {
  id: string;
  name: string;
  type: "Production" | "Quality" | "Machine" | "Material";
  metric: string;
  condition: "below" | "above" | "equals";
  threshold: number;
  severity: "warning" | "critical";
  enabled: boolean;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  type: AlertRule["type"];
  severity: AlertRule["severity"];
  message: string;
  lineId: string;
  lineName: string;
  factoryId: string;
  metricValue: number;
  threshold: number;
  timestamp: string;
}

// ── Metric options (shared) ────────────────────────────
export const metricOptions: Record<string, { label: string; value: string }[]> = {
  Production: [
    { label: "Line Efficiency (%)", value: "efficiency" },
    { label: "Hourly Output (pcs)", value: "hourly_output" },
    { label: "Target Variance (%)", value: "target_variance" },
  ],
  Quality: [
    { label: "DHU Rate (%)", value: "dhu_rate" },
    { label: "Defect Count", value: "defect_count" },
    { label: "Rework Rate (%)", value: "rework_rate" },
  ],
  Machine: [
    { label: "Downtime (min)", value: "downtime_minutes" },
    { label: "Breakdown Count", value: "breakdown_count" },
    { label: "Maintenance Overdue (days)", value: "maintenance_overdue" },
  ],
  Material: [
    { label: "Bundle Wait Time (min)", value: "bundle_wait" },
    { label: "Stock Level (%)", value: "stock_level" },
    { label: "Supply Delay (hrs)", value: "supply_delay" },
  ],
};

export function getMetricLabel(type: string, metric: string) {
  return metricOptions[type]?.find(m => m.value === metric)?.label || metric;
}

// ── Default rules ──────────────────────────────────────
const defaultRules: AlertRule[] = [
  { id: "R1", name: "Low Efficiency Alert", type: "Production", metric: "efficiency", condition: "below", threshold: 55, severity: "critical", enabled: true },
  { id: "R2", name: "Efficiency Warning", type: "Production", metric: "efficiency", condition: "below", threshold: 70, severity: "warning", enabled: true },
  { id: "R3", name: "High DHU Rate", type: "Quality", metric: "dhu_rate", condition: "above", threshold: 8, severity: "critical", enabled: true },
  { id: "R4", name: "Machine Downtime Spike", type: "Machine", metric: "downtime_minutes", condition: "above", threshold: 30, severity: "warning", enabled: true },
  { id: "R5", name: "Bundle Supply Delay", type: "Material", metric: "bundle_wait", condition: "above", threshold: 15, severity: "warning", enabled: false },
];

// ── Simulated metric extraction per line ───────────────
// In production these would come from real sensors / DB queries.
// For now we derive from the mock SewingLine data + deterministic simulation.
function getLineMetricValue(line: SewingLine, metric: string): number | null {
  switch (metric) {
    // Production
    case "efficiency":
      return line.efficiency;
    case "hourly_output":
      return Math.round(line.actual / 8); // simulated 8-hour day
    case "target_variance": {
      const variance = ((line.actual - line.target) / line.target) * 100;
      return Math.round(variance);
    }
    // Quality (simulated from efficiency — lower efficiency → higher defects)
    case "dhu_rate":
      return Math.max(0, Math.round((100 - line.efficiency) * 0.12 * 10) / 10);
    case "defect_count":
      return Math.max(0, Math.round((100 - line.efficiency) * 0.8));
    case "rework_rate":
      return Math.max(0, Math.round((100 - line.efficiency) * 0.08 * 10) / 10);
    // Machine (simulated from operator count + random seed)
    case "downtime_minutes":
      return Math.round((100 - line.efficiency) * 0.6);
    case "breakdown_count":
      return line.status === "critical" ? 3 : line.status === "warning" ? 1 : 0;
    case "maintenance_overdue":
      return line.status === "critical" ? 7 : line.status === "warning" ? 2 : 0;
    // Material
    case "bundle_wait":
      return Math.round((100 - line.efficiency) * 0.35);
    case "stock_level":
      return Math.round(line.efficiency * 1.1);
    case "supply_delay":
      return line.status === "critical" ? 4 : line.status === "warning" ? 1.5 : 0;
    default:
      return null;
  }
}

function checkCondition(value: number, condition: AlertRule["condition"], threshold: number): boolean {
  switch (condition) {
    case "below": return value < threshold;
    case "above": return value > threshold;
    case "equals": return value === threshold;
  }
}

// ── Engine: evaluate all enabled rules against lines ───
export function evaluateRules(rules: AlertRule[], lines: SewingLine[]): TriggeredAlert[] {
  const triggered: TriggeredAlert[] = [];
  const enabledRules = rules.filter(r => r.enabled);

  for (const rule of enabledRules) {
    for (const line of lines) {
      const value = getLineMetricValue(line, rule.metric);
      if (value === null) continue;
      if (checkCondition(value, rule.condition, rule.threshold)) {
        triggered.push({
          id: `T-${rule.id}-${line.id}`,
          ruleId: rule.id,
          ruleName: rule.name,
          type: rule.type,
          severity: rule.severity,
          message: `${rule.name}: ${getMetricLabel(rule.type, rule.metric)} is ${value} (threshold: ${rule.condition} ${rule.threshold}) on ${line.name}`,
          lineId: line.id,
          lineName: line.name,
          factoryId: line.factoryId,
          metricValue: value,
          threshold: rule.threshold,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return triggered;
}

// ── Context ────────────────────────────────────────────
interface AlertRulesContextType {
  rules: AlertRule[];
  addRule: (rule: Omit<AlertRule, "id">) => void;
  updateRule: (rule: AlertRule) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  triggeredAlerts: TriggeredAlert[];
  getTriggeredForFactory: (factoryId?: string) => TriggeredAlert[];
}

const AlertRulesContext = createContext<AlertRulesContextType | null>(null);

export function AlertRulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);

  const addRule = useCallback((rule: Omit<AlertRule, "id">) => {
    setRules(prev => [...prev, { ...rule, id: `R${Date.now()}` }]);
  }, []);

  const updateRule = useCallback((rule: AlertRule) => {
    setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const triggeredAlerts = useMemo(() => evaluateRules(rules, allLines), [rules]);

  const getTriggeredForFactory = useCallback((factoryId?: string) => {
    if (!factoryId) return triggeredAlerts;
    return triggeredAlerts.filter(a => a.factoryId === factoryId);
  }, [triggeredAlerts]);

  return (
    <AlertRulesContext.Provider value={{ rules, addRule, updateRule, deleteRule, toggleRule, triggeredAlerts, getTriggeredForFactory }}>
      {children}
    </AlertRulesContext.Provider>
  );
}

export function useAlertRules() {
  const ctx = useContext(AlertRulesContext);
  if (!ctx) throw new Error("useAlertRules must be used within AlertRulesProvider");
  return ctx;
}
