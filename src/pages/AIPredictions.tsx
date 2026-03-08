import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Zap, Lightbulb } from "lucide-react";
import { aiPredictions, getFactoryInfo } from "@/data/mock-data";

export default function AIPredictions() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const factoryInfo = getFactoryInfo(selectedFactory);
  const predictions = aiPredictions.filter(p => selectedFactory === "all" || p.factoryId === selectedFactory);

  const highImpact = predictions.filter(p => p.impact === "High").length;
  const avgConfidence = predictions.length ? Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length) : 0;

  const typeIcon = (type: string) => {
    switch (type) {
      case "Efficiency": return <TrendingUp className="h-4 w-4 text-primary" />;
      case "Quality": return <Zap className="h-4 w-4 text-status-warning" />;
      case "Delivery": return <AlertTriangle className="h-4 w-4 text-status-critical" />;
      case "Downtime": return <AlertTriangle className="h-4 w-4 text-status-warning" />;
      case "Defect": return <Zap className="h-4 w-4 text-status-critical" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const impactColor = (impact: string) => impact === "High" ? "destructive" : impact === "Medium" ? "secondary" : "outline";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — AI Predictions</h1>
        <p className="text-sm text-muted-foreground">Machine learning powered production insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Active Predictions</p>
            <p className="text-2xl font-bold font-mono mt-1">{predictions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">High Impact</p>
            <p className="text-2xl font-bold font-mono mt-1 text-status-critical">{highImpact}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Avg Confidence</p>
            <p className="text-2xl font-bold font-mono mt-1">{avgConfidence}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {predictions.map(pred => (
          <Card key={pred.id} className={pred.impact === "High" ? "border-status-critical/30" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {typeIcon(pred.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="text-[10px]">{pred.type}</Badge>
                    <Badge variant={impactColor(pred.impact) as any} className="text-[10px]">{pred.impact} Impact</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono ml-auto">{pred.confidence}% confidence</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{pred.prediction}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pred.details}</p>
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Recommendation</p>
                      <p className="text-xs text-foreground mt-0.5">{pred.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
