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
  const h = 22;
  const w = 64;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="opacity-40">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

export function GaugeCard({
  label, value, unit = "%", target, icon: Icon, trend, trendValue, sparkData,
}: GaugeCardProps) {
  const pct = unit === "%" ? Math.min(value, 100) : target ? Math.min((value / target) * 100, 100) : 75;
  const radius = 52;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const getColor = () => {
    if (label.toLowerCase().includes("dhu") || label.toLowerCase().includes("ot")) {
      if (value <= 3) return "hsl(142, 71%, 45%)";
      if (value <= 5) return "hsl(38, 92%, 50%)";
      return "hsl(0, 72%, 51%)";
    }
    if (pct >= 85) return "hsl(142, 71%, 45%)";
    if (pct >= 65) return "hsl(190, 70%, 42%)";
    if (pct >= 50) return "hsl(38, 92%, 50%)";
    return "hsl(0, 72%, 51%)";
  };
  const color = getColor();

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColorClass = label.toLowerCase().includes("dhu")
    ? (trend === "down" ? "text-status-success" : "text-destructive")
    : (trend === "up" ? "text-status-success" : trend === "down" ? "text-destructive" : "text-muted-foreground");

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25, ease: appleEase }}
      className="will-change-transform"
    >
      <Card className="group relative overflow-hidden border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 flex flex-col items-center gap-3">
          {/* Full-circle gauge */}
          <motion.div
            className="relative h-[120px] w-[120px]"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: appleEase }}
          >
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              {/* Track */}
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
                strokeOpacity={0.45}
              />
              {/* Value arc */}
              <motion.circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: appleEase, delay: 0.15 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground leading-none tracking-tight">{value}</span>
              <span className="text-[11px] text-muted-foreground font-medium mt-0.5">{unit}</span>
            </div>
          </motion.div>

          {/* Label & meta */}
          <div className="text-center w-full space-y-1">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {target !== undefined && (
              <p className="text-xs text-muted-foreground">Target {target}{unit}</p>
            )}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              {trend && (
                <motion.div
                  className={`flex items-center gap-1 ${trendColorClass}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <TrendIcon className="h-3.5 w-3.5" />
                  {trendValue && <span className="text-xs font-semibold">{trendValue}</span>}
                </motion.div>
              )}
              {sparkData && <MiniSparkline data={sparkData} color={color} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
