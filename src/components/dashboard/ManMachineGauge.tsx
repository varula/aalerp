import { Card, CardContent } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { factoryLevelKPIs } from "@/data/mock-data";

interface ManMachineGaugeProps {
  factoryId?: string;
}

export function ManMachineGauge({ factoryId }: ManMachineGaugeProps) {
  const fKPI = factoryId ? factoryLevelKPIs.find(k => k.factoryId === factoryId) : undefined;
  const ratio = fKPI ? fKPI.manToMachineRatio : +(factoryLevelKPIs.reduce((s, k) => s + k.manToMachineRatio, 0) / factoryLevelKPIs.length).toFixed(2);
  const standard = 1.20;
  const pct = Math.min((standard / Number(ratio)) * 100, 100);
  const isGood = Number(ratio) <= standard + 0.15;

  const radius = 52;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const offset = arcLength - (pct / 100) * arcLength;

  const arcColor = isGood ? "hsl(142, 60%, 45%)" : Number(ratio) <= standard + 0.3 ? "hsl(38, 92%, 50%)" : "hsl(0, 72%, 51%)";
  const gradientId = `mmr-gauge`;

  return (
    <Card className="border-border/40 hover:border-primary/20 hover:shadow-md transition-all">
      <CardContent className="p-5 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 w-full">
          <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <Gauge className="h-4 w-4 text-chart-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">Man : Machine Ratio</span>
        </div>

        <div className="relative h-[140px] w-[140px]">
          <svg viewBox="0 0 130 130" className="h-full w-full -rotate-[135deg]">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={arcColor} stopOpacity={0.8} />
                <stop offset="100%" stopColor={arcColor} />
              </linearGradient>
            </defs>
            <circle cx="65" cy="65" r={radius} fill="none" stroke="hsl(var(--muted)/0.2)" strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference - arcLength}`} strokeLinecap="round" />
            <circle cx="65" cy="65" r={radius} fill="none" stroke={`url(#${gradientId})`} strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference - arcLength}`} strokeDashoffset={offset}
              strokeLinecap="round" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono text-foreground">{ratio}</span>
            <span className="text-[10px] text-muted-foreground font-semibold mt-0.5">Man : Machine</span>
          </div>
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Standard</span>
            <span className="font-mono font-bold text-foreground">{standard}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Actual</span>
            <span className={`font-mono font-bold ${isGood ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>{ratio}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Variance</span>
            <span className={`font-mono font-bold ${isGood ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {(Number(ratio) - standard) > 0 ? "+" : ""}{(Number(ratio) - standard).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
