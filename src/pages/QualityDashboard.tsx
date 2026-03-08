import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, CheckCircle2, AlertTriangle, TrendingUp, Eye } from "lucide-react";
import { qualityInspections, getFactoryInfo } from "@/data/mock-data";
import { APPLE_TOOLTIP, APPLE_AXIS, APPLE_GRID, APPLE_COLORS } from "@/lib/chart-styles";
import { motion } from "framer-motion";
import { PanelSection } from "@/components/dashboard/PanelSection";

const COLORS = [
  APPLE_COLORS.red, APPLE_COLORS.orange, APPLE_COLORS.purple, APPLE_COLORS.blue,
  APPLE_COLORS.green, APPLE_COLORS.pink, APPLE_COLORS.teal,
];

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

const cardHover = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.985 },
  transition: { duration: 0.25, ease: appleEase },
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: appleEase } },
} as const;

export default function QualityDashboard() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const factoryInfo = getFactoryInfo(selectedFactory);
  const inspections = qualityInspections.filter(i => selectedFactory === "all" || i.factoryId === selectedFactory);

  const totalInspected = inspections.reduce((s, i) => s + i.inspectedQty, 0);
  const totalDefects = inspections.reduce((s, i) => s + i.defectQty, 0);
  const avgDhu = totalInspected ? +(totalDefects / totalInspected * 100).toFixed(1) : 0;
  const passRate = inspections.length ? Math.round(inspections.filter(i => i.aqlResult === "Pass").length / inspections.length * 100) : 0;
  const failCount = inspections.filter(i => i.aqlResult === "Fail").length;

  const defectByType: Record<string, number> = {};
  inspections.forEach(i => i.defects.forEach(d => { defectByType[d.type] = (defectByType[d.type] || 0) + d.count; }));
  const defectChart = Object.entries(defectByType).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([type, count]) => ({ type, count }));

  const dailyDhu: Record<string, { total: number; defects: number }> = {};
  inspections.forEach(i => {
    if (!dailyDhu[i.date]) dailyDhu[i.date] = { total: 0, defects: 0 };
    dailyDhu[i.date].total += i.inspectedQty;
    dailyDhu[i.date].defects += i.defectQty;
  });
  const dhuTrend = Object.entries(dailyDhu).sort().map(([date, d]) => ({ date: date.slice(5), dhu: +(d.defects / d.total * 100).toFixed(1) }));

  const kpis = [
    { label: "Avg DHU", value: `${avgDhu}%`, icon: Shield, color: avgDhu < 3 ? "text-status-success" : "text-status-warning" },
    { label: "RFT Rate", value: `${(100 - avgDhu).toFixed(1)}%`, icon: CheckCircle2, color: "text-status-success" },
    { label: "AQL Pass Rate", value: `${passRate}%`, icon: TrendingUp, color: passRate >= 90 ? "text-status-success" : "text-status-warning" },
    { label: "AQL Failures", value: failCount, icon: AlertTriangle, color: failCount > 5 ? "text-status-critical" : "text-muted-foreground" },
  ];

  return (
    <div className="space-y-8">
      <PanelSection
        title={`${factoryInfo.name} — Quality Dashboard`}
        subtitle="Quality metrics and inspection results"
        icon={<div className="h-8 w-8 rounded-xl bg-chart-5/10 flex items-center justify-center"><Shield className="h-4 w-4 text-chart-5" /></div>}
      >
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={stagger} initial="hidden" animate="visible">
          {kpis.map(kpi => (
            <motion.div key={kpi.label} variants={fadeUp} {...cardHover} className="will-change-transform">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
                      <p className={`text-2xl font-semibold mt-1.5 ${kpi.color}`}>{kpi.value}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <kpi.icon className={`h-[18px] w-[18px] ${kpi.color} opacity-60`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </PanelSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...cardHover} className="will-change-transform">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Defect Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-[200px] w-[200px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={defectChart} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="count" nameKey="type" cornerRadius={4}>
                        {defectChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={APPLE_TOOLTIP} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {defectChart.map((d, i) => (
                    <div key={d.type} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] flex-1 truncate text-foreground">{d.type}</span>
                      <span className="text-[11px] font-semibold tabular-nums">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...cardHover} className="will-change-transform">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">DHU Trend (7 Days)</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dhuTrend}>
                    <XAxis dataKey="date" {...APPLE_AXIS} />
                    <YAxis {...APPLE_AXIS} />
                    <Tooltip contentStyle={APPLE_TOOLTIP} />
                    <Bar dataKey="dhu" fill={APPLE_COLORS.red} radius={[6, 6, 0, 0]} name="DHU %" barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" /> Recent Inspections
              <Badge variant="secondary" className="ml-auto text-[10px]">{inspections.length} records</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] uppercase tracking-wider">ID</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider">Inspector</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Inspected</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">Defects</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-right">DHU%</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider text-center">AQL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.slice(0, 30).map((ins, idx) => (
                    <TableRow key={ins.id} className={idx % 2 === 0 ? "bg-muted/40" : ""}>
                      <TableCell className="text-[12px] tabular-nums">{ins.id}</TableCell>
                      <TableCell className="text-[12px]">{ins.date}</TableCell>
                      <TableCell className="text-[12px]">{ins.inspector}</TableCell>
                      <TableCell className="text-right text-[12px] tabular-nums">{ins.inspectedQty}</TableCell>
                      <TableCell className="text-right text-[12px] tabular-nums">{ins.defectQty}</TableCell>
                      <TableCell className="text-right text-[12px] tabular-nums">{ins.dhu}%</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={ins.aqlResult === "Pass" ? "default" : ins.aqlResult === "Fail" ? "destructive" : "secondary"} className="text-[10px]">
                          {ins.aqlResult}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
