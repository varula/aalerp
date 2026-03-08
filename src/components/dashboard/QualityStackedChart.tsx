import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getFactoryChartData, qualityPerformance } from "@/data/mock-data";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

interface Props { factoryId?: string; }

export function QualityStackedChart({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).qualityPerformance : qualityPerformance;
  const avgPass = Math.round(data.reduce((s, d) => s + d.pass, 0) / data.length);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-chart-2" />
          </div>
          Quality Performance
        </CardTitle>
        <Badge variant="secondary" className="text-[10px] font-mono">Avg Pass: {avgPass}%</Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
              <Bar dataKey="pass" stackId="a" fill="hsl(142, 60%, 45%)" name="Pass %" />
              <Bar dataKey="rework" stackId="a" fill="hsl(38, 92%, 50%)" name="Rework %" />
              <Bar dataKey="reject" stackId="a" fill="hsl(0, 72%, 51%)" name="Reject %" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
