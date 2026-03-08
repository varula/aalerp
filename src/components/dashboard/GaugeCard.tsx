import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  const h = 24;
  const w = 64;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GaugeCard({
  label, value, unit = "%", target, icon: Icon, trend, trendValue, sparkData,
}: GaugeCardProps) {
  const pct = unit === "%" ? Math.min(value, 100) : target ? Math.min((value / target) * 100, 100) : 75;
  const radius = 40;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° arc
  const offset = arcLength - (pct / 100) * arcLength;

  // Gradient colors based on performance
  const getArcColors = () => {
    if (pct >= 85) return { start: "hsl(142, 60%, 45%)", end: "hsl(142, 70%, 55%)" };
    if (pct >= 65) return { start: "hsl(82, 55%, 42%)", end: "hsl(82, 65%, 52%)" };
    if (pct >= 50) return { start: "hsl(38, 92%, 50%)", end: "hsl(38, 80%, 60%)" };
    return { start: "hsl(0, 72%, 51%)", end: "hsl(0, 60%, 60%)" };
  };
  const arcColors = getArcColors();
  const gradientId = `gauge-${label.replace(/\s/g, "")}`;

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColorClass = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <Card className="group relative overflow-hidden border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      {/* Subtle gradient accent top */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundImage: `linear-gradient(to right, ${arcColors.start}, ${arcColors.end})` }} />
      <CardContent className="p-4 flex flex-col items-center gap-1">
        {/* Gauge */}
        <div className="relative h-[90px] w-[90px]">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-[135deg]">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={arcColors.start} />
                <stop offset="100%" stopColor={arcColors.end} />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted)/0.25)" strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference - arcLength}`} strokeLinecap="round" />
            {/* Value arc */}
            <circle cx="50" cy="50" r={radius} fill="none" stroke={`url(#${gradientId})`} strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference - arcLength}`} strokeDashoffset={offset}
              strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold font-mono text-foreground leading-none tracking-tight">{value}</span>
            <span className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{unit}</span>
          </div>
        </div>

        {/* Label + info */}
        <div className="text-center w-full space-y-1">
          <p className="text-[11px] font-semibold text-foreground leading-tight tracking-tight">{label}</p>
          {target !== undefined && (
            <p className="text-[9px] text-muted-foreground">Target: {target}{unit}</p>
          )}
          {/* Trend + Sparkline */}
          <div className="flex items-center justify-center gap-2">
            {trend && (
              <div className={`flex items-center gap-0.5 ${trendColorClass}`}>
                <TrendIcon className="h-3 w-3" />
                {trendValue && <span className="text-[10px] font-semibold">{trendValue}</span>}
              </div>
            )}
            {sparkData && <MiniSparkline data={sparkData} color={arcColors.start} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
