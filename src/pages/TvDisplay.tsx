import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Maximize, Minimize, RefreshCw, Factory, AlertTriangle, TrendingUp,
  Clock, Zap, XCircle,
} from "lucide-react";
import { allLines, alerts, getFactoryKPIs, type SewingLine } from "@/data/mock-data";

function StatusDot({ status }: { status: string }) {
  const cls = status === "normal" ? "bg-status-success" : status === "warning" ? "bg-status-warning animate-pulse" : "bg-status-critical animate-pulse";
  return <div className={`h-3 w-3 rounded-full shrink-0 ${cls}`} />;
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function TvDisplay() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clock, setClock] = useState(formatTime());
  const [refreshCount, setRefreshCount] = useState(0);

  // Clock tick every second
  useEffect(() => {
    const t = setInterval(() => setClock(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(() => setRefreshCount(c => c + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const lines = allLines.filter(l => selectedFactory === "all" || l.factoryId === selectedFactory);
  const kpis = getFactoryKPIs(selectedFactory === "all" ? undefined : selectedFactory);
  const activeAlerts = alerts
    .filter(a => !a.acknowledged && (selectedFactory === "all" || a.factoryId === selectedFactory))
    .sort((a, b) => {
      const sev = { critical: 0, warning: 1, normal: 2 };
      return sev[a.severity] - sev[b.severity];
    })
    .slice(0, 8);

  const criticalLines = lines.filter(l => l.status === "critical");
  const warningLines = lines.filter(l => l.status === "warning");
  const normalLines = lines.filter(l => l.status === "normal");

  return (
    <div className="space-y-4 animate-fade-in">
      {/* TV Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            AF
          </div>
          <div>
            <h1 className="text-xl font-bold">Armana Fashions — Factory Display</h1>
            <p className="text-xs text-muted-foreground">
              {selectedFactory === "all" ? "All Factories" : lines[0]?.factoryId || ""}
              {" · "}Auto-refresh every 60s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg font-semibold text-foreground">{clock}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setRefreshCount(c => c + 1)}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Output", value: kpis.totalOutput.toLocaleString(), icon: Factory, color: "text-primary" },
          { label: "Efficiency", value: `${kpis.avgEfficiency}%`, icon: TrendingUp, color: kpis.avgEfficiency >= 70 ? "text-status-success" : "text-status-warning" },
          { label: "Active Lines", value: `${kpis.activeLines}`, icon: Zap, color: "text-primary" },
          { label: "Normal", value: `${normalLines.length}`, icon: TrendingUp, color: "text-status-success" },
          { label: "Warning", value: `${warningLines.length}`, icon: AlertTriangle, color: "text-status-warning" },
          { label: "Critical", value: `${criticalLines.length}`, icon: XCircle, color: "text-status-critical" },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-2.5">
              <kpi.icon className={`h-5 w-5 shrink-0 ${kpi.color}`} />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Lines + Alerts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Andon Status Grid — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" /> Live Line Status
              <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{lines.length} lines</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10 gap-2">
              {lines.map(line => (
                <LineCell key={line.id} line={line} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Active Alerts
              <Badge variant="destructive" className="ml-auto text-[10px] font-mono">{activeAlerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-auto">
            {activeAlerts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No active alerts</p>
            )}
            {activeAlerts.map(alert => {
              const line = allLines.find(l => l.id === alert.lineId);
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 text-sm ${
                    alert.severity === "critical" ? "border-status-critical/40 bg-status-critical/5" : "border-status-warning/40 bg-status-warning/5"
                  }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${alert.severity === "critical" ? "bg-status-critical animate-pulse" : "bg-status-warning"}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {line?.name || "—"} · {alert.type} · {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Line Performance Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Line Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[360px] overflow-auto">
            {lines
              .sort((a, b) => a.efficiency - b.efficiency)
              .slice(0, 24)
              .map(line => (
                <div key={line.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <StatusDot status={line.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-semibold text-sm">{line.name}</span>
                      <span className={`font-mono text-sm font-bold ${line.efficiency >= 70 ? "text-status-success" : line.efficiency >= 55 ? "text-status-warning" : "text-status-critical"}`}>
                        {line.efficiency}%
                      </span>
                    </div>
                    <Progress
                      value={line.efficiency}
                      className="h-1.5"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{line.style}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{line.actual}/{line.target}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2">
        <span>GarmentIQ v1.0 · Smart Factory MES</span>
        <span className="font-mono">Last refresh: {clock} · Cycle #{refreshCount}</span>
      </div>
    </div>
  );
}

function LineCell({ line }: { line: SewingLine }) {
  const bg = line.status === "normal"
    ? "bg-status-success"
    : line.status === "warning"
    ? "bg-status-warning"
    : "bg-status-critical animate-pulse";

  return (
    <div
      className={`${bg} rounded-md p-1.5 text-center text-white transition-all`}
      title={`${line.name} — ${line.style} — ${line.efficiency}% — ${line.actual}/${line.target}`}
    >
      <p className="text-[11px] font-bold font-mono leading-tight">{line.name}</p>
      <p className="text-[18px] font-bold font-mono leading-tight">{line.efficiency}%</p>
      <p className="text-[9px] opacity-80 font-mono">{line.actual}/{line.target}</p>
    </div>
  );
}
