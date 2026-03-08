import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Wifi, WifiOff, Activity } from "lucide-react";
import { cvCameras, getFactoryInfo } from "@/data/mock-data";

export default function CVCounting() {
  const { selectedFactory } = useOutletContext<{ selectedFactory: string }>();
  const factoryInfo = getFactoryInfo(selectedFactory);
  const cameras = cvCameras.filter(c => selectedFactory === "all" || c.factoryId === selectedFactory);

  const online = cameras.filter(c => c.status === "Online").length;
  const totalPieces = cameras.reduce((s, c) => s + c.piecesCount, 0);
  const totalDefects = cameras.reduce((s, c) => s + c.defectsDetected, 0);
  const avgAccuracy = cameras.length ? +(cameras.reduce((s, c) => s + c.accuracy, 0) / cameras.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{factoryInfo.name} — CV Counting</h1>
        <p className="text-sm text-muted-foreground">Computer vision production counting system</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Cameras Online", value: `${online}/${cameras.length}`, icon: Camera },
          { label: "Pieces Counted", value: totalPieces.toLocaleString(), icon: Activity },
          { label: "Defects Detected", value: totalDefects, icon: Activity },
          { label: "Avg Accuracy", value: `${avgAccuracy}%`, icon: Activity },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              <p className="text-2xl font-bold font-mono mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map(cam => (
          <Card key={cam.id} className={cam.status === "Offline" ? "border-status-critical/30 opacity-75" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4" />
                {cam.name}
                <Badge variant={cam.status === "Online" ? "default" : cam.status === "Calibrating" ? "secondary" : "destructive"} className="ml-auto text-[10px]">
                  {cam.status === "Online" ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                  {cam.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Pieces</p>
                  <p className="text-lg font-bold font-mono">{cam.piecesCount}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Defects</p>
                  <p className="text-lg font-bold font-mono">{cam.defectsDetected}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">Accuracy</p>
                  <p className="text-lg font-bold font-mono">{cam.accuracy}%</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">FPS</p>
                  <p className="text-lg font-bold font-mono">{cam.fps}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Last calibrated: {cam.lastCalibrated}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
