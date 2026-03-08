import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";
import { efficiencyTrend } from "@/data/mock-data";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

export function EfficiencyTrendChart() {
  const latest = efficiencyTrend[efficiencyTrend.length - 1]?.efficiency || 0;
  const prev = efficiencyTrend[efficiencyTrend.length - 2]?.efficiency || 0;
  const delta = latest - prev;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </div>
          Factory Efficiency Trend
        </CardTitle>
        <Badge variant={delta >= 0 ? "default" : "destructive"} className="text-[10px] font-mono">
          {delta >= 0 ? "+" : ""}{delta}% vs prev
        </Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={efficiencyTrend}>
              <defs>
                <linearGradient id="effGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <ReferenceLine y={75} stroke="hsl(var(--destructive))" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: "Target 75%", fill: "hsl(var(--muted-foreground))", fontSize: 9, position: "insideTopRight" }} />
              <Area type="monotone" dataKey="efficiency" stroke="hsl(142, 60%, 45%)" strokeWidth={2.5} fill="url(#effGradient)" dot={{ fill: "hsl(142, 60%, 45%)", strokeWidth: 2, r: 3, stroke: "hsl(var(--card))" }} activeDot={{ r: 5, fill: "hsl(142, 60%, 45%)", stroke: "hsl(var(--card))", strokeWidth: 2 }} name="Efficiency %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
