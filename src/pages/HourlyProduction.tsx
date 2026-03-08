import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { getAll, create, remove, exportToCsv, CrudRecord } from "@/lib/crud-storage";
import { Plus, Download, Trash2, Clock, TrendingUp, Target, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";

const STORAGE_KEY = "hourly-production";
const HOURS = ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10"];
const SHIFTS = ["Morning", "Afternoon", "Night"];
const PAGE_SIZE = 12;

interface HourlyEntry {
  date: string;
  shift: string;
  lineNo: string;
  styleNo: string;
  operator: string;
  target: number;
  h1: number; h2: number; h3: number; h4: number; h5: number;
  h6: number; h7: number; h8: number; h9: number; h10: number;
  total: number;
  efficiency: number;
}

function calcTotal(data: Record<string, any>): number {
  return HOURS.reduce((sum, h) => sum + (Number(data[h.toLowerCase()]) || 0), 0);
}

function calcEfficiency(total: number, target: number): number {
  if (!target) return 0;
  return Math.round((total / target) * 100);
}

export default function HourlyProduction() {
  const [records, setRecords] = useState<CrudRecord[]>(() => getAll(STORAGE_KEY));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    date: new Date().toISOString().split("T")[0],
    shift: "Morning",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = () => setRecords(getAll(STORAGE_KEY));

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter(r =>
      ["lineNo", "styleNo", "operator", "shift", "date"].some(k => String(r[k] || "").toLowerCase().includes(q))
    );
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Summary KPIs
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter(r => r.date === todayStr);
  const totalOutput = todayRecords.reduce((s, r) => s + (Number(r.total) || 0), 0);
  const totalTarget = todayRecords.reduce((s, r) => s + (Number(r.target) || 0), 0);
  const avgEfficiency = totalTarget ? Math.round((totalOutput / totalTarget) * 100) : 0;
  const linesActive = new Set(todayRecords.map(r => r.lineNo)).size;

  const setField = (key: string, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [key]: value };
      const total = calcTotal(next);
      next.total = total;
      next.efficiency = calcEfficiency(total, Number(next.target) || 0);
      return next;
    });
  };

  const handleSave = () => {
    if (!formData.lineNo || !formData.date) {
      toast({ title: "Line No and Date are required", variant: "destructive" });
      return;
    }
    const total = calcTotal(formData);
    create(STORAGE_KEY, {
      ...formData,
      total,
      efficiency: calcEfficiency(total, Number(formData.target) || 0),
    });
    toast({ title: "Hourly production saved" });
    setDialogOpen(false);
    setFormData({ date: new Date().toISOString().split("T")[0], shift: "Morning" });
    refresh();
  };

  const handleDelete = (id: string) => {
    remove(STORAGE_KEY, id);
    toast({ title: "Record deleted" });
    setDeleteConfirm(null);
    refresh();
  };

  const handleExport = () => {
    const fields = [
      { key: "date", label: "Date" }, { key: "shift", label: "Shift" },
      { key: "lineNo", label: "Line" }, { key: "styleNo", label: "Style" },
      { key: "operator", label: "Operator" }, { key: "target", label: "Target" },
      ...HOURS.map(h => ({ key: h.toLowerCase(), label: h })),
      { key: "total", label: "Total" }, { key: "efficiency", label: "Eff %" },
    ];
    exportToCsv(STORAGE_KEY, fields);
    toast({ title: "CSV exported" });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Hourly Production Entry</h1>
          <p className="text-xs text-muted-foreground">Track line-wise hourly output across shifts</p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">{records.length} entries</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Today's Target</p>
              <p className="text-lg font-bold text-foreground">{totalTarget.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Today's Output</p>
              <p className="text-lg font-bold text-foreground">{totalOutput.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-chart-4" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Efficiency</p>
              <p className="text-lg font-bold text-foreground">{avgEfficiency}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-chart-5/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-chart-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Lines Active</p>
              <p className="text-lg font-bold text-foreground">{linesActive}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by line, style, operator..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={records.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sticky left-0 bg-background z-10">Date</TableHead>
                <TableHead className="text-xs">Shift</TableHead>
                <TableHead className="text-xs">Line</TableHead>
                <TableHead className="text-xs">Style</TableHead>
                <TableHead className="text-xs">Operator</TableHead>
                <TableHead className="text-xs text-center">Target</TableHead>
                {HOURS.map(h => (
                  <TableHead key={h} className="text-xs text-center min-w-[50px]">{h}</TableHead>
                ))}
                <TableHead className="text-xs text-center font-semibold">Total</TableHead>
                <TableHead className="text-xs text-center">Eff%</TableHead>
                <TableHead className="text-xs w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16 + HOURS.length} className="text-center text-muted-foreground py-12">
                    No entries yet. Click "Add Entry" to start tracking.
                  </TableCell>
                </TableRow>
              ) : paged.map(r => {
                const eff = Number(r.efficiency) || 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs sticky left-0 bg-background z-10 font-medium">{r.date}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="secondary" className="text-[10px]">{r.shift}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{r.lineNo}</TableCell>
                    <TableCell className="text-xs">{r.styleNo || "—"}</TableCell>
                    <TableCell className="text-xs">{r.operator || "—"}</TableCell>
                    <TableCell className="text-xs text-center font-medium">{r.target || "—"}</TableCell>
                    {HOURS.map(h => (
                      <TableCell key={h} className="text-xs text-center tabular-nums">
                        {r[h.toLowerCase()] || "—"}
                      </TableCell>
                    ))}
                    <TableCell className="text-xs text-center font-bold">{r.total || 0}</TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge variant={eff >= 80 ? "default" : eff >= 50 ? "secondary" : "destructive"} className="text-[10px]">
                        {eff}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm(r.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages} · {filtered.length} results</p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Hourly Production Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Row 1: Meta fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={formData.date || ""} onChange={e => setField("date", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Shift</Label>
                <Select value={formData.shift || ""} onValueChange={v => setField("shift", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Line No <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. L01" value={formData.lineNo || ""} onChange={e => setField("lineNo", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Style No</Label>
                <Input placeholder="Style" value={formData.styleNo || ""} onChange={e => setField("styleNo", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Operator / Supervisor</Label>
                <Input placeholder="Name" value={formData.operator || ""} onChange={e => setField("operator", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Daily Target</Label>
                <Input type="number" placeholder="0" value={formData.target || ""} onChange={e => setField("target", e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>

            {/* Hourly Grid */}
            <div>
              <Label className="text-xs font-semibold mb-2 block">Hourly Output</Label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {HOURS.map(h => (
                  <div key={h} className="text-center">
                    <Label className="text-[10px] text-muted-foreground">{h}</Label>
                    <Input
                      type="number"
                      className="text-center text-sm h-9"
                      placeholder="0"
                      value={formData[h.toLowerCase()] || ""}
                      onChange={e => setField(h.toLowerCase(), e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live totals */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="text-[10px] text-muted-foreground">Total Output</p>
                <p className="text-lg font-bold text-foreground">{formData.total || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Efficiency</p>
                <p className="text-lg font-bold text-foreground">{formData.efficiency || 0}%</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this entry?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
