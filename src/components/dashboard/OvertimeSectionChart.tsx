import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { getOTBySection } from "@/data/mock-data";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APPLE_TOOLTIP, APPLE_AXIS, APPLE_GRID } from "@/lib/chart-styles";

interface Props { factoryId?: string; }

export function OvertimeSectionChart({ factoryId }: Props) {
  const data = getOTBySection(factoryId);
  const totalOT = data.reduce((s, d) => s + d.otHours, 0);

  return (
    <Card>
      <CardHeader className="pb-1 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[13px] font-semibold flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center">
            <Clock className="h-4 w-4 text-destructive" />
          </div>
          OT by Section
        </CardTitle>
        <Badge variant="secondary" className="text-[10px] font-medium rounded-full px-2.5">{totalOT} hrs</Badge>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={28}>
              <CartesianGrid {...APPLE_GRID} />
              <XAxis dataKey="section" {...APPLE_AXIS} />
              <YAxis {...APPLE_AXIS} />
              <Tooltip contentStyle={APPLE_TOOLTIP} formatter={(value: number, name: string) => {
                if (name === "OT Hours") return [`${value} hrs`, name];
                return [`${value}%`, name];
              }} />
              <Bar dataKey="otHours" radius={[6, 6, 0, 0]} name="OT Hours">
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <LabelList dataKey="otPercent" position="top" style={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 500 }} formatter={(v: number) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
          {data.map(d => (
            <div key={d.section} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
              <span className="text-[10px] text-muted-foreground">{d.section}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
