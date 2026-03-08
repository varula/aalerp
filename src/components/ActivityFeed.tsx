import { useState } from "react";
import { Activity, X, TrendingUp, TrendingDown, AlertTriangle, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/hooks/use-realtime-simulation";

interface ActivityFeedProps {
  events: ActivityEvent[];
  lastUpdate: Date;
}

export function ActivityFeedToggle({ events, lastUpdate }: ActivityFeedProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "fixed bottom-5 right-5 z-50 h-11 w-11 rounded-full shadow-lg border-border/60",
          "bg-card hover:bg-accent transition-all",
          events.length > 0 && "ring-2 ring-primary/30",
        )}
      >
        <Activity className="h-5 w-5 text-primary" />
        {events.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {Math.min(events.length, 20)}
          </span>
        )}
      </Button>

      {/* Slide-out panel */}
      {open && (
        <div className="fixed inset-y-0 right-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="relative ml-auto w-80 bg-card border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary animate-pulse" />
                <h3 className="text-sm font-semibold text-foreground">Activity Feed</h3>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {events.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Live indicator */}
            <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                Last update: {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>

            {/* Events list */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {events.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No activity yet — waiting for data...
                  </p>
                )}
                {events.slice(0, 20).map((evt, i) => (
                  <div
                    key={evt.id}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg p-2.5 transition-all text-sm",
                      i === 0 && "animate-slide-in-up",
                      evt.severity === "critical" && "bg-destructive/5 border border-destructive/20",
                      evt.severity === "warning" && "bg-status-warning/5 border border-status-warning/20",
                      evt.severity === "normal" && "bg-muted/50 border border-border/40",
                    )}
                  >
                    <EventIcon type={evt.type} severity={evt.severity} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug text-foreground">{evt.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        {evt.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground text-center">
              Showing last {Math.min(events.length, 20)} events
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EventIcon({ type, severity }: { type: ActivityEvent["type"]; severity: ActivityEvent["severity"] }) {
  const sizeClass = "h-4 w-4 shrink-0 mt-0.5";

  if (type === "alert") {
    return <AlertTriangle className={cn(sizeClass, severity === "critical" ? "text-destructive" : "text-status-warning")} />;
  }
  if (type === "status") {
    return (
      <div className={cn(
        "h-4 w-4 shrink-0 mt-0.5 rounded-full",
        severity === "critical" ? "bg-destructive animate-pulse" : severity === "warning" ? "bg-status-warning" : "bg-status-success",
      )} />
    );
  }
  // efficiency
  return severity === "critical" || severity === "warning"
    ? <TrendingDown className={cn(sizeClass, "text-destructive")} />
    : <TrendingUp className={cn(sizeClass, "text-status-success")} />;
}
