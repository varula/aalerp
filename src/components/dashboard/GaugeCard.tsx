import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface GaugeCardProps {
  label: string;
  value: number;
  unit?: string;
  target?: number;
  icon: LucideIcon;
  color?: string;
}

export function GaugeCard({ label, value, unit = "%", target, icon: Icon, color = "hsl(var(--primary))" }: GaugeCardProps) {
  const pct = unit === "%" ? Math.min(value, 100) : target ? Math.min((value / target) * 100, 100) : 75;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference * 0.75; // 270deg arc
  const statusColor = pct >= 80 ? "hsl(var(--status-success))" : pct >= 60 ? "hsl(var(--status-warning))" : "hsl(var(--status-critical))";

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative h-[88px] w-[88px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-[135deg]">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="7" strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} strokeLinecap="round" />
            <circle cx="50" cy="50" r={radius} fill="none" stroke={statusColor} strokeWidth="7" strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold font-mono text-foreground leading-none">{value}</span>
            <span className="text-[9px] text-muted-foreground font-medium">{unit}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground font-medium leading-tight">{label}</p>
          {target !== undefined && (
            <p className="text-[10px] text-muted-foreground mt-1">Target: {target}{unit}</p>
          )}
          <Icon className="h-5 w-5 text-primary/40 mt-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}
