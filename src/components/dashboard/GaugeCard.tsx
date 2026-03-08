import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface GaugeCardProps {
  label: string;
  value: number;
  unit?: string;
  target?: number;
  icon: LucideIcon;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  sparkData?: number[];
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 20;
  const w = 56;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="opacity-50">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GaugeCard({
  label, value, unit = "%", target, icon: Icon, trend, trendValue, sparkData,
}: GaugeCardProps) {
  const pct = unit === "%" ? Math.min(value, 100) : target ? Math.min((value / target) * 100, 100) : 75;
  const radius = 38;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const offset = arcLength - (pct / 100) * arcLength;

  const getArcColor = () => {
    if (pct >= 85) return "hsl(142, 71%, 45%)";
    if (pct >= 65) return "hsl(211, 100%, 50%)";
    if (pct >= 50) return "hsl(38, 92%, 50%)";
    return "hsl(0, 72%, 51%)";
  };
  const arcColor = getArcColor();

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColorClass = trend === "up" ? "text-status-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="will-change-transform"
    >
      <Card className="group relative overflow-hidden">
        <CardContent className="p-5 flex flex-col items-center gap-2">
          {/* Gauge */}
          <motion.div
            className="relative h-[84px] w-[84px]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-[135deg]">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference - arcLength}`} strokeLinecap="round" />
              <motion.circle
                cx="50" cy="50" r={radius} fill="none" stroke={arcColor} strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                strokeLinecap="round"
                initial={{ strokeDashoffset: arcLength }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-foreground leading-none tracking-tight">{value}</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{unit}</span>
            </div>
          </motion.div>

          {/* Label */}
          <div className="text-center w-full space-y-1">
            <p className="text-sm font-medium text-foreground tracking-tight">{label}</p>
            {target !== undefined && (
              <p className="text-xs text-muted-foreground">Target {target}{unit}</p>
            )}
            <div className="flex items-center justify-center gap-2">
              {trend && (
                <motion.div
                  className={`flex items-center gap-0.5 ${trendColorClass}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <TrendIcon className="h-3 w-3" />
                  {trendValue && <span className="text-xs font-medium">{trendValue}</span>}
                </motion.div>
              )}
              {sparkData && <MiniSparkline data={sparkData} color={arcColor} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
