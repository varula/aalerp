import { createContext, useContext, type ReactNode } from "react";
import { useRealtimeSimulation } from "@/hooks/use-realtime-simulation";
import type { ActivityEvent } from "@/hooks/use-realtime-simulation";
import type { SewingLine, Alert } from "@/data/mock-data";

interface SimulationContextValue {
  lines: SewingLine[];
  alerts: Alert[];
  lastUpdate: Date;
  updatedLineIds: Set<string>;
  updatedAlertIds: Set<string>;
  isLive: boolean;
  activityFeed: ActivityEvent[];
  toggleLive: () => void;
  tick: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const sim = useRealtimeSimulation(5000);
  return (
    <SimulationContext.Provider value={sim}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
