import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getFactoryChartData, hourlyProduction } from "@/data/mock-data";
import { TrendingUp } from "lucide-react";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

interface Props { factoryId?: string; }

export function HourlyOutputChart({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).hourlyProduction : hourlyProduction;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </div>
          Hourly Output — Predicted vs Actual
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(82, 55%, 42%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(82, 55%, 42%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="hour" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
              <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="none" strokeDasharray="5 5" strokeWidth={1.5} name="Target" />
              <Area type="monotone" dataKey="predicted" stroke="hsl(82, 55%, 42%)" fill="url(#predGrad)" strokeWidth={2} name="Predicted" />
              <Area type="monotone" dataKey="actual" stroke="hsl(142, 60%, 45%)" fill="url(#actualGrad)" strokeWidth={2.5} name="Actual" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
