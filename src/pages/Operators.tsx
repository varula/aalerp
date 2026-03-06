import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Award, TrendingUp } from "lucide-react";
import { operators, allLines, type Operator } from "@/data/mock-data";

const OPERATIONS_LIST = [
  "Attach Pocket", "Waistband Join", "Hem Bottom", "Side Seam", "Inseam",
  "Attach Zipper", "Collar Attach", "Sleeve Attach", "Cuff Hem", "Button Hole",
];

export default function OperatorsPage() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [tab, setTab] = useState("directory");

  const filteredOps = useMemo(() =>
    operators
      .filter(o => selectedFactory === "all" || o.factoryId === selectedFactory)
      .filter(o => skillFilter === "all" || o.skillLevel === skillFilter)
      .filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
      ),
    [selectedFactory, skillFilter, search]
  );

  const skillBadge = (level: string) => {
    const map: Record<string, "default" | "secondary" | "outline"> = {
      Expert: "default",
      Intermediate: "secondary",
      Beginner: "outline",
    };
    return <Badge variant={map[level] || "outline"}>{level}</Badge>;
  };

  const effColor = (eff: number) =>
    eff >= 85 ? "text-status-success" : eff >= 65 ? "text-status-warning" : "text-status-critical";

  // Skill Matrix: pick first 20 operators for display
  const matrixOps = filteredOps.slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Operator Management</h1>
        <p className="text-sm text-muted-foreground">Skills, productivity, and workforce analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Operators", value: filteredOps.length, icon: Users },
          { label: "Expert", value: filteredOps.filter(o => o.skillLevel === "Expert").length, icon: Award },
          { label: "Avg Efficiency", value: `${filteredOps.length ? Math.round(filteredOps.reduce((s, o) => s + o.avgEfficiency, 0) / filteredOps.length) : 0}%`, icon: TrendingUp },
          { label: "Avg Attendance", value: `${filteredOps.length ? Math.round(filteredOps.reduce((s, o) => s + o.attendance, 0) / filteredOps.length) : 0}%`, icon: Users },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-8 w-8 text-primary/30" />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold font-mono">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="matrix">Skill Matrix</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search operator..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Skill Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Expert">Expert</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="directory" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Line</TableHead>
                      <TableHead className="text-xs text-center">Skill</TableHead>
                      <TableHead className="text-xs text-right">Efficiency</TableHead>
                      <TableHead className="text-xs text-right">Pieces</TableHead>
                      <TableHead className="text-xs text-right">Attendance</TableHead>
                      <TableHead className="text-xs"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOps.slice(0, 50).map(op => {
                      const line = allLines.find(l => l.id === op.lineId);
                      return (
                        <TableRow key={op.id} className="cursor-pointer" onClick={() => setSelectedOperator(op)}>
                          <TableCell className="font-mono text-sm">{op.id}</TableCell>
                          <TableCell className="text-sm font-medium">{op.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{line?.name || "-"}</TableCell>
                          <TableCell className="text-center">{skillBadge(op.skillLevel)}</TableCell>
                          <TableCell className={`text-right font-mono text-sm font-semibold ${effColor(op.avgEfficiency)}`}>{op.avgEfficiency}%</TableCell>
                          <TableCell className="text-right font-mono text-sm">{op.piecesProduced}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{op.attendance}%</TableCell>
                          <TableCell><Button variant="ghost" size="sm" className="text-xs">View</Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Skill Matrix — Operator × Operation Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sticky left-0 bg-card z-10">Operator</TableHead>
                      {OPERATIONS_LIST.map(op => (
                        <TableHead key={op} className="text-[10px] text-center min-w-[70px] whitespace-nowrap">{op}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matrixOps.map(op => (
                      <TableRow key={op.id}>
                        <TableCell className="text-xs font-medium sticky left-0 bg-card z-10 whitespace-nowrap">
                          {op.name}
                        </TableCell>
                        {OPERATIONS_LIST.map(operation => {
                          const skill = op.operations.find(s => s.operation === operation);
                          if (!skill) return <TableCell key={operation} className="text-center text-xs text-muted-foreground/30">—</TableCell>;
                          const bg = skill.efficiency >= 85
                            ? "bg-status-success/20 text-status-success"
                            : skill.efficiency >= 65
                              ? "bg-status-warning/20 text-status-warning"
                              : "bg-status-critical/20 text-status-critical";
                          return (
                            <TableCell key={operation} className="text-center p-1">
                              <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-mono font-semibold ${bg}`}>
                                {skill.efficiency}%
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Operator Detail Dialog */}
      <Dialog open={!!selectedOperator} onOpenChange={() => setSelectedOperator(null)}>
        <DialogContent className="max-w-lg">
          {selectedOperator && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedOperator.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "ID", value: selectedOperator.id },
                    { label: "Skill Level", value: selectedOperator.skillLevel },
                    { label: "Attendance", value: `${selectedOperator.attendance}%` },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-muted text-center">
                      <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Avg Efficiency</p>
                    <p className={`text-lg font-bold font-mono ${effColor(selectedOperator.avgEfficiency)}`}>{selectedOperator.avgEfficiency}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Pieces Today</p>
                    <p className="text-lg font-bold font-mono">{selectedOperator.piecesProduced}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Idle Time</p>
                    <p className="text-lg font-bold font-mono">{selectedOperator.idleTime} min</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Trained Operations</h4>
                  <div className="space-y-2">
                    {selectedOperator.operations.map(skill => (
                      <div key={skill.operation} className="flex items-center justify-between p-2 rounded bg-muted">
                        <span className="text-sm">{skill.operation}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{skill.skillLevel}</Badge>
                          <span className={`font-mono text-sm font-semibold ${effColor(skill.efficiency)}`}>{skill.efficiency}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
