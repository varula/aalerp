import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Search, CalendarDays, TrendingUp, Package } from "lucide-react";
import { productionOrders, type ProductionOrder } from "@/data/mock-data";

export default function ProductionOrders() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);

  const orders = productionOrders
    .filter(o => selectedFactory === "all" || o.factoryId === selectedFactory)
    .filter(o => statusFilter === "all" || o.status === statusFilter)
    .filter(o =>
      o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer.toLowerCase().includes(search.toLowerCase()) ||
      o.style.toLowerCase().includes(search.toLowerCase())
    );

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "In Progress": "default",
      Pending: "secondary",
      Completed: "outline",
      Delayed: "destructive",
    };
    return <Badge variant={map[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Production Orders</h1>
        <p className="text-sm text-muted-foreground">Manage and track all production orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PO, buyer, style..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">PO Number</TableHead>
                  <TableHead className="text-xs">Buyer</TableHead>
                  <TableHead className="text-xs">Style</TableHead>
                  <TableHead className="text-xs text-right">Order Qty</TableHead>
                  <TableHead className="text-xs text-right">Completed</TableHead>
                  <TableHead className="text-xs">Progress</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs">Planned Finish</TableHead>
                  <TableHead className="text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 50).map(order => {
                  const progress = Math.round((order.completedQty / order.orderQty) * 100);
                  return (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <TableCell className="font-mono text-sm font-medium">{order.poNumber}</TableCell>
                      <TableCell className="text-sm">{order.buyer}</TableCell>
                      <TableCell className="text-sm">{order.style}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{order.orderQty.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{order.completedQty.toLocaleString()}</TableCell>
                      <TableCell className="w-[120px]">
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2" />
                          <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{statusBadge(order.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.plannedFinish}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-xs">View</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Order Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Buyer", value: selectedOrder.buyer },
                    { label: "Style", value: selectedOrder.style },
                    { label: "SMV", value: selectedOrder.smv.toFixed(2) },
                    { label: "Status", value: selectedOrder.status },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">{item.label}</p>
                      <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Targets */}
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Daily Target</p>
                      <p className="text-xl font-bold font-mono">{selectedOrder.dailyTarget.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Hourly Target</p>
                      <p className="text-xl font-bold font-mono">{selectedOrder.hourlyTarget}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Order Qty</p>
                      <p className="text-xl font-bold font-mono">{selectedOrder.orderQty.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Prediction */}
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">AI Completion Forecast</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> Planned
                        </p>
                        <p className="font-mono text-sm font-semibold">{selectedOrder.plannedFinish}</p>
                      </div>
                      <div className="text-lg">→</div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Predicted
                        </p>
                        <p className={`font-mono text-sm font-semibold ${selectedOrder.predictedCompletion > selectedOrder.plannedFinish ? "text-status-critical" : "text-status-success"}`}>
                          {selectedOrder.predictedCompletion}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operation Bulletin */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Operation Bulletin</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Operation</TableHead>
                        <TableHead className="text-xs text-right">SMV</TableHead>
                        <TableHead className="text-xs">Machine</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.operations.map((op, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{op.operation}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{op.smv}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{op.machineType}</TableCell>
                        </TableRow>
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
