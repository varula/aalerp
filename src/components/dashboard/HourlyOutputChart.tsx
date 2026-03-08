import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getFactoryChartData, hourlyProduction } from "@/data/mock-data";
import { TrendingUp } from "lucide-react";
import { APPLE_TOOLTIP, APPLE_AXIS, APPLE_GRID, APPLE_COLORS } from "@/lib/chart-styles";

interface Props { factoryId?: string; }

export function HourlyOutputChart({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).hourlyProduction : hourlyProduction;

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-[13px] font-semibold flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Hourly Output
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={APPLE_COLORS.green} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={APPLE_COLORS.green} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={APPLE_COLORS.blue} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={APPLE_COLORS.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...APPLE_GRID} />
              <XAxis dataKey="hour" {...APPLE_AXIS} />
              <YAxis {...APPLE_AXIS} />
              <Tooltip contentStyle={APPLE_TOOLTIP} />
              <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} />
              <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="none" strokeDasharray="4 4" strokeWidth={1} name="Target" dot={false} />
              <Area type="monotone" dataKey="predicted" stroke={APPLE_COLORS.blue} fill="url(#predGrad)" strokeWidth={1.5} name="Predicted" dot={false} />
              <Area type="monotone" dataKey="actual" stroke={APPLE_COLORS.green} fill="url(#actualGrad)" strokeWidth={2} name="Actual" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
