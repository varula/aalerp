import { useState, useEffect, useCallback, useRef } from "react";
import { allLines, alerts, type SewingLine, type Alert } from "@/data/mock-data";

export interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: "efficiency" | "status" | "alert";
  message: string;
  severity: "normal" | "warning" | "critical";
  lineId?: string;
}

interface SimulationState {
  lines: SewingLine[];
  alerts: Alert[];
  lastUpdate: Date;
  updatedLineIds: Set<string>;
  updatedAlertIds: Set<string>;
  isLive: boolean;
  activityFeed: ActivityEvent[];
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function jitter(value: number, range: number) {
  return value + (Math.random() - 0.5) * 2 * range;
}

function simulateLineUpdate(line: SewingLine): SewingLine {
  // Small random walk on efficiency
  const newEff = clamp(Math.round(jitter(line.efficiency, 3)), 25, 99);
  const newActual = Math.round(line.target * newEff / 100);
  const status: SewingLine["status"] =
    newEff >= 70 ? "normal" : newEff >= 55 ? "warning" : "critical";

  return { ...line, efficiency: newEff, actual: newActual, status };
}

const ALERT_MESSAGES: Record<string, string[]> = {
  Production: [
    "Output below hourly target by 15%",
    "Line efficiency dropped below 55%",
    "Bundle waiting time exceeded threshold",
    "Production pace declining — check bottleneck",
  ],
  Quality: [
    "DHU rate exceeded 3% threshold",
    "Skip stitch defects increasing",
    "AQL inspection failed — lot hold",
    "Shade variation detected in batch",
  ],
  Machine: [
    "Needle breakage — SNLS #4",
    "Oil leak detected on overlock machine",
    "Motor temperature above threshold",
    "Bobbin winder malfunction",
  ],
  Material: [
    "Fabric roll nearing end — restock needed",
    "Thread shade mismatch reported",
    "Zipper supply running low",
    "Interlining stock below minimum",
  ],
};

function maybeGenerateAlert(lines: SewingLine[]): Alert | null {
  if (Math.random() > 0.15) return null; // 15% chance per tick

  const line = lines[Math.floor(Math.random() * lines.length)];
  const types = Object.keys(ALERT_MESSAGES) as Alert["type"][];
  const type = types[Math.floor(Math.random() * types.length)];
  const msgs = ALERT_MESSAGES[type];
  const message = msgs[Math.floor(Math.random() * msgs.length)];
  const severity: Alert["severity"] =
    line.status === "critical" ? "critical" : Math.random() > 0.6 ? "warning" : "normal";

  return {
    id: `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    severity,
    message,
    lineId: line.id,
    factoryId: line.factoryId,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
}

export function useRealtimeSimulation(intervalMs = 5000) {
  const [state, setState] = useState<SimulationState>(() => ({
    lines: [...allLines],
    alerts: [...alerts],
    lastUpdate: new Date(),
    updatedLineIds: new Set(),
    updatedAlertIds: new Set(),
    isLive: true,
    activityFeed: [],
  }));

  const tickRef = useRef(0);

  const tick = useCallback(() => {
    setState(prev => {
      const updateCount = Math.max(2, Math.floor(prev.lines.length * (0.2 + Math.random() * 0.15)));
      const indices = new Set<number>();
      while (indices.size < updateCount) {
        indices.add(Math.floor(Math.random() * prev.lines.length));
      }

      const updatedIds = new Set<string>();
      const newEvents: ActivityEvent[] = [];
      const now = new Date();

      const newLines = prev.lines.map((line, i) => {
        if (indices.has(i)) {
          updatedIds.add(line.id);
          const updated = simulateLineUpdate(line);

          // Generate activity events for notable changes
          const effDiff = updated.efficiency - line.efficiency;
          if (Math.abs(effDiff) >= 2) {
            newEvents.push({
              id: `evt-${now.getTime()}-${line.id}`,
              timestamp: now,
              type: "efficiency",
              message: `${line.name} efficiency ${effDiff > 0 ? "↑" : "↓"} ${line.efficiency}% → ${updated.efficiency}%`,
              severity: updated.status,
              lineId: line.id,
            });
          }

          if (updated.status !== line.status) {
            newEvents.push({
              id: `evt-status-${now.getTime()}-${line.id}`,
              timestamp: now,
              type: "status",
              message: `${line.name} status changed to ${updated.status}`,
              severity: updated.status,
              lineId: line.id,
            });
          }

          return updated;
        }
        return line;
      });

      // Maybe add a new alert
      const newAlert = maybeGenerateAlert(newLines);
      const newAlertIds = new Set<string>();
      let newAlerts = prev.alerts;
      if (newAlert) {
        newAlertIds.add(newAlert.id);
        newAlerts = [newAlert, ...prev.alerts].slice(0, 50);
        const alertLine = newLines.find(l => l.id === newAlert.lineId);
        newEvents.push({
          id: `evt-alert-${newAlert.id}`,
          timestamp: now,
          type: "alert",
          message: `🚨 ${newAlert.message} (${alertLine?.name || "—"})`,
          severity: newAlert.severity,
          lineId: newAlert.lineId,
        });
      }

      return {
        lines: newLines,
        alerts: newAlerts,
        lastUpdate: now,
        updatedLineIds: updatedIds,
        updatedAlertIds: newAlertIds,
        isLive: true,
        activityFeed: [...newEvents, ...prev.activityFeed].slice(0, 30),
      };
    });
    tickRef.current++;
  }, []);

  useEffect(() => {
    const t = setInterval(tick, intervalMs);
    return () => clearInterval(t);
  }, [tick, intervalMs]);

  const toggleLive = useCallback(() => {
    setState(prev => ({ ...prev, isLive: !prev.isLive }));
  }, []);

  return { ...state, toggleLive, tick };
}

/** Utility: returns a className that flashes when the value just updated */
export function useFlashClass(isUpdated: boolean) {
  return isUpdated ? "animate-value-flash" : "";
}
