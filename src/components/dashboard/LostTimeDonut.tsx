import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { lostTimeBreakdown } from "@/data/mock-data";
import { Clock } from "lucide-react";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

export function LostTimeDonut() {
  const total = lostTimeBreakdown.reduce((s, d) => s + d.value, 0);
  const largest = lostTimeBreakdown.reduce((a, b) => a.value > b.value ? a : b);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-chart-3" />
          </div>
          Lost Time Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center gap-6">
          <div className="relative h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={lostTimeBreakdown} cx="50%" cy="50%" innerRadius={58} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="category" cornerRadius={4}>
                  {lostTimeBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-foreground">{total}</span>
              <span className="text-[9px] text-muted-foreground font-semibold uppercase">Total Min</span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            {lostTimeBreakdown.map((d) => {
              const pct = Math.round((d.value / total) * 100);
              return (
                <div key={d.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-xs text-foreground">{d.category}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{pct}%</span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1 bg-muted rounded-full overflow-hidden ml-[18px]">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: d.fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
