import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Activity, TrendingUp, TrendingDown, DollarSign, Users, Scissors,
  Package, Truck, Clock, Shield, HeartPulse, UserMinus, ArrowUpDown,
  Factory, CheckCircle2, Target,
} from "lucide-react";
import { factoryLevelKPIs, getFactoryInfo, type FactoryLevelKPI } from "@/data/mock-data";

function getStatus(value: number, good: number, warn: number, higherIsBetter = true): "success" | "warning" | "critical" {
  if (higherIsBetter) return value >= good ? "success" : value >= warn ? "warning" : "critical";
  return value <= good ? "success" : value <= warn ? "warning" : "critical";
}

function StatusBadge({ status }: { status: "success" | "warning" | "critical" }) {
  const variant = status === "success" ? "default" : status === "warning" ? "secondary" : "destructive";
  const label = status === "success" ? "On Track" : status === "warning" ? "Watch" : "Critical";
  return <Badge variant={variant} className="text-[10px] px-1.5 py-0">{label}</Badge>;
}

function TrendIcon({ value, threshold, higherIsBetter = true }: { value: number; threshold: number; higherIsBetter?: boolean }) {
  const isGood = higherIsBetter ? value >= threshold : value <= threshold;
  return isGood
    ? <TrendingUp className="h-4 w-4 text-status-success" />
    : <TrendingDown className="h-4 w-4 text-status-critical" />;
}

interface KPICardData {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  status: "success" | "warning" | "critical";
  target: string;
}

