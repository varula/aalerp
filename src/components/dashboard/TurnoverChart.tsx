import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, ReferenceLine } from "recharts";
import { getFactoryChartData, turnoverTrend } from "@/data/mock-data";
import { UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APPLE_TOOLTIP, APPLE_AXIS } from "@/lib/chart-styles";

interface Props { factoryId?: string; }

export function TurnoverChart({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).turnoverTrend : turnoverTrend;
  const avg = +(data.reduce((s, d) => s + d.rate, 0) / data.length).toFixed(1);

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
            <BarChart data={data} barSize={32}>
              <XAxis dataKey="month" {...APPLE_AXIS} tick={{ ...APPLE_AXIS.tick, fontSize: 11 }} />
              <YAxis {...APPLE_AXIS} domain={[0, 10]} />
              <Tooltip contentStyle={APPLE_TOOLTIP} />
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
