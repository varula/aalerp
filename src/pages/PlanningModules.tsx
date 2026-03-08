import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Download, Search, Scissors, Factory, Package, CalendarDays, Target, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { getAll, create, update, remove, exportToCsv, generateId, CrudRecord } from "@/lib/crud-storage";
import { CapacityPanel, SewingCapacityKPIs } from "@/components/CapacityCalculator";

// ── Plan Field Definitions ──────────────────────
interface PlanField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  options?: string[];
}

const STATUS_OPTIONS = ["Planned", "In Progress", "On Hold", "Completed", "Delayed", "Cancelled"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];

const cuttingFields: PlanField[] = [
  { key: "planDate", label: "Plan Date", type: "date", required: true },
  { key: "styleNo", label: "Style No", type: "text", required: true },
  { key: "orderNo", label: "Order No", type: "text", required: true },
  { key: "buyer", label: "Buyer", type: "text" },
  { key: "color", label: "Color", type: "text" },
  { key: "orderQty", label: "Order Qty", type: "number", required: true },
  { key: "plannedCutQty", label: "Planned Cut Qty", type: "number", required: true },
  { key: "actualCutQty", label: "Actual Cut Qty", type: "number" },
  { key: "noOfLays", label: "No of Lays", type: "number" },
  { key: "fabricType", label: "Fabric Type", type: "text" },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "endDate", label: "End Date", type: "date" },
  { key: "priority", label: "Priority", type: "select", options: PRIORITY_OPTIONS },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
  { key: "remarks", label: "Remarks", type: "textarea" },
];

const sewingFields: PlanField[] = [
  { key: "planDate", label: "Plan Date", type: "date", required: true },
  { key: "styleNo", label: "Style No", type: "text", required: true },
  { key: "orderNo", label: "Order No", type: "text", required: true },
  { key: "buyer", label: "Buyer", type: "text" },
  { key: "lineNo", label: "Line No", type: "text", required: true },
  { key: "orderQty", label: "Order Qty", type: "number", required: true },
  { key: "plannedQty", label: "Planned Qty", type: "number", required: true },
  { key: "actualQty", label: "Actual Output", type: "number" },
  { key: "smv", label: "SMV", type: "number" },
  { key: "manpower", label: "Manpower", type: "number" },
  { key: "workingHours", label: "Working Hours", type: "number" },
  { key: "targetPerHour", label: "Target/Hr (auto)", type: "number" },
  { key: "efficiency", label: "Efficiency % (auto)", type: "number" },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "endDate", label: "End Date", type: "date" },
  { key: "priority", label: "Priority", type: "select", options: PRIORITY_OPTIONS },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
  { key: "remarks", label: "Remarks", type: "textarea" },
];

const finishingFields: PlanField[] = [
  { key: "planDate", label: "Plan Date", type: "date", required: true },
  { key: "styleNo", label: "Style No", type: "text", required: true },
  { key: "orderNo", label: "Order No", type: "text", required: true },
  { key: "buyer", label: "Buyer", type: "text" },
  { key: "orderQty", label: "Order Qty", type: "number", required: true },
  { key: "receivedFromSewing", label: "Received from Sewing", type: "number" },
  { key: "plannedFinishQty", label: "Planned Finish Qty", type: "number", required: true },
  { key: "actualFinishQty", label: "Actual Finished", type: "number" },
  { key: "packedQty", label: "Packed Qty", type: "number" },
  { key: "shipDate", label: "Ship Date", type: "date" },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "endDate", label: "End Date", type: "date" },
  { key: "priority", label: "Priority", type: "select", options: PRIORITY_OPTIONS },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true },
  { key: "remarks", label: "Remarks", type: "textarea" },
];

type PlanTab = "cutting" | "sewing" | "finishing";

const tabConfig: Record<PlanTab, { label: string; icon: React.ElementType; storageKey: string; fields: PlanField[]; displayCols: string[]; plannedKey: string; actualKey: string }> = {
  cutting: { label: "Cutting Plan", icon: Scissors, storageKey: "plan_cutting", fields: cuttingFields, displayCols: ["planDate", "styleNo", "orderNo", "buyer", "plannedCutQty", "actualCutQty", "status"], plannedKey: "plannedCutQty", actualKey: "actualCutQty" },
  sewing: { label: "Sewing Plan", icon: Factory, storageKey: "plan_sewing", fields: sewingFields, displayCols: ["planDate", "styleNo", "orderNo", "lineNo", "plannedQty", "actualQty", "status"], plannedKey: "plannedQty", actualKey: "actualQty" },
  finishing: { label: "Finishing Plan", icon: Package, storageKey: "plan_finishing", fields: finishingFields, displayCols: ["planDate", "styleNo", "orderNo", "buyer", "plannedFinishQty", "actualFinishQty", "status"], plannedKey: "plannedFinishQty", actualKey: "actualFinishQty" },
};

function getStatusColor(status: string) {
  switch (status) {
    case "Completed": return "default";
    case "In Progress": return "secondary";
    case "Delayed": case "Cancelled": return "destructive";
    default: return "outline" as any;
  }
}

function KpiCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color || "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function PlanTable({ tab }: { tab: PlanTab }) {
  const cfg = tabConfig[tab];
  const [records, setRecords] = useState<CrudRecord[]>(() => getAll(cfg.storageKey));
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CrudRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refresh = () => setRecords(getAll(cfg.storageKey));
  const displayFields = cfg.fields.filter(f => cfg.displayCols.includes(f.key));

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter(r => cfg.fields.some(f => String(r[f.key] || "").toLowerCase().includes(q)));
  }, [records, search]);

  // KPIs
  const totalPlanned = records.reduce((s, r) => s + (Number(r[cfg.plannedKey]) || 0), 0);
  const totalActual = records.reduce((s, r) => s + (Number(r[cfg.actualKey]) || 0), 0);
  const achievement = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  const inProgress = records.filter(r => r.status === "In Progress").length;
  const delayed = records.filter(r => r.status === "Delayed").length;

  const openAdd = () => { setEditing(null); setFormData({}); setDialogOpen(true); };
  const openEdit = (r: CrudRecord) => { setEditing(r); setFormData({ ...r }); setDialogOpen(true); };

  const handleSave = () => {
    const missing = cfg.fields.filter(f => f.required && !formData[f.key]);
    if (missing.length > 0) {
      toast({ title: "Required fields missing", description: missing.map(f => f.label).join(", "), variant: "destructive" });
      return;
    }
    if (editing) {
      update(cfg.storageKey, editing.id, formData);
      toast({ title: "Plan updated" });
    } else {
      create(cfg.storageKey, formData);
      toast({ title: "Plan created" });
    }
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    remove(cfg.storageKey, id);
    toast({ title: "Plan deleted" });
    setDeleteId(null);
    refresh();
  };

  const handleExport = () => {
    exportToCsv(cfg.storageKey, cfg.fields.map(f => ({ key: f.key, label: f.label })));
    toast({ title: "CSV exported" });
  };

  const isSewing = tab === "sewing";

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon={CalendarDays} label="Total Plans" value={records.length} />
        <KpiCard icon={Target} label="Planned Qty" value={totalPlanned.toLocaleString()} />
        <KpiCard icon={TrendingUp} label="Actual Qty" value={totalActual.toLocaleString()} sub={`${achievement}% achieved`} />
        <KpiCard icon={Clock} label="In Progress" value={inProgress} color="bg-amber-500/10 text-amber-600" />
        <KpiCard icon={AlertTriangle} label="Delayed" value={delayed} color="bg-destructive/10 text-destructive" />
      </div>

      {/* Capacity Planning Summary (Sewing only) */}
      {isSewing && <SewingCapacityKPIs records={records} />}

      {/* Achievement Bar */}
      {totalPlanned > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Overall Achievement</span>
              <span className="text-sm font-bold text-foreground">{achievement}%</span>
            </div>
            <Progress value={Math.min(achievement, 100)} className="h-2.5" />
          </CardContent>
        </Card>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search plans..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={records.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add Plan
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                {displayFields.map(f => <TableHead key={f.key} className="text-xs">{f.label}</TableHead>)}
                <TableHead className="text-xs">Progress</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={displayFields.length + 3} className="text-center text-muted-foreground py-12">No plans found. Click "Add Plan" to create one.</TableCell></TableRow>
              ) : filtered.map((r, i) => {
                const planned = Number(r[cfg.plannedKey]) || 0;
                const actual = Number(r[cfg.actualKey]) || 0;
                const prog = planned > 0 ? Math.min(Math.round((actual / planned) * 100), 100) : 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    {displayFields.map(f => (
                      <TableCell key={f.key} className="text-xs">
                        {f.key === "status" ? (
                          <Badge variant={getStatusColor(r[f.key])} className="text-[10px]">{r[f.key] || "—"}</Badge>
                        ) : f.key === "priority" ? (
                          <Badge variant={r[f.key] === "Urgent" ? "destructive" : r[f.key] === "High" ? "secondary" : "outline"} className="text-[10px]">{r[f.key] || "—"}</Badge>
                        ) : String(r[f.key] ?? "—")}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[80px]">
                        <Progress value={prog} className="h-1.5 flex-1" />
                        <span className="text-[10px] text-muted-foreground font-mono w-8">{prog}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Plan" : "Add New Plan"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {cfg.fields.map(f => (
              <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <Label className="text-xs mb-1.5 block">{f.label} {f.required && <span className="text-destructive">*</span>}</Label>
                {f.type === "textarea" ? (
                  <Textarea placeholder={f.label} value={formData[f.key] || ""} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} className="min-h-[60px]" />
                ) : f.type === "select" ? (
                  <Select value={formData[f.key] || ""} onValueChange={v => setFormData(p => ({ ...p, [f.key]: v }))}>
                    <SelectTrigger><SelectValue placeholder={`Select ${f.label}`} /></SelectTrigger>
                    <SelectContent>{f.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} placeholder={f.label} value={formData[f.key] || ""} onChange={e => setFormData(p => ({ ...p, [f.key]: f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PlanningModules() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Planning Modules</h1>
        <p className="text-xs text-muted-foreground">Overview of Cutting, Sewing & Finishing production plans</p>
      </div>

      <Tabs defaultValue="cutting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="cutting" className="text-xs gap-1.5"><Scissors className="h-3.5 w-3.5" /> Cutting</TabsTrigger>
          <TabsTrigger value="sewing" className="text-xs gap-1.5"><Factory className="h-3.5 w-3.5" /> Sewing</TabsTrigger>
          <TabsTrigger value="finishing" className="text-xs gap-1.5"><Package className="h-3.5 w-3.5" /> Finishing</TabsTrigger>
        </TabsList>
        <TabsContent value="cutting"><PlanTable tab="cutting" /></TabsContent>
        <TabsContent value="sewing"><PlanTable tab="sewing" /></TabsContent>
        <TabsContent value="finishing"><PlanTable tab="finishing" /></TabsContent>
      </Tabs>
    </div>
  );
}
