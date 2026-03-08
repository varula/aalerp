import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { dhuTrend } from "@/data/mock-data";
import { Shield } from "lucide-react";

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export function DHUControlChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          DHU Trend — Control Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dhuTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis domain={[0, 7]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend />
              <ReferenceLine y={5} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label={{ value: "UCL", fill: "hsl(var(--destructive))", fontSize: 9 }} />
              <ReferenceLine y={2.5} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: "CL", fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
              <ReferenceLine y={0.5} stroke="hsl(var(--chart-2))" strokeDasharray="4 4" label={{ value: "LCL", fill: "hsl(var(--chart-2))", fontSize: 9 }} />
              <Line type="monotone" dataKey="dhu" stroke="hsl(var(--chart-5))" strokeWidth={2.5} dot={{ fill: "hsl(var(--chart-5))", r: 3.5 }} name="DHU %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
