import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { AnimatedValue } from "@/components/AnimatedValue";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  iconColor?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export function StatCard({ label, value, sub, icon: Icon, iconColor = "text-primary", change, changeType = "neutral" }: StatCardProps) {
  const changeColor = changeType === "positive"
    ? "text-status-success bg-status-success/10"
    : changeType === "negative"
      ? "text-destructive bg-destructive/10"
      : "text-muted-foreground bg-muted";

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="will-change-transform"
    >
      <Card className="group overflow-hidden border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <motion.div
              className="h-11 w-11 rounded-full bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0"
              whileHover={{ rotate: 6, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </motion.div>
            {change && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${changeColor}`}>
                {change}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
          <AnimatedValue value={value} className="text-2xl font-bold text-foreground tracking-tight" />
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
