import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Props {
  totalOutput: number;
  totalTarget: number;
  efficiency: number;
}

export function TargetCompletionDonut({ totalOutput, totalTarget, efficiency }: Props) {
  const pct = totalTarget > 0 ? Math.min(Math.round((totalOutput / totalTarget) * 100), 100) : 0;
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const getColor = () => {
    if (pct >= 85) return "hsl(152, 60%, 42%)";
    if (pct >= 65) return "hsl(190, 70%, 42%)";
    if (pct >= 50) return "hsl(38, 92%, 50%)";
    return "hsl(0, 72%, 51%)";
  };
  const color = getColor();

  const items = [
    { label: "Output achieved", value: totalOutput.toLocaleString(), color: "bg-primary" },
    { label: "Remaining", value: Math.max(totalTarget - totalOutput, 0).toLocaleString(), color: "bg-muted-foreground/30" },
    { label: "Avg Efficiency", value: `${efficiency}%`, color: "bg-status-success" },
  ];

  return (
    <Card className="border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full">
      <CardContent className="p-6 flex flex-col items-center justify-between h-full gap-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Target Completion</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Daily progress</p>
          </div>
          <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0 font-medium text-muted-foreground border-border/60">
            Today
          </Badge>
        </div>

        {/* Donut */}
        <motion.div
          className="relative h-[170px] w-[170px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <svg viewBox="0 0 170 170" className="h-full w-full -rotate-90">
            <circle
              cx="85" cy="85" r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              strokeOpacity={0.4}
            />
            <motion.circle
              cx="85" cy="85" r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-4xl font-bold text-foreground tracking-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {pct}%
            </motion.span>
            <span className="text-xs text-muted-foreground font-medium mt-0.5">
              Completion
            </span>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="w-full space-y-2.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
              <span className="font-semibold text-foreground tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
