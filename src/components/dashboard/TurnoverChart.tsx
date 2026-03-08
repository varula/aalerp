import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { turnoverTrend } from "@/data/mock-data";
import { UserMinus } from "lucide-react";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export function TurnoverChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <UserMinus className="h-4 w-4 text-primary" />
          Employee Turnover Rate (Monthly)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={turnoverTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 10]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="rate" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} name="Turnover %">
                <LabelList dataKey="rate" position="top" style={{ fill: "hsl(var(--foreground))", fontSize: 10, fontWeight: 600 }} formatter={(v: number) => `${v}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
