import { Bell, Search, Sun, Moon, Settings } from "lucide-react";
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
        <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Quick search</span>
        </div>
        <Select value={selectedFactory} onValueChange={onFactoryChange}>
          <SelectTrigger className="w-[200px] h-9 text-sm border-border/60">
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

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-lg">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg">
          <Bell className="h-4 w-4" />
          {pendingAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
        <div className="ml-2 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
            AF
          </div>
        </div>
      </div>
    </header>
  );
}
