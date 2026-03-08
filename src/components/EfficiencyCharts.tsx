import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAll, CrudRecord } from "@/lib/crud-storage";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LineChart, Line, ComposedChart, Area,
} from "recharts";

const DEFAULT_HOURS = 10;

interface LineEfficiency {
  line: string;
  planned: number;
  actual: number;
  manpower: number;
  smv: number;
  efficiency: number;
  targetOutput: number;
}

function computeLineEfficiencies(): LineEfficiency[] {
  const records = getAll("plan_sewing");
  const lineMap = new Map<string, { planned: number; actual: number; manpower: number; smv: number; availMin: number; earnedMin: number }>();

  for (const r of records) {
    const line = r.lineNo || "Unassigned";
    const mp = Number(r.manpower) || 0;
    const smv = Number(r.smv) || 0;
    const hours = Number(r.workingHours) || DEFAULT_HOURS;
    const planned = Number(r.plannedQty) || 0;
    const actual = Number(r.actualQty) || 0;

    if (!lineMap.has(line)) {
      lineMap.set(line, { planned: 0, actual: 0, manpower: 0, smv: 0, availMin: 0, earnedMin: 0 });
    }
    const entry = lineMap.get(line)!;
    entry.planned += planned;
    entry.actual += actual;
    entry.manpower += mp;
    if (smv > 0) entry.smv = smv; // use latest SMV
    entry.availMin += mp * hours * 60;
    entry.earnedMin += actual * smv;
  }

  return Array.from(lineMap.entries()).map(([line, d]) => ({
    line,
    planned: d.planned,
    actual: d.actual,
    manpower: d.manpower,
    smv: d.smv,
    efficiency: d.availMin > 0 ? Math.round((d.earnedMin / d.availMin) * 100) : 0,
    targetOutput: d.smv > 0 ? Math.floor(d.availMin / d.smv) : 0,
  }));
}

function computeDateTrend(): { date: string; efficiency: number; planned: number; actual: number }[] {
  const records = getAll("plan_sewing");
  const dateMap = new Map<string, { availMin: number; earnedMin: number; planned: number; actual: number }>();

  for (const r of records) {
    const date = r.planDate || r.startDate;
    if (!date) continue;
    const mp = Number(r.manpower) || 0;
    const smv = Number(r.smv) || 0;
    const hours = Number(r.workingHours) || DEFAULT_HOURS;
    const planned = Number(r.plannedQty) || 0;
    const actual = Number(r.actualQty) || 0;

    if (!dateMap.has(date)) {
      dateMap.set(date, { availMin: 0, earnedMin: 0, planned: 0, actual: 0 });
    }
    const entry = dateMap.get(date)!;
    entry.availMin += mp * hours * 60;
    entry.earnedMin += actual * smv;
    entry.planned += planned;
    entry.actual += actual;
  }

  return Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, d]) => ({
      date,
      efficiency: d.availMin > 0 ? Math.round((d.earnedMin / d.availMin) * 100) : 0,
      planned: d.planned,
      actual: d.actual,
    }));
}

export function EfficiencyByLineChart() {
  const data = useMemo(computeLineEfficiencies, []);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No sewing plans with line data found. Add sewing plans with Line No, Manpower, and SMV to see efficiency charts.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Efficiency by Sewing Line
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="line" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis yAxisId="qty" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis yAxisId="pct" orientation="right" tick={{ fontSize: 11 }} domain={[0, 120]} unit="%" className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => {
                if (name === "Efficiency") return [`${value}%`, name];
                return [value.toLocaleString(), name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="qty" dataKey="planned" name="Planned" fill="hsl(var(--primary))" opacity={0.3} radius={[4, 4, 0, 0]} />
            <Bar yAxisId="qty" dataKey="actual" name="Actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Line yAxisId="pct" dataKey="efficiency" name="Efficiency" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EfficiencyTrendChart() {
  const data = useMemo(computeDateTrend, []);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No dated sewing plans found. Add plans with dates to see the efficiency trend.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          Daily Efficiency Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
            <YAxis yAxisId="qty" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis yAxisId="pct" orientation="right" tick={{ fontSize: 11 }} domain={[0, 120]} unit="%" className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => {
                if (name === "Efficiency %") return [`${value}%`, name];
                return [value.toLocaleString(), name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area yAxisId="qty" dataKey="planned" name="Planned" fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
            <Area yAxisId="qty" dataKey="actual" name="Actual" fill="#10b981" fillOpacity={0.15} stroke="#10b981" />
            <Line yAxisId="pct" dataKey="efficiency" name="Efficiency %" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
