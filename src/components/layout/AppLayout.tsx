import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationProvider, useSimulation } from "@/hooks/use-simulation-context";
import { ActivityFeedToggle } from "@/components/ActivityFeed";

function LayoutInner() {
  const [selectedFactory, setSelectedFactory] = useState("all");
  const location = useLocation();
  const { activityFeed, lastUpdate } = useSimulation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader selectedFactory={selectedFactory} onFactoryChange={setSelectedFactory} />
          <main className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Outlet context={{ selectedFactory }} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <ActivityFeedToggle events={activityFeed} lastUpdate={lastUpdate} />
      </div>
    </SidebarProvider>
  );
}

export default function AppLayout() {
  return (
    <SimulationProvider>
      <LayoutInner />
    </SimulationProvider>
  );
}