export default function FactoryKPIs() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const factoryInfo = getFactoryInfo(selectedFactory);

  const kpis = selectedFactory === "all"
    ? factoryLevelKPIs
    : factoryLevelKPIs.filter(k => k.factoryId === selectedFactory);

  // Aggregate for summary cards (average across selected factories)
  const avg = (key: keyof FactoryLevelKPI) => {
    const vals = kpis.map(k => Number(k[key]));
    return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
  };

  const summaryCards: KPICardData[] = [
    { label: "Factory Efficiency", value: `${avg("factoryEfficiency")}`, unit: "%", icon: Activity, status: getStatus(avg("factoryEfficiency"), 70, 55), target: "≥70%" },
    { label: "Labor Productivity", value: `${avg("overallLaborProductivity")}`, unit: "pcs/op/hr", icon: Users, status: getStatus(avg("overallLaborProductivity"), 15, 12), target: "≥15" },
    { label: "Cost / Std Min", value: `$${avg("costPerStandardMinute").toFixed(3)}`, unit: "", icon: DollarSign, status: getStatus(avg("costPerStandardMinute"), 0.05, 0.06, false), target: "≤$0.05" },
    { label: "On Time Delivery", value: `${avg("onTimeDeliveryRate")}`, unit: "%", icon: Truck, status: getStatus(avg("onTimeDeliveryRate"), 95, 90), target: "≥95%" },
    { label: "RFT Quality", value: `${avg("rftQuality")}`, unit: "%", icon: CheckCircle2, status: getStatus(avg("rftQuality"), 97, 95), target: "≥97%" },
    { label: "DHU%", value: `${avg("dhuPercent")}`, unit: "%", icon: Shield, status: getStatus(avg("dhuPercent"), 2.5, 4, false), target: "≤2.5%" },
  ];

  const allKpiRows = [
    { label: "Factory Efficiency", key: "factoryEfficiency" as const, unit: "%", icon: Activity, target: "≥70%", good: 70, warn: 55, higher: true },
    { label: "Overall Labor Productivity", key: "overallLaborProductivity" as const, unit: "pcs/op/hr", icon: Users, target: "≥15", good: 15, warn: 12, higher: true },
    { label: "Cost per Standard Minute", key: "costPerStandardMinute" as const, unit: "$", icon: DollarSign, target: "≤$0.05", good: 0.05, warn: 0.06, higher: false },
    { label: "Man to Machine Ratio", key: "manToMachineRatio" as const, unit: ":1", icon: ArrowUpDown, target: "1.15:1", good: 1.2, warn: 1.35, higher: false },
    { label: "Cut to Ship Ratio", key: "cutToShipRatio" as const, unit: "%", icon: Scissors, target: "≥95%", good: 95, warn: 92, higher: true },
    { label: "Order to Ship Ratio", key: "orderToShipRatio" as const, unit: "%", icon: Package, target: "≥96%", good: 96, warn: 94, higher: true },
    { label: "On Time Delivery Rate", key: "onTimeDeliveryRate" as const, unit: "%", icon: Truck, target: "≥95%", good: 95, warn: 90, higher: true },
    { label: "Right First Time (RFT)", key: "rftQuality" as const, unit: "%", icon: CheckCircle2, target: "≥97%", good: 97, warn: 95, higher: true },
    { label: "DHU%", key: "dhuPercent" as const, unit: "%", icon: Shield, target: "≤2.5%", good: 2.5, warn: 4, higher: false },
    { label: "Quality Performance", key: "qualityPerformance" as const, unit: "%", icon: Target, target: "≥95%", good: 95, warn: 93, higher: true },
    { label: "Lost Time %", key: "lostTimePercent" as const, unit: "%", icon: Clock, target: "≤5%", good: 5, warn: 7, higher: false },
    { label: "Worker Absenteeism Rate", key: "workerAbsenteeismRate" as const, unit: "%", icon: UserMinus, target: "≤5%", good: 5, warn: 8, higher: false },
    { label: "Employee Turnover Rate", key: "employeeTurnoverRate" as const, unit: "%", icon: HeartPulse, target: "≤3%", good: 3, warn: 5, higher: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — Factory KPIs</h1>
        <p className="text-sm text-muted-foreground">Key Performance Indicators · Denim Pant Production</p>
      </div>

      {/* Summary Cards — Top 6 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map(card => {
          const statusColor = card.status === "success" ? "border-status-success/30" : card.status === "warning" ? "border-status-warning/30" : "border-status-critical/30";
          return (
            <Card key={card.label} className={`relative overflow-hidden border-l-4 ${statusColor}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-bold font-mono mt-1">{card.value}<span className="text-xs text-muted-foreground ml-0.5">{card.unit}</span></p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Target: {card.target}</p>
                  </div>
                  <card.icon className="h-6 w-6 text-primary/30 shrink-0" />
                </div>
                <div className="mt-2">
                  <StatusBadge status={card.status} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Scorecard Table — All Factories Side by Side */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Factory className="h-4 w-4 text-primary" />
            Factory KPI Scorecard
            <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{kpis.length} {kpis.length === 1 ? "factory" : "factories"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs min-w-[200px]">KPI</TableHead>
                  <TableHead className="text-xs text-center min-w-[80px]">Target</TableHead>
                  {kpis.map(k => (
                    <TableHead key={k.factoryId} className="text-xs text-center min-w-[120px]">{k.factoryName}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allKpiRows.map(row => (
                  <TableRow key={row.key}>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <row.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">{row.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground font-mono">{row.target}</TableCell>
                    {kpis.map(k => {
                      const val = Number(k[row.key]);
                      const status = getStatus(val, row.good, row.warn, row.higher);
                      const textColor = status === "success" ? "text-status-success" : status === "warning" ? "text-status-warning" : "text-status-critical";
                      const prefix = row.key === "costPerStandardMinute" ? "$" : "";
                      const displayVal = row.key === "costPerStandardMinute" ? val.toFixed(3) : val;
                      return (
                        <TableCell key={k.factoryId} className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className={`font-mono font-semibold text-sm ${textColor}`}>
                              {prefix}{displayVal}{row.unit !== "$" ? row.unit : ""}
                            </span>
                            <TrendIcon value={val} threshold={row.good} higherIsBetter={row.higher} />
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Factory Cards (when viewing all) */}
      {selectedFactory === "all" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {kpis.map(k => {
            const effStatus = getStatus(k.factoryEfficiency, 70, 55);
            const borderColor = effStatus === "success" ? "border-status-success/30" : effStatus === "warning" ? "border-status-warning/30" : "border-status-critical/30";
            return (
              <Card key={k.factoryId} className={`border-t-4 ${borderColor}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    {k.factoryName}
                    <StatusBadge status={effStatus} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Efficiency", value: `${k.factoryEfficiency}%` },
                      { label: "Productivity", value: `${k.overallLaborProductivity} pcs/hr` },
                      { label: "Cost/SM", value: `$${k.costPerStandardMinute.toFixed(3)}` },
                      { label: "OTD Rate", value: `${k.onTimeDeliveryRate}%` },
                      { label: "RFT", value: `${k.rftQuality}%` },
                      { label: "DHU", value: `${k.dhuPercent}%` },
                      { label: "Cut→Ship", value: `${k.cutToShipRatio}%` },
                      { label: "Absenteeism", value: `${k.workerAbsenteeismRate}%` },
                      { label: "Turnover", value: `${k.employeeTurnoverRate}%` },
                    ].map(item => (
                      <div key={item.label} className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-bold font-mono mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
