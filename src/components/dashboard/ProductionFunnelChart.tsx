import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { getFactoryChartData, productionFunnel } from "@/data/mock-data";
import { ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APPLE_TOOLTIP, APPLE_AXIS, APPLE_COLORS } from "@/lib/chart-styles";

const FUNNEL_COLORS = [
  APPLE_COLORS.green, APPLE_COLORS.teal, APPLE_COLORS.blue, APPLE_COLORS.orange, APPLE_COLORS.purple,
];

interface Props { factoryId?: string; }

export function ProductionFunnelChart({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).productionFunnel : productionFunnel;
  const lossTotal = data[0].qty - data[data.length - 1].qty;
  const lossPercent = ((lossTotal / data[0].qty) * 100).toFixed(1);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <ArrowDown className="h-4 w-4 text-chart-4" />
          </div>
          Production Funnel — Cut to Ship
        </CardTitle>
        <Badge variant="destructive" className="text-[10px] font-mono">{lossPercent}% loss</Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="qty" radius={[8, 8, 0, 0]} name="Quantity">
                {data.map((_, i) => (
                  <Cell key={i} fill={FUNNEL_COLORS[i]} />
                ))}
                <LabelList dataKey="qty" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-1 mt-2">
          {data.map((d, i) => (
            <div key={d.stage} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: FUNNEL_COLORS[i] }} />
              <span className="text-[9px] text-muted-foreground font-medium">{d.stage}</span>
              {i < data.length - 1 && <span className="text-[9px] text-muted-foreground mx-1">→</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
