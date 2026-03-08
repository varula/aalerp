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
import MaterialTracking from "@/pages/MaterialTracking";
import CVCounting from "@/pages/CVCounting";
import ComingSoon from "@/pages/ComingSoon";
import NotFound from "@/pages/NotFound";
import { SectionModulesPage, CrudModulePage } from "@/components/CrudModule";
import PlanningModules from "@/pages/PlanningModules";
import PlanningOverview from "@/pages/PlanningOverview";

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
              {/* Production */}
              <Route path="/orders" element={<ProductionOrders />} />
              <Route path="/lines" element={<SewingLines />} />
              <Route path="/wip" element={<WipTracking />} />
              <Route path="/cut-to-pack" element={<ComingSoon title="Cut to Pack Flow" description="End-to-end cutting to packing tracking" />} />
              {/* Quality */}
              <Route path="/quality" element={<QualityDashboard />} />
              <Route path="/inspections" element={<ComingSoon title="Inspections" description="Detailed inspection management" />} />
              <Route path="/defects" element={<ComingSoon title="Defect Analysis" description="In-depth defect trend analysis" />} />
              {/* Resources */}
              <Route path="/operators" element={<Operators />} />
              <Route path="/machines" element={<Machines />} />
              <Route path="/skills" element={<ComingSoon title="Skill Matrix" description="Operator skill assessment and training" />} />
              <Route path="/attendance" element={<ComingSoon title="Attendance" description="Worker attendance and shift management" />} />
              {/* AI & Automation */}
              <Route path="/ai-predictions" element={<AIPredictions />} />
              <Route path="/cv-counting" element={<CVCounting />} />
              <Route path="/ai-defects" element={<ComingSoon title="AI Defect Detection" description="Computer vision powered defect detection" />} />
              {/* Operations */}
              <Route path="/downtime" element={<DowntimeTracking />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/materials" element={<MaterialTracking />} />
              {/* Analytics */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/buyer-analytics" element={<ComingSoon title="Buyer Analytics" description="Buyer-wise performance analytics" />} />
              {/* Advanced */}
              <Route path="/digital-twin" element={<ComingSoon title="Digital Twin" description="Factory simulation and scenario modeling" />} />
              <Route path="/benchmarking" element={<ComingSoon title="Benchmarking" description="Cross-factory performance benchmarking" />} />
              {/* Administration */}
              <Route path="/master-data" element={<ComingSoon title="Master Data" description="Factory, line, and style master data management" />} />
              <Route path="/settings" element={<ComingSoon title="Settings" description="System configuration and preferences" />} />
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
