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
import NotFound from "@/pages/NotFound";
import NotFound from "@/pages/NotFound";

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
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<ProductionOrders />} />
              <Route path="/lines" element={<SewingLines />} />
              <Route path="/operators" element={<Operators />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/wip" element={<WipTracking />} />
              <Route path="/tv" element={<TvDisplay />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AlertRulesProvider>
  </QueryClientProvider>
);

export default App;
