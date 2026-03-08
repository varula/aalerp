import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { dhuTrend } from "@/data/mock-data";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

export function DHUControlChart() {
  const avg = +(dhuTrend.reduce((s, d) => s + d.dhu, 0) / dhuTrend.length).toFixed(1);
  const outOfControl = dhuTrend.filter(d => d.dhu > d.ucl).length;

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
            <LineChart data={dhuTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 7]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <ReferenceLine y={5} stroke="hsl(0, 72%, 51%)" strokeDasharray="6 4" strokeWidth={1.5}>
                <label position="insideTopRight" style={{ fill: "hsl(0, 72%, 51%)", fontSize: 9 }}>UCL 5%</label>
              </ReferenceLine>
              <ReferenceLine y={2.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeWidth={1}>
                <label position="insideTopRight" style={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}>CL</label>
              </ReferenceLine>
              <ReferenceLine y={0.5} stroke="hsl(142, 60%, 45%)" strokeDasharray="6 4" strokeWidth={1}>
                <label position="insideBottomRight" style={{ fill: "hsl(142, 60%, 45%)", fontSize: 9 }}>LCL</label>
              </ReferenceLine>
              <Line type="monotone" dataKey="dhu" stroke="hsl(0, 72%, 51%)" strokeWidth={2.5} dot={{ fill: "hsl(0, 72%, 51%)", strokeWidth: 2, r: 3.5, stroke: "hsl(var(--card))" }} activeDot={{ r: 5, fill: "hsl(0, 72%, 51%)", stroke: "hsl(var(--card))", strokeWidth: 2 }} name="DHU %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
