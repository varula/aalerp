import { Bell, ChevronDown, Sun, Moon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { factories, alerts } from "@/data/mock-data";
import { useTheme } from "@/hooks/use-theme";

interface AppHeaderProps {
  selectedFactory: string;
  onFactoryChange: (factoryId: string) => void;
}

export function AppHeader({ selectedFactory, onFactoryChange }: AppHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const pendingAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="h-14 border-b bg-card/80 glass flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Select value={selectedFactory} onValueChange={onFactoryChange}>
          <SelectTrigger className="w-[220px] h-9 text-sm">
            <SelectValue placeholder="Select Factory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Factories</SelectItem>
            {factories.map(f => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {pendingAlerts > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-status-critical text-destructive-foreground border-0">
              {pendingAlerts}
            </Badge>
          )}
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
          FM
        </div>
      </div>
    </header>
  );
}
