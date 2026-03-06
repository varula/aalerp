import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export default function AppLayout() {
  const [selectedFactory, setSelectedFactory] = useState("all");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader selectedFactory={selectedFactory} onFactoryChange={setSelectedFactory} />
          <main className="flex-1 overflow-auto p-6">
            <Outlet context={{ selectedFactory }} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
