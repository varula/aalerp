import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFactoryChartData, absenteeismHeatmap } from "@/data/mock-data";
import { CalendarDays } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const depts = ["Cutting", "Sewing", "Finishing", "Quality", "Stores"];

function getCellColor(rate: number): string {
  if (rate < 4) return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300";
  if (rate < 7) return "bg-amber-500/20 text-amber-700 dark:text-amber-300";
  if (rate < 10) return "bg-orange-500/20 text-orange-700 dark:text-orange-300";
  return "bg-red-500/20 text-red-700 dark:text-red-300";
}

function getCellBg(rate: number): string {
  if (rate < 4) return "rgba(16, 185, 129, 0.15)";
  if (rate < 7) return "rgba(245, 158, 11, 0.15)";
  if (rate < 10) return "rgba(249, 115, 22, 0.2)";
  return "rgba(239, 68, 68, 0.2)";
}

interface Props { factoryId?: string; }

export function AbsenteeismHeatmap({ factoryId }: Props) {
  const data = factoryId ? getFactoryChartData(factoryId).absenteeismHeatmap : absenteeismHeatmap;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-chart-3/10 flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-chart-3" />
          </div>
          Absenteeism Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-[10px] text-muted-foreground font-semibold text-left py-1 pr-2 w-20"></th>
                {days.map(d => (
                  <th key={d} className="text-[10px] text-muted-foreground font-semibold text-center py-1 px-1">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depts.map(dept => (
                <tr key={dept}>
                  <td className="text-[11px] font-semibold text-foreground py-1 pr-2">{dept}</td>
                  {days.map(day => {
                    const entry = data.find(e => e.dept === dept && e.day === day);
                    const rate = entry?.rate || 0;
                    return (
                      <td key={day} className="py-0.5 px-0.5">
                        <div
                          className={`rounded-lg text-center py-2.5 px-1 text-[11px] font-mono font-bold transition-all hover:scale-105 cursor-default ${getCellColor(rate)}`}
                          style={{ backgroundColor: getCellBg(rate) }}
                          title={`${dept} ${day}: ${rate}%`}
                        >
                          {rate}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          {[
            { label: "< 4% Good", color: "rgba(16, 185, 129, 0.15)" },
            { label: "4-7% Fair", color: "rgba(245, 158, 11, 0.15)" },
            { label: "7-10% Poor", color: "rgba(249, 115, 22, 0.2)" },
            { label: "> 10% Critical", color: "rgba(239, 68, 68, 0.2)" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-3 w-6 rounded" style={{ backgroundColor: l.color }} />
              <span className="text-[9px] text-muted-foreground font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
