import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { absenteeismHeatmap } from "@/data/mock-data";
import { CalendarDays } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const depts = ["Cutting", "Sewing", "Finishing", "Quality", "Stores"];

function getCellColor(rate: number): string {
  if (rate < 4) return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200";
  if (rate < 7) return "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200";
  if (rate < 10) return "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200";
  return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200";
}

export function AbsenteeismHeatmap() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Worker Absenteeism Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-[10px] text-muted-foreground font-medium text-left py-1 pr-2 w-20">Dept</th>
                {days.map(d => (
                  <th key={d} className="text-[10px] text-muted-foreground font-medium text-center py-1 px-1">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depts.map(dept => (
                <tr key={dept}>
                  <td className="text-xs font-medium text-foreground py-1 pr-2">{dept}</td>
                  {days.map(day => {
                    const entry = absenteeismHeatmap.find(e => e.dept === dept && e.day === day);
                    const rate = entry?.rate || 0;
                    return (
                      <td key={day} className="py-1 px-1">
                        <div className={`rounded-md text-center py-2 px-1 text-[11px] font-mono font-semibold ${getCellColor(rate)}`}>
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
        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 justify-center">
          {[
            { label: "<4%", cls: "bg-emerald-100 dark:bg-emerald-900/40" },
            { label: "4-7%", cls: "bg-amber-100 dark:bg-amber-900/40" },
            { label: "7-10%", cls: "bg-orange-100 dark:bg-orange-900/40" },
            { label: ">10%", cls: "bg-red-100 dark:bg-red-900/40" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`h-3 w-3 rounded-sm ${l.cls}`} />
              <span className="text-[10px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
