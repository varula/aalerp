import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { getFactoryChartData, efficiencyTrend } from "@/data/mock-data";
import { TrendingUp, Clock } from "lucide-react";
import { APPLE_TOOLTIP, APPLE_AXIS, APPLE_GRID, APPLE_COLORS } from "@/lib/chart-styles";
import { motion } from "framer-motion";

interface Props {
  factoryId?: string;
  totalOutput: number;
  totalTarget: number;
}

export function PerformanceOverview({ factoryId, totalOutput, totalTarget }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).efficiencyTrend : efficiencyTrend;
  const achievementPct = totalTarget > 0 ? Math.round((totalOutput / totalTarget) * 100) : 0;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Card className="border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground">Performance Overview</h3>
              <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0 font-medium text-muted-foreground border-border/60">
                Last 14 Days
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Total Output</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Update: {timeStr}
          </div>
        </div>

        {/* Big value row */}
        <div className="flex items-baseline gap-3 mb-5">
          <motion.span
            className="text-4xl font-bold text-foreground tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {totalOutput.toLocaleString()}
          </motion.span>
          <Badge className="bg-status-success/10 text-status-success border-0 text-xs font-semibold rounded-full px-2.5 hover:bg-status-success/15">
            <TrendingUp className="h-3 w-3 mr-1" />
            {achievementPct}%
          </Badge>
          <span className="text-sm font-semibold text-muted-foreground">
            / {totalTarget.toLocaleString()} target
          </span>
        </div>

        {/* Chart */}
        <div className="h-[220px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={APPLE_COLORS.blue} stopOpacity={0.18} />
                  <stop offset="60%" stopColor={APPLE_COLORS.blue} stopOpacity={0.06} />
                  <stop offset="100%" stopColor={APPLE_COLORS.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...APPLE_GRID} />
              <XAxis dataKey="day" {...APPLE_AXIS} />
              <YAxis domain={[50, 100]} {...APPLE_AXIS} />
              <Tooltip
                contentStyle={APPLE_TOOLTIP}
                formatter={(val: number) => [`${val}%`, "Efficiency"]}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke={APPLE_COLORS.blue}
                strokeWidth={2.5}
                fill="url(#perfGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: APPLE_COLORS.blue,
                  stroke: "hsl(var(--card))",
                  strokeWidth: 2.5,
                }}
                name="Efficiency %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
