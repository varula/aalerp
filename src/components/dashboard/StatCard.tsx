import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { AnimatedValue } from "@/components/AnimatedValue";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ label, value, sub, icon: Icon, iconColor = "text-primary/50" }: StatCardProps) {
  return (
    <Card className="group border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 overflow-hidden relative">
      {/* Decorative background icon */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
        <Icon className="h-20 w-20" />
      </div>
      <CardContent className="p-4 flex items-center gap-3 relative">
        <div className={`h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
          <AnimatedValue value={value} className="text-xl font-bold font-mono text-foreground" />
          <p className="text-[10px] text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}
