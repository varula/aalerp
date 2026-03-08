import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, ReferenceLine } from "recharts";
import { turnoverTrend } from "@/data/mock-data";
import { UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

export function TurnoverChart() {
  const avg = +(turnoverTrend.reduce((s, d) => s + d.rate, 0) / turnoverTrend.length).toFixed(1);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <UserMinus className="h-4 w-4 text-chart-4" />
          </div>
          Employee Turnover
        </CardTitle>
        <Badge variant="secondary" className="text-[10px] font-mono">Avg: {avg}%</Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={turnoverTrend} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} domain={[0, 10]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <ReferenceLine y={avg} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1} />
              <Bar dataKey="rate" fill="hsl(280, 45%, 55%)" radius={[8, 8, 0, 0]} name="Turnover %">
                <LabelList dataKey="rate" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 700 }} formatter={(v: number) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
