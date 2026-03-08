import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Search, CalendarDays, TrendingUp, Package, DollarSign, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { productionOrders, getFactoryInfo, type ProductionOrder } from "@/data/mock-data";

type SortKey = "poNumber" | "buyer" | "orderQty" | "completedQty" | "plannedFinish" | "totalValue";
type SortDir = "asc" | "desc";

export default function ProductionOrders() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buyerFilter, setBuyerFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("poNumber");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const factoryInfo = getFactoryInfo(selectedFactory);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const orders = useMemo(() => {
    let filtered = productionOrders
      .filter(o => selectedFactory === "all" || o.factoryId === selectedFactory)
      .filter(o => statusFilter === "all" || o.status === statusFilter)
      .filter(o => buyerFilter === "all" || o.buyer === buyerFilter)
      .filter(o => priorityFilter === "all" || o.priority === priorityFilter)
      .filter(o =>
        o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.buyer.toLowerCase().includes(search.toLowerCase()) ||
        o.style.toLowerCase().includes(search.toLowerCase()) ||
        o.fabric.toLowerCase().includes(search.toLowerCase())
      );

    filtered.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [selectedFactory, statusFilter, buyerFilter, priorityFilter, search, sortKey, sortDir]);

  const totalPages = Math.ceil(orders.length / pageSize);
  const pagedOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  // Stats
  const totalOrders = orders.length;
  const inProgress = orders.filter(o => o.status === "In Progress").length;
  const completed = orders.filter(o => o.status === "Completed").length;
  const totalValue = orders.reduce((s, o) => s + o.totalValue, 0);
  const delayed = orders.filter(o => o.status === "Delayed").length;

  const buyers = [...new Set(productionOrders.map(o => o.buyer))].sort();

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "In Progress": "default", Pending: "secondary", Completed: "outline", Delayed: "destructive",
    };
    return <Badge variant={map[status] || "secondary"} className="text-[10px]">{status}</Badge>;
  };

  const priorityBadge = (p: string) => {
    const v = p === "High" ? "destructive" : p === "Medium" ? "secondary" : "outline";
    return <Badge variant={v as any} className="text-[10px]">{p}</Badge>;
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <TableHead className="text-xs cursor-pointer select-none hover:text-foreground" onClick={() => toggleSort(sortKeyName)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{factoryInfo.name} — Production Orders</h1>
        <p className="text-sm text-muted-foreground">Manage and track all denim production orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Orders", value: totalOrders, icon: Package, color: "text-foreground" },
          { label: "In Progress", value: inProgress, icon: TrendingUp, color: "text-primary" },
          { label: "Completed", value: completed, icon: Package, color: "text-status-success" },
          { label: "Delayed", value: delayed, icon: CalendarDays, color: "text-status-critical" },
          { label: "Total Value", value: `$${(totalValue / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-foreground" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
                  <p className={`text-2xl font-bold font-mono mt-1 ${kpi.color}`}>{kpi.value}</p>
                </div>
                <kpi.icon className={`h-6 w-6 ${kpi.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search PO, buyer, style, fabric..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={buyerFilter} onValueChange={v => { setBuyerFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Buyer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buyers</SelectItem>
            {buyers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader label="PO Number" sortKeyName="poNumber" />
                  <SortHeader label="Buyer" sortKeyName="buyer" />
                  <TableHead className="text-xs">Style</TableHead>
                  <TableHead className="text-xs">Fabric / Color</TableHead>
                  <SortHeader label="Order Qty" sortKeyName="orderQty" />
                  <SortHeader label="Completed" sortKeyName="completedQty" />
                  <TableHead className="text-xs">Progress</TableHead>
                  <TableHead className="text-xs text-center">Priority</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <SortHeader label="Value" sortKeyName="totalValue" />
                  <SortHeader label="Finish" sortKeyName="plannedFinish" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedOrders.map(order => {
                  const progress = Math.round((order.completedQty / order.orderQty) * 100);
                  return (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOrder(order)}>
                      <TableCell className="font-mono text-sm font-medium">{order.poNumber}</TableCell>
                      <TableCell className="text-sm">{order.buyer}</TableCell>
                      <TableCell className="text-sm max-w-[140px] truncate">{order.style}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate">{order.fabric} / {order.color}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{order.orderQty.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{order.completedQty.toLocaleString()}</TableCell>
                      <TableCell className="w-[100px]">
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2" />
                          <span className="text-[10px] font-mono text-muted-foreground w-8">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{priorityBadge(order.priority)}</TableCell>
                      <TableCell className="text-center">{statusBadge(order.status)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">${(order.totalValue / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.plannedFinish}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, orders.length)} of {orders.length}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p > totalPages || p < 1) return null;
                return (
                  <Button key={p} variant={p === page ? "default" : "ghost"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                );
              })}
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {selectedOrder.poNumber}
                  <span className="ml-2">{statusBadge(selectedOrder.status)}</span>
                  <span>{priorityBadge(selectedOrder.priority)}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Buyer", value: selectedOrder.buyer },
                    { label: "Style", value: selectedOrder.style },
                    { label: "Fabric", value: selectedOrder.fabric },
                    { label: "Color", value: selectedOrder.color },
                    { label: "SMV", value: selectedOrder.smv.toFixed(2) },
                    { label: "Unit Price", value: `$${selectedOrder.unitPrice.toFixed(2)}` },
                    { label: "Total Value", value: `$${selectedOrder.totalValue.toLocaleString()}` },
                    { label: "Priority", value: selectedOrder.priority },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">{item.label}</p>
                      <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Daily Target</p><p className="text-xl font-bold font-mono">{selectedOrder.dailyTarget.toLocaleString()}</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Hourly Target</p><p className="text-xl font-bold font-mono">{selectedOrder.hourlyTarget}</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Order Qty</p><p className="text-xl font-bold font-mono">{selectedOrder.orderQty.toLocaleString()}</p></CardContent></Card>
                </div>

                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">AI Completion Forecast</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Planned</p>
                        <p className="font-mono text-sm font-semibold">{selectedOrder.plannedFinish}</p>
                      </div>
                      <div className="text-lg">→</div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Predicted</p>
                        <p className={`font-mono text-sm font-semibold ${selectedOrder.predictedCompletion > selectedOrder.plannedFinish ? "text-status-critical" : "text-status-success"}`}>
                          {selectedOrder.predictedCompletion}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Operation Bulletin</h3>
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-xs">Operation</TableHead><TableHead className="text-xs text-right">SMV</TableHead><TableHead className="text-xs">Machine</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {selectedOrder.operations.map((op, i) => (
                        <TableRow key={i}><TableCell className="text-sm">{op.operation}</TableCell><TableCell className="text-right font-mono text-sm">{op.smv}</TableCell><TableCell className="text-sm text-muted-foreground">{op.machineType}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
