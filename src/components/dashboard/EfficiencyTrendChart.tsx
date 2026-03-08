import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts";
import { getFactoryChartData, efficiencyTrend } from "@/data/mock-data";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APPLE_TOOLTIP, APPLE_AXIS, APPLE_GRID, APPLE_COLORS } from "@/lib/chart-styles";

interface Props { factoryId?: string; }

export function EfficiencyTrendChart({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).efficiencyTrend : efficiencyTrend;
  const latest = data[data.length - 1]?.efficiency || 0;
  const prev = data[data.length - 2]?.efficiency || 0;
  const delta = latest - prev;

  return (
    <Card>
      <CardHeader className="pb-1 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[13px] font-semibold flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-status-success" />
          </div>
          Efficiency Trend
        </CardTitle>
        <Badge variant={delta >= 0 ? "default" : "destructive"} className="text-[10px] font-medium rounded-full px-2.5">
          {delta >= 0 ? "+" : ""}{delta}%
        </Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="effGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={APPLE_COLORS.green} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={APPLE_COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...APPLE_GRID} />
              <XAxis dataKey="day" {...APPLE_AXIS} />
              <YAxis domain={[50, 100]} {...APPLE_AXIS} />
              <Tooltip contentStyle={APPLE_TOOLTIP} />
              <ReferenceLine y={75} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1} strokeOpacity={0.4} />
              <Area type="monotone" dataKey="efficiency" stroke={APPLE_COLORS.green} strokeWidth={2} fill="url(#effGradient)" dot={false} activeDot={{ r: 4, fill: APPLE_COLORS.green, stroke: "hsl(var(--card))", strokeWidth: 2 }} name="Efficiency %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
