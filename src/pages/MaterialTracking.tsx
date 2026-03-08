import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Boxes, AlertTriangle, CheckCircle2, Truck } from "lucide-react";
import { materialInventory, getFactoryInfo } from "@/data/mock-data";

export default function MaterialTracking() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const factoryInfo = getFactoryInfo(selectedFactory);
  const materials = materialInventory.filter(m => selectedFactory === "all" || m.factoryId === selectedFactory);

  const sufficient = materials.filter(m => m.status === "Sufficient").length;
  const low = materials.filter(m => m.status === "Low").length;
  const critical = materials.filter(m => m.status === "Critical").length;
  const outOfStock = materials.filter(m => m.status === "Out of Stock").length;

  const statusVariant = (s: string) => s === "Sufficient" ? "default" : s === "Low" ? "secondary" : s === "Critical" ? "destructive" : "destructive";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — Material Tracking</h1>
        <p className="text-sm text-muted-foreground">Inventory levels and supply chain status</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Sufficient", value: sufficient, icon: CheckCircle2, color: "text-status-success" },
          { label: "Low Stock", value: low, icon: Boxes, color: "text-status-warning" },
          { label: "Critical", value: critical, icon: AlertTriangle, color: "text-status-critical" },
          { label: "Out of Stock", value: outOfStock, icon: AlertTriangle, color: "text-destructive" },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              <p className={`text-2xl font-bold font-mono mt-1 ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4" /> Inventory Overview
            <Badge variant="secondary" className="ml-auto text-[10px] font-mono">{materials.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Material</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs text-right">Current</TableHead>
                  <TableHead className="text-xs text-right">Min Stock</TableHead>
                  <TableHead className="text-xs">Stock Level</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs">Supplier</TableHead>
                  <TableHead className="text-xs">Last Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map(m => {
                  const pct = Math.min(Math.round(m.currentStock / m.minStock * 100), 100);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm font-medium">{m.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{m.type}</Badge></TableCell>
                      <TableCell className="text-right font-mono text-sm">{m.currentStock.toLocaleString()} {m.unit}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">{m.minStock.toLocaleString()}</TableCell>
                      <TableCell className="w-[100px]">
                        <Progress value={pct} className="h-1.5" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariant(m.status) as any} className="text-[10px]">{m.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.supplier}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{m.lastReceived}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
