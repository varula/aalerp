import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle, Wrench, Package, ShieldAlert, CheckCircle, XCircle, Bell, Zap,
} from "lucide-react";
import { alerts, allLines, type Alert } from "@/data/mock-data";
import { useAlertRules, type TriggeredAlert } from "@/hooks/use-alert-rules";
import AlertRulesConfig from "@/components/AlertRulesConfig";
import { motion } from "framer-motion";

const typeIcons: Record<string, React.ElementType> = {
  Production: AlertTriangle,
  Quality: ShieldAlert,
  Machine: Wrench,
  Material: Package,
};

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: appleEase } },
};

export default function AlertsPage() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const { getTriggeredForFactory } = useAlertRules();
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [dismissedTriggered, setDismissedTriggered] = useState<Set<string>>(new Set());

  const factoryId = selectedFactory === "all" ? undefined : selectedFactory;
  const triggeredAlerts = getTriggeredForFactory(factoryId)
    .filter(a => typeFilter === "all" || a.type === typeFilter)
    .filter(a => severityFilter === "all" || a.severity === severityFilter)
    .filter(a => !dismissedTriggered.has(a.id));

  const filteredAlerts = alerts
    .filter(a => selectedFactory === "all" || a.factoryId === selectedFactory)
    .filter(a => typeFilter === "all" || a.type === typeFilter)
    .filter(a => severityFilter === "all" || a.severity === severityFilter)
    .sort((a, b) => {
      const sevOrder = { critical: 0, warning: 1, normal: 2 };
      return sevOrder[a.severity] - sevOrder[b.severity];
    });

  const isAck = (id: string) => acknowledged.has(id);
  const toggleAck = (id: string) => {
    setAcknowledged(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const sevDot = (s: string) =>
    s === "critical" ? "bg-status-critical animate-pulse-slow" : s === "warning" ? "bg-status-warning" : "bg-status-success";

  const activeCount = filteredAlerts.filter(a => !a.acknowledged && !isAck(a.id)).length;
  const criticalCount = filteredAlerts.filter(a => a.severity === "critical").length + triggeredAlerts.filter(a => a.severity === "critical").length;
  const warningCount = filteredAlerts.filter(a => a.severity === "warning").length + triggeredAlerts.filter(a => a.severity === "warning").length;

  return (
    <motion.div className="space-y-6 pb-8" variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-status-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Alerts & Andon</h1>
          <p className="text-sm text-muted-foreground">Digital Andon system with smart alerts & rule-based triggers</p>
        </div>
      </motion.div>

      {/* Andon Strip */}
      <motion.div className="grid grid-cols-3 gap-3" variants={stagger}>
        {[
          { label: "Critical", value: criticalCount, icon: XCircle, color: "text-status-critical", border: "border-status-critical/30", bg: "bg-status-critical/10" },
          { label: "Warning", value: warningCount, icon: AlertTriangle, color: "text-status-warning", border: "border-status-warning/30", bg: "bg-status-warning/10" },
          { label: "Active (Unack)", value: activeCount + triggeredAlerts.length, icon: CheckCircle, color: "text-status-success", border: "border-status-success/30", bg: "bg-status-success/10" },
        ].map(s => (
          <motion.div key={s.label} variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
            <Card className={`${s.border}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Live Andon Strip */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center">
                <Bell className="h-3.5 w-3.5 text-primary" />
              </div>
              Live Andon Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {allLines
                .filter(l => selectedFactory === "all" || l.factoryId === selectedFactory)
                .slice(0, 50)
                .map(line => (
                  <div
                    key={line.id}
                    className={`h-8 w-12 rounded-md flex items-center justify-center text-[10px] font-mono font-bold text-white ${sevDot(line.status)}`}
                    title={`${line.name} — ${line.efficiency}%`}
                  >
                    {line.name}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Production">Production</SelectItem>
            <SelectItem value="Quality">Quality</SelectItem>
            <SelectItem value="Machine">Machine</SelectItem>
            <SelectItem value="Material">Material</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Rule-Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                Rule-Triggered Alerts
                <Badge variant="destructive" className="ml-auto text-[10px] font-mono">{triggeredAlerts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[350px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[40px]"></TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Rule</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Line</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Value</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Threshold</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {triggeredAlerts
                      .sort((a, b) => {
                        const sev = { critical: 0, warning: 1 } as Record<string, number>;
                        return (sev[a.severity] ?? 2) - (sev[b.severity] ?? 2);
                      })
                      .map((alert, i) => {
                        const Icon = typeIcons[alert.type] || AlertTriangle;
                        return (
                          <TableRow key={alert.id} className={`hover:bg-accent/40 transition-colors ${i % 2 === 1 ? "bg-muted/20" : ""}`}>
                            <TableCell>
                              <div className={`h-3 w-3 rounded-full ${alert.severity === "critical" ? "bg-status-critical animate-pulse" : "bg-status-warning"}`} />
                            </TableCell>
                            <TableCell className="text-xs font-medium text-foreground">{alert.ruleName}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs">{alert.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{alert.lineName}</TableCell>
                            <TableCell className={`text-right font-mono text-xs font-semibold ${alert.severity === "critical" ? "text-status-critical" : "text-status-warning"}`}>
                              {alert.metricValue}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                              {alert.threshold}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-7"
                                onClick={() => setDismissedTriggered(prev => new Set(prev).add(alert.id))}
                              >
                                Dismiss
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Alerts */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center">
                <Bell className="h-3.5 w-3.5 text-foreground" />
              </div>
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[40px]"></TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Type</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Message</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Line</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Time</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert, i) => {
                    const Icon = typeIcons[alert.type] || AlertTriangle;
                    const line = allLines.find(l => l.id === alert.lineId);
                    const ack = alert.acknowledged || isAck(alert.id);
                    return (
                      <TableRow key={alert.id} className={`hover:bg-accent/40 transition-colors ${ack ? "opacity-50" : ""} ${i % 2 === 1 ? "bg-muted/20" : ""}`}>
                        <TableCell>
                          <div className={`h-3 w-3 rounded-full ${sevDot(alert.severity)}`} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{alert.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-foreground">{alert.message}</TableCell>
                        <TableCell className="font-mono text-xs">{line?.name || "-"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={ack ? "outline" : "default"}
                            size="sm"
                            className="text-[10px] h-7"
                            onClick={() => toggleAck(alert.id)}
                          >
                            {ack ? "Undo" : "Acknowledge"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert Rules Configuration */}
      <motion.div variants={fadeUp}>
        <AlertRulesConfig />
      </motion.div>
    </motion.div>
  );
}
