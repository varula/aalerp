import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from "recharts";
import { getFactoryChartData, laborProductivity } from "@/data/mock-data";
import { Users } from "lucide-react";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

const BAR_COLORS = [
  "hsl(82, 55%, 42%)", "hsl(142, 60%, 45%)", "hsl(200, 70%, 50%)", "hsl(280, 45%, 55%)", "hsl(38, 92%, 50%)",
];

interface Props { factoryId?: string; }

export function LaborProductivityChart({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).laborProductivity : laborProductivity;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-chart-1" />
          </div>
          Labor Productivity by Department
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="dept" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "pcs/operator", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 9 } }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="productivity" radius={[8, 8, 0, 0]} name="Pcs/Operator">
                {data.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
                <LabelList dataKey="productivity" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
