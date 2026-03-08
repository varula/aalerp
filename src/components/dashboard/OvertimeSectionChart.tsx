import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { getOTBySection } from "@/data/mock-data";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  boxShadow: "0 8px 32px -8px hsl(var(--foreground) / 0.12)",
};

interface Props { factoryId?: string; }

export function OvertimeSectionChart({ factoryId }: Props) {
  const data = getOTBySection(factoryId);
  const totalOT = data.reduce((s, d) => s + d.otHours, 0);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-5/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-chart-5" />
          </div>
          OT Hours by Section / Floor
        </CardTitle>
        <Badge variant="secondary" className="text-[10px] font-mono">Total: {totalOT} hrs</Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="section" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "OT Hours", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 9 } }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number, name: string) => {
                if (name === "OT Hours") return [`${value} hrs`, name];
                return [`${value}%`, name];
              }} />
              <Bar dataKey="otHours" radius={[8, 8, 0, 0]} name="OT Hours">
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <LabelList dataKey="otPercent" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 700 }} formatter={(v: number) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend with sections */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {data.map(d => (
            <div key={d.section} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
              <span className="text-[9px] text-muted-foreground font-medium">{d.section}: {d.otHours}h ({d.otPercent}%)</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
