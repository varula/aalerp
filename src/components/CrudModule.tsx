import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getModuleBySlug, getModulesBySection, FieldDef, ModuleDef } from "@/lib/module-registry";
import { getAll, create, update, remove, exportToCsv, CrudRecord } from "@/lib/crud-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

function FieldInput({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  switch (field.type) {
    case "textarea":
      return <Textarea placeholder={field.placeholder || field.label} value={value || ""} onChange={e => onChange(e.target.value)} className="min-h-[60px]" />;
    case "select":
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
          <SelectContent>
            {field.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    default:
      return <Input type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} placeholder={field.placeholder || field.label} value={value || ""} onChange={e => onChange(field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />;
  }
}

export function CrudModulePage() {
  const { sectionSlug, moduleSlug } = useParams<{ sectionSlug: string; moduleSlug: string }>();
  const navigate = useNavigate();
  const mod = moduleSlug ? getModuleBySlug(moduleSlug) : undefined;

  if (!mod) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Module not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </div>
    );
  }

  return <CrudDataTable module={mod} sectionSlug={sectionSlug || ""} />;
}

export function CrudDataTable({ module: mod, sectionSlug, hideBackButton }: { module: ModuleDef; sectionSlug: string; hideBackButton?: boolean }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState<CrudRecord[]>(() => getAll(mod.slug));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CrudRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const displayFields = mod.fields.slice(0, 6); // show first 6 in table

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter(r => mod.fields.some(f => String(r[f.key] || "").toLowerCase().includes(q)));
  }, [records, search, mod.fields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const refresh = () => setRecords(getAll(mod.slug));

  const openAdd = () => {
    setEditingRecord(null);
    setFormData({});
    setDialogOpen(true);
  };

  const openEdit = (r: CrudRecord) => {
    setEditingRecord(r);
    setFormData({ ...r });
    setDialogOpen(true);
  };

  const handleSave = () => {
    // validate required fields
    const missing = mod.fields.filter(f => f.required && !formData[f.key]);
    if (missing.length > 0) {
      toast({ title: "Required fields missing", description: missing.map(f => f.label).join(", "), variant: "destructive" });
      return;
    }
    if (editingRecord) {
      update(mod.slug, editingRecord.id, formData);
      toast({ title: "Record updated" });
    } else {
      create(mod.slug, formData);
      toast({ title: "Record created" });
    }
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    remove(mod.slug, id);
    toast({ title: "Record deleted" });
    setDeleteConfirm(null);
    refresh();
  };

  const handleExport = () => {
    exportToCsv(mod.slug, mod.fields.map(f => ({ key: f.key, label: f.label })));
    toast({ title: "CSV exported" });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/modules/${sectionSlug}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{mod.title}</h1>
          <p className="text-xs text-muted-foreground">{mod.section} · Module #{mod.id}</p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">{records.length} records</Badge>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={records.length === 0}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add Record
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                {displayFields.map(f => (
                  <TableHead key={f.key} className="text-xs">{f.label}</TableHead>
                ))}
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={displayFields.length + 2} className="text-center text-muted-foreground py-12">
                    No records found. Click "Add Record" to create one.
                  </TableCell>
                </TableRow>
              ) : paged.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs text-muted-foreground">{page * PAGE_SIZE + i + 1}</TableCell>
                  {displayFields.map(f => (
                    <TableCell key={f.key} className="text-xs max-w-[200px] truncate">
                      {f.type === "select" && r[f.key] ? (
                        <Badge variant={r[f.key] === "Pass" || r[f.key] === "Completed" || r[f.key] === "Approved" ? "default" : r[f.key] === "Fail" || r[f.key] === "Rejected" ? "destructive" : "secondary"} className="text-[10px]">
                          {r[f.key]}
                        </Badge>
                      ) : (
                        String(r[f.key] ?? "—")
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm(r.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Record" : "Add New Record"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {mod.fields.map(f => (
              <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <Label className="text-xs mb-1.5 block">
                  {f.label} {f.required && <span className="text-destructive">*</span>}
                </Label>
                <FieldInput field={f} value={formData[f.key]} onChange={v => setFormData(prev => ({ ...prev, [f.key]: v }))} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingRecord ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function SectionModulesPage() {
  const { sectionSlug } = useParams<{ sectionSlug: string }>();
  const navigate = useNavigate();
  const sectionModules = sectionSlug ? getModulesBySection(sectionSlug) : [];
  const sectionName = sectionModules[0]?.section || sectionSlug?.replace(/-/g, " ") || "";

  if (sectionModules.length === 0) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No modules found for this section.</p>
        <Button variant="ghost" onClick={() => navigate("/")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">{sectionName}</h1>
          <p className="text-xs text-muted-foreground">{sectionModules.length} modules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sectionModules.map(mod => {
          const recordCount = getAll(mod.slug).length;
          return (
            <Link key={mod.slug} to={`/modules/${sectionSlug}/${mod.slug}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium leading-tight">{mod.id}. {mod.title}</CardTitle>
                    {recordCount > 0 && (
                      <Badge variant="secondary" className="text-[10px] ml-2 shrink-0">{recordCount}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-[11px] text-muted-foreground">{mod.fields.length} fields · Click to manage records</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
