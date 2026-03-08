import { useOutletContext } from "react-router-dom";
import { Activity, Users, Shield, Clock, Factory, TrendingUp, BarChart3, Layers, Scissors, Package } from "lucide-react";
import { getDeptKPIs, getFactoryChartData } from "@/data/mock-data";
import { GaugeCard } from "@/components/dashboard/GaugeCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { PanelSection } from "@/components/dashboard/PanelSection";
import { EfficiencyTrendChart } from "@/components/dashboard/EfficiencyTrendChart";
import { DHUControlChart } from "@/components/dashboard/DHUControlChart";
import { LaborProductivityChart } from "@/components/dashboard/LaborProductivityChart";
import { QualityStackedChart } from "@/components/dashboard/QualityStackedChart";
import { LostTimeDonut } from "@/components/dashboard/LostTimeDonut";
import { AbsenteeismHeatmap } from "@/components/dashboard/AbsenteeismHeatmap";
import { motion } from "framer-motion";

const DEPT_CONFIG = {
  Cutting: { icon: Scissors, color: "text-chart-2", accent: "bg-chart-2", description: "Fabric cutting, layering, and marker operations" },
  Sewing: { icon: Factory, color: "text-chart-1", accent: "bg-chart-1", description: "Sewing lines, operator performance, and assembly" },
  Finishing: { icon: Package, color: "text-chart-4", accent: "bg-chart-4", description: "Finishing, washing, pressing, and packing operations" },
} as const;

interface Props {
  department: "Cutting" | "Sewing" | "Finishing";
}

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: appleEase } },
};

export default function DepartmentDashboard({ department }: Props) {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const factoryId = selectedFactory === "all" ? undefined : selectedFactory;
  const kpis = getDeptKPIs(department, factoryId);
  const config = DEPT_CONFIG[department];
  const Icon = config.icon;
  const chartKey = `dept-${department}${factoryId ? `-${factoryId}` : ""}`;

  return (
    <motion.div className="space-y-8 pb-8" variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted/60 flex items-center justify-center">
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{department} Department</h1>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Gauges */}
      <motion.div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3" variants={stagger}>
        {[
          { label: "Efficiency", value: kpis.efficiency, unit: "%", target: 75, icon: Activity, trend: "up" as const, trendValue: "+1.5%" },
          { label: "Labor Productivity", value: kpis.laborProductivity, unit: " pcs/op", icon: Users, trend: "up" as const, trendValue: "+0.5" },
          { label: "RFT Quality", value: kpis.rft, unit: "%", target: 97, icon: Shield, trend: "up" as const, trendValue: "+0.2%" },
          { label: "DHU Rate", value: kpis.dhu, unit: "%", icon: Shield, trend: "down" as const, trendValue: "-0.1%" },
          { label: "Lost Time", value: kpis.lostTime, unit: "%", icon: Clock, trend: "down" as const, trendValue: "-0.3%" },
          { label: "Absenteeism", value: kpis.absenteeism, unit: "%", icon: Users, trend: "flat" as const, trendValue: "0%" },
        ].map((g) => (
          <motion.div key={g.label} variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
            <GaugeCard {...g} />
          </motion.div>
        ))}
      </motion.div>

      {/* Quick stats */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3" variants={stagger}>
        {[
          { label: "Active Lines", value: kpis.activeLines, sub: "Currently running", icon: Factory, iconColor: config.color },
          { label: "Total Output", value: kpis.totalOutput.toLocaleString(), sub: `of ${kpis.totalTarget.toLocaleString()}`, icon: TrendingUp, iconColor: "text-chart-2" },
          { label: "Efficiency", value: `${kpis.efficiency}%`, sub: "Department avg", icon: Activity, iconColor: "text-chart-1" },
          { label: "DHU", value: `${kpis.dhu}%`, sub: "Defects per 100", icon: Shield, iconColor: "text-chart-5" },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Productivity */}
      <motion.div variants={fadeUp}>
        <PanelSection title="Productivity" subtitle={`${department} efficiency trends`} accentColor={config.accent} icon={<BarChart3 className={`h-4 w-4 ${config.color}`} />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EfficiencyTrendChart factoryId={chartKey} />
            <LaborProductivityChart factoryId={chartKey} />
          </div>
        </PanelSection>
      </motion.div>

      {/* Quality */}
      <motion.div variants={fadeUp}>
        <PanelSection title="Quality" subtitle={`${department} quality metrics`} accentColor="bg-chart-5" icon={<Shield className="h-4 w-4 text-chart-5" />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DHUControlChart factoryId={chartKey} />
            <QualityStackedChart factoryId={chartKey} />
          </div>
        </PanelSection>
      </motion.div>

      {/* Workforce */}
      <motion.div variants={fadeUp}>
        <PanelSection title="Workforce" subtitle="Attendance and lost time" accentColor="bg-chart-3" icon={<Users className="h-4 w-4 text-chart-3" />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AbsenteeismHeatmap factoryId={chartKey} />
            <LostTimeDonut factoryId={chartKey} />
          </div>
        </PanelSection>
      </motion.div>
    </motion.div>
  );
}
