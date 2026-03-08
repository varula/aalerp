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

export function StatCard({ label, value, sub, icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="group overflow-hidden">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className={`h-[18px] w-[18px] ${iconColor} opacity-80`} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <AnimatedValue value={value} className="text-xl font-semibold text-foreground" />
          <p className="text-[10px] text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}
