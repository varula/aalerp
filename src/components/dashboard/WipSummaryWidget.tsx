import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Scissors, Wind, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

interface StageData {
  label: string;
  icon: LucideIcon;
  bundles: number;
  orders: number;
  color: string;
  bgColor: string;
}

const stages: StageData[] = [
  { label: "Cutting", icon: Scissors, bundles: 142, orders: 8, color: "text-chart-1", bgColor: "bg-chart-1/10" },
  { label: "Sewing", icon: Wind, bundles: 387, orders: 14, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  { label: "Finishing", icon: Layers, bundles: 95, orders: 6, color: "text-chart-4", bgColor: "bg-chart-4/10" },
];

export function WipSummaryWidget() {
  const navigate = useNavigate();
  const totalBundles = stages.reduce((s, st) => s + st.bundles, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-4 w-4 text-primary" />
          </div>
          WIP Summary
          <Badge variant="secondary" className="ml-auto text-xs rounded-full px-2.5">
            {totalBundles} bundles
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage) => {
          const pct = Math.round((stage.bundles / totalBundles) * 100);
          return (
            <div key={stage.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg ${stage.bgColor} flex items-center justify-center`}>
                    <stage.icon className={`h-3.5 w-3.5 ${stage.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{stage.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{stage.orders} orders</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">{stage.bundles}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${stage.bgColor.replace("/10", "")}`}
                  style={{ backgroundColor: `hsl(var(--chart-${stages.indexOf(stage) === 0 ? 1 : stages.indexOf(stage) === 1 ? 2 : 4}))` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: appleEase, delay: 0.2 }}
                />
              </div>
            </div>
          );
        })}
        {/* Flow arrow summary */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/40">
          {stages.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-2">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-foreground">{stage.bundles}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stage.label}</p>
              </div>
              {i < stages.length - 1 && (
                <span className="text-muted-foreground/50 text-sm">→</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
