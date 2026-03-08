import { type SewingLine, type Alert, downtimeReasons, DENIM_DEFECTS, factoryLevelKPIs } from "@/data/mock-data";

/**
 * Compute KPIs from a live set of lines + alerts (for simulation).
 */
export function computeKPIs(lines: SewingLine[], liveAlerts: Alert[], factoryId?: string) {
  const totalOutput = lines.reduce((s, l) => s + l.actual, 0);
  const totalTarget = lines.reduce((s, l) => s + l.target, 0);
  const avgEfficiency = lines.length
    ? Math.round(lines.reduce((s, l) => s + l.efficiency, 0) / lines.length)
    : 0;
  const activeLines = lines.length;
  const totalDowntime = downtimeReasons.reduce((s, d) => s + d.minutes, 0);
  const pendingAlerts = liveAlerts.filter(a => !a.acknowledged).length;
  const totalDefects = DENIM_DEFECTS.reduce((s, d) => s + d.count, 0);
  const totalInspected = Math.round(totalDefects / 0.022);
  const dhu = +(totalDefects / totalInspected * 100).toFixed(1);
  const rft = +(100 - dhu).toFixed(1);

  const fKPIs = factoryId ? factoryLevelKPIs.find(k => k.factoryId === factoryId) : undefined;
  const cutToShipRatio = fKPIs
    ? Number(fKPIs.cutToShipRatio)
    : +(factoryLevelKPIs.reduce((s, k) => s + Number(k.cutToShipRatio), 0) / factoryLevelKPIs.length).toFixed(1);

  return { totalOutput, totalTarget, avgEfficiency, activeLines, totalDowntime, pendingAlerts, dhu, rft, cutToShipRatio };
}
