import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { downtimeReasons } from "@/data/mock-data";
import { AlertTriangle } from "lucide-react";
import { APPLE_TOOLTIP, APPLE_AXIS } from "@/lib/chart-styles";

export function DowntimeParetoChart() {
  const data = [...downtimeReasons].sort((a, b) => b.minutes - a.minutes).slice(0, 6);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-5/10 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-chart-5" />
          </div>
          Downtime Pareto
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={16}>
              <XAxis type="number" {...APPLE_AXIS} />
              <YAxis dataKey="reason" type="category" width={120} {...APPLE_AXIS} />
              <Tooltip contentStyle={APPLE_TOOLTIP} />
              <Bar dataKey="minutes" fill="hsl(0, 72%, 51%)" radius={[0, 6, 6, 0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
