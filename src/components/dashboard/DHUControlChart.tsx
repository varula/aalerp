import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { getFactoryChartData, dhuTrend } from "@/data/mock-data";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APPLE_TOOLTIP, APPLE_AXIS, APPLE_GRID } from "@/lib/chart-styles";

interface Props { factoryId?: string; }

export function DHUControlChart({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).dhuTrend : dhuTrend;
  const avg = +(data.reduce((s, d) => s + d.dhu, 0) / data.length).toFixed(1);
  const outOfControl = data.filter(d => d.dhu > d.ucl).length;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-5/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-chart-5" />
          </div>
          DHU Control Chart
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] font-mono">Avg: {avg}%</Badge>
          {outOfControl > 0 && (
            <Badge variant="destructive" className="text-[10px] font-mono">{outOfControl} OOC</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 7]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <ReferenceLine y={5} stroke="hsl(0, 72%, 51%)" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: "UCL 5%", fill: "hsl(0, 72%, 51%)", fontSize: 9, position: "insideTopRight" }} />
              <ReferenceLine y={2.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeWidth={1} label={{ value: "CL", fill: "hsl(var(--muted-foreground))", fontSize: 9, position: "insideTopRight" }} />
              <ReferenceLine y={0.5} stroke="hsl(142, 60%, 45%)" strokeDasharray="6 4" strokeWidth={1} label={{ value: "LCL", fill: "hsl(142, 60%, 45%)", fontSize: 9, position: "insideBottomRight" }} />
              <Line type="monotone" dataKey="dhu" stroke="hsl(0, 72%, 51%)" strokeWidth={2.5} dot={{ fill: "hsl(0, 72%, 51%)", strokeWidth: 2, r: 3.5, stroke: "hsl(var(--card))" }} activeDot={{ r: 5, fill: "hsl(0, 72%, 51%)", stroke: "hsl(var(--card))", strokeWidth: 2 }} name="DHU %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
