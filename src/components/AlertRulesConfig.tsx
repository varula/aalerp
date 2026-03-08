import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle, Wrench, ShieldAlert, Package, Settings2, Plus, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAlertRules, metricOptions, getMetricLabel, type AlertRule } from "@/hooks/use-alert-rules";

const typeIcons: Record<string, React.ElementType> = {
  Production: AlertTriangle,
  Quality: ShieldAlert,
  Machine: Wrench,
  Material: Package,
};

const emptyRule: Omit<AlertRule, "id"> = {
  name: "", type: "Production", metric: "efficiency", condition: "below", threshold: 0, severity: "warning", enabled: true,
};

export default function AlertRulesConfig() {
  const { rules, addRule, updateRule, deleteRule, toggleRule, triggeredAlerts } = useAlertRules();
  const [editingRule, setEditingRule] = useState<Omit<AlertRule, "id"> & { id?: string }>(emptyRule);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openCreate = () => {
    setEditingRule({ ...emptyRule });
    setDialogOpen(true);
  };

  const openEdit = (rule: AlertRule) => {
    setEditingRule({ ...rule });
    setDialogOpen(true);
  };

  const saveRule = () => {
    if (!editingRule.name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    if (editingRule.threshold <= 0) {
      toast.error("Threshold must be greater than 0");
      return;
    }

    if (editingRule.id) {
      updateRule(editingRule as AlertRule);
      toast.success("Rule updated");
    } else {
      const { id: _, ...ruleData } = editingRule;
      addRule(ruleData);
      toast.success("Rule created");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteRule(id);
    toast.success("Rule deleted");
  };

  const countTriggered = (ruleId: string) =>
    triggeredAlerts.filter(a => a.ruleId === ruleId).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="h-4 w-4" /> Alert Rules Configuration
            <Badge variant="secondary" className="text-[10px] font-mono ml-1">
              {triggeredAlerts.length} triggered
            </Badge>
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs h-7" onClick={openCreate}>
                <Plus className="h-3.5 w-3.5 mr-1" /> New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRule.id ? "Edit Rule" : "Create Alert Rule"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Rule Name</Label>
                  <Input
                    value={editingRule.name}
                    onChange={e => setEditingRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Low Efficiency Alert"
                    maxLength={100}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Alert Type</Label>
                    <Select
                      value={editingRule.type}
                      onValueChange={(v: AlertRule["type"]) =>
                        setEditingRule(prev => ({ ...prev, type: v, metric: metricOptions[v][0].value }))
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Quality">Quality</SelectItem>
                        <SelectItem value="Machine">Machine</SelectItem>
                        <SelectItem value="Material">Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Severity</Label>
                    <Select
                      value={editingRule.severity}
                      onValueChange={(v: "warning" | "critical") =>
                        setEditingRule(prev => ({ ...prev, severity: v }))
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Metric</Label>
                  <Select
                    value={editingRule.metric}
                    onValueChange={v => setEditingRule(prev => ({ ...prev, metric: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {metricOptions[editingRule.type].map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Condition</Label>
                    <Select
                      value={editingRule.condition}
                      onValueChange={(v: "below" | "above" | "equals") =>
                        setEditingRule(prev => ({ ...prev, condition: v }))
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Threshold</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editingRule.threshold}
                      onChange={e => setEditingRule(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={saveRule}>{editingRule.id ? "Update" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No alert rules configured</p>
          )}
          {rules.map(rule => {
            const Icon = typeIcons[rule.type] || AlertTriangle;
            const trigCount = countTriggered(rule.id);
            return (
              <div
                key={rule.id}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-opacity ${!rule.enabled ? "opacity-50" : ""}`}
              >
                <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                  rule.severity === "critical" ? "bg-status-critical/15 text-status-critical" : "bg-status-warning/15 text-status-warning"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{rule.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 shrink-0">{rule.type}</Badge>
                    <Badge
                      variant={rule.severity === "critical" ? "destructive" : "secondary"}
                      className="text-[10px] px-1.5 shrink-0"
                    >
                      {rule.severity}
                    </Badge>
                    {rule.enabled && trigCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 shrink-0 font-mono">
                        {trigCount} triggered
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getMetricLabel(rule.type, rule.metric)} {rule.condition} <span className="font-mono font-semibold">{rule.threshold}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(rule)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-status-critical" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
