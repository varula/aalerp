import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertRulesProvider } from "@/hooks/use-alert-rules";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Index";
import ProductionOrders from "@/pages/ProductionOrders";
import Operators from "@/pages/Operators";
import SewingLines from "@/pages/SewingLines";
import Alerts from "@/pages/Alerts";
import Reports from "@/pages/Reports";
import WipTracking from "@/pages/WipTracking";
import TvDisplay from "@/pages/TvDisplay";
import FactoryKPIs from "@/pages/FactoryKPIs";
import QualityDashboard from "@/pages/QualityDashboard";
import Machines from "@/pages/Machines";
import AIPredictions from "@/pages/AIPredictions";
import DowntimeTracking from "@/pages/DowntimeTracking";
import OvertimeModule from "@/pages/OvertimeModule";
import MaterialTracking from "@/pages/MaterialTracking";
import CVCounting from "@/pages/CVCounting";
import NotFound from "@/pages/NotFound";
import { SectionModulesPage, CrudModulePage } from "@/components/CrudModule";
import PlanningModules from "@/pages/PlanningModules";
import PlanningOverview from "@/pages/PlanningOverview";
import { StandaloneCrudPage } from "@/components/StandaloneCrudPage";
import DepartmentDashboard from "@/pages/DepartmentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AlertRulesProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Overview */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/kpis" element={<FactoryKPIs />} />
              {/* Department Dashboards */}
              <Route path="/dept/cutting" element={<DepartmentDashboard department="Cutting" />} />
              <Route path="/dept/sewing" element={<DepartmentDashboard department="Sewing" />} />
              <Route path="/dept/finishing" element={<DepartmentDashboard department="Finishing" />} />
              {/* Production */}
              <Route path="/orders" element={<ProductionOrders />} />
              <Route path="/lines" element={<SewingLines />} />
              <Route path="/wip" element={<WipTracking />} />
              <Route path="/cut-to-pack" element={<StandaloneCrudPage moduleKey="cut-to-pack" />} />
              {/* Quality */}
              <Route path="/quality" element={<QualityDashboard />} />
              <Route path="/inspections" element={<StandaloneCrudPage moduleKey="inspections" />} />
              <Route path="/defects" element={<StandaloneCrudPage moduleKey="defects" />} />
              {/* Resources */}
              <Route path="/operators" element={<Operators />} />
              <Route path="/machines" element={<Machines />} />
              <Route path="/skills" element={<StandaloneCrudPage moduleKey="skills" />} />
              <Route path="/attendance" element={<StandaloneCrudPage moduleKey="attendance" />} />
              {/* AI & Automation */}
              <Route path="/ai-predictions" element={<AIPredictions />} />
              <Route path="/cv-counting" element={<CVCounting />} />
              <Route path="/ai-defects" element={<StandaloneCrudPage moduleKey="ai-defects" />} />
              {/* Operations */}
              <Route path="/overtime" element={<OvertimeModule />} />
              <Route path="/downtime" element={<DowntimeTracking />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/materials" element={<MaterialTracking />} />
              {/* Analytics */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/buyer-analytics" element={<StandaloneCrudPage moduleKey="buyer-analytics" />} />
              {/* Advanced */}
              <Route path="/digital-twin" element={<StandaloneCrudPage moduleKey="digital-twin" />} />
              <Route path="/benchmarking" element={<StandaloneCrudPage moduleKey="benchmarking" />} />
              {/* Administration */}
              <Route path="/master-data" element={<StandaloneCrudPage moduleKey="master-data" />} />
              <Route path="/settings" element={<StandaloneCrudPage moduleKey="settings" />} />
              <Route path="/tv" element={<TvDisplay />} />
              {/* Planning */}
              <Route path="/planning" element={<PlanningModules />} />
              <Route path="/planning-overview" element={<PlanningOverview />} />
              {/* CRUD Module Routes */}
              <Route path="/modules/:sectionSlug" element={<SectionModulesPage />} />
              <Route path="/modules/:sectionSlug/:moduleSlug" element={<CrudModulePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AlertRulesProvider>
  </QueryClientProvider>
);

export default App;
